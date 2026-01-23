"""
Learning session API routes
The core learning experience
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta
import random

from ..database import get_db
from ..models import User, LearningSession, LearningModule, MentalStateLog
from ..schemas import (
    SessionStartRequest, SessionStartResponse,
    NextModuleResponse, SessionCompleteRequest, SessionCompleteResponse,
    InteractionEvent
)

router = APIRouter()


@router.post("/start", response_model=SessionStartResponse)
async def start_session(
    request: SessionStartRequest,
    db: Session = Depends(get_db)
):
    """
    Start a new learning session.
    """
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if there's an active session
    active_session = db.query(LearningSession).filter(
        LearningSession.user_id == request.user_id,
        LearningSession.ended_at.is_(None)
    ).first()

    if active_session:
        return SessionStartResponse(
            session_id=active_session.id,
            message="Continuing previous session. Pick up where you left off."
        )

    # Create new session (module assigned when they request next-module)
    session = LearningSession(
        user_id=request.user_id,
        module_id=None,  # assigned in next-module endpoint
        completion_rate=0.0
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionStartResponse(
        session_id=session.id,
        message="Session started. Get ready."
    )


@router.get("/next-module", response_model=NextModuleResponse)
async def get_next_module(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    AI selects the next learning module.
    No choices. No browsing. Just: "Learn this. Now."
    """
    session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    user = db.query(User).filter(User.id == session.user_id).first()

    # Get user's current mental state
    recent_state = db.query(MentalStateLog).filter(
        MentalStateLog.user_id == session.user_id
    ).order_by(desc(MentalStateLog.timestamp)).first()

    # Determine optimal module length based on cognitive load
    if recent_state and recent_state.cognitive_load:
        if recent_state.cognitive_load > 70:
            max_duration = 7  # short modules when overwhelmed
        elif recent_state.cognitive_load < 30:
            max_duration = 45  # longer when in flow
        else:
            max_duration = 15  # moderate
    else:
        max_duration = 15  # default

    # Get completed modules for this user
    completed_module_ids = db.query(LearningSession.module_id).filter(
        LearningSession.user_id == session.user_id,
        LearningSession.completion_rate >= 0.7,  # 70% completion counts
        LearningSession.module_id.isnot(None)
    ).all()
    completed_ids = [m[0] for m in completed_module_ids]

    # Select next module
    # TODO: This should use the AI path selection engine
    # For now, simple selection: next uncompleted module within duration limit
    next_module = db.query(LearningModule).filter(
        ~LearningModule.id.in_(completed_ids) if completed_ids else True,
        LearningModule.estimated_duration_min <= max_duration
    ).first()

    if not next_module:
        # No modules available - need to add content
        raise HTTPException(
            status_code=404,
            detail="No suitable modules available. This is a content gap, not your fault."
        )

    # Update session with selected module
    session.module_id = next_module.id
    db.commit()

    # Generate the directive message
    message = f"Now learn this: {next_module.skill_specific}. {next_module.estimated_duration_min} minutes. Start."

    return NextModuleResponse(
        module_id=next_module.id,
        skill_category=next_module.skill_category,
        skill_specific=next_module.skill_specific,
        estimated_duration_min=next_module.estimated_duration_min,
        content_type=next_module.content_type,
        content_data=next_module.content_data,
        message=message
    )


@router.post("/interaction")
async def log_interaction(
    event: InteractionEvent,
    db: Session = Depends(get_db)
):
    """
    Log user interaction for behavioral analysis.
    Used to detect dissociation, frustration, flow state.
    """
    session = db.query(LearningSession).filter(LearningSession.id == event.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Store raw behavioral event
    from ..models import BehavioralEvent
    behavioral_event = BehavioralEvent(
        user_id=session.user_id,
        session_id=event.session_id,
        timestamp=event.timestamp,
        event_type=event.event_type,
        event_data=event.event_data
    )
    db.add(behavioral_event)
    db.commit()

    return {"status": "logged"}


@router.post("/complete", response_model=SessionCompleteResponse)
async def complete_session(
    request: SessionCompleteRequest,
    db: Session = Depends(get_db)
):
    """
    Complete a learning session.
    Show what was gained. No celebration unless earned.
    """
    session = db.query(LearningSession).filter(LearningSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.ended_at = datetime.utcnow()
    session.completion_rate = request.completion_rate
    session.final_assessment_score = request.self_assessment

    db.commit()

    # Get the module details
    module = db.query(LearningModule).filter(LearningModule.id == session.module_id).first()

    # Determine message based on completion rate
    if request.completion_rate >= 0.9:
        message = "Completed. Good work."
        skills_gained = [f"{module.skill_specific}"] if module else []
    elif request.completion_rate >= 0.6:
        message = "Partial completion. Better than nothing."
        skills_gained = [f"{module.skill_specific} (partial)"] if module else []
    else:
        message = "Low completion. Try again when you're more focused."
        skills_gained = []

    # Calculate total learning time this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    week_sessions = db.query(
        func.sum(
            func.extract('epoch', LearningSession.ended_at - LearningSession.started_at) / 60
        )
    ).filter(
        LearningSession.user_id == session.user_id,
        LearningSession.started_at >= week_ago,
        LearningSession.ended_at.isnot(None)
    ).scalar()

    hours_this_week = (week_sessions or 0) / 60

    # Recommendation for next session
    if hours_this_week < 5:
        next_rec = "You need more hours. 5 hours minimum this week."
    elif hours_this_week >= 10:
        next_rec = "Strong progress. Keep the momentum."
    else:
        next_rec = "Decent pace. Don't slow down now."

    return SessionCompleteResponse(
        message=message,
        skills_gained=skills_gained,
        next_session_recommendation=next_rec
    )


@router.get("/active/{user_id}")
async def get_active_session(user_id: str, db: Session = Depends(get_db)):
    """Get active session for user if exists"""
    session = db.query(LearningSession).filter(
        LearningSession.user_id == user_id,
        LearningSession.ended_at.is_(None)
    ).first()

    if not session:
        return {"active_session": None}

    return {
        "active_session": {
            "session_id": str(session.id),
            "started_at": session.started_at,
            "module_id": str(session.module_id) if session.module_id else None
        }
    }
