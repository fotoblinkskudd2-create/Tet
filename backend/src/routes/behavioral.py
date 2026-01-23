"""
Behavioral analysis API routes
Real-time mental state detection and intervention
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta

from ..database import get_db
from ..models import MentalStateLog, BehavioralEvent, LearningSession
from ..schemas import (
    BehavioralEventRequest, CurrentStateResponse, InterventionTrigger
)

router = APIRouter()


def analyze_keystroke_rhythm(events: list) -> float:
    """
    Analyze keystroke timing patterns.
    Returns score 0-100 where lower = more irregular (possible dissociation)
    """
    if len(events) < 5:
        return 50.0  # not enough data

    # Calculate inter-keystroke intervals
    intervals = []
    for i in range(1, len(events)):
        if events[i].get('type') == 'keystroke' and events[i-1].get('type') == 'keystroke':
            interval = (events[i]['timestamp'] - events[i-1]['timestamp'])
            intervals.append(interval)

    if not intervals:
        return 50.0

    # Calculate variance in timing
    mean_interval = sum(intervals) / len(intervals)
    variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals)

    # High variance = irregular rhythm = possible dissociation
    # Convert variance to 0-100 score (lower variance = higher score)
    score = max(0, min(100, 100 - (variance / 100)))
    return score


def calculate_cognitive_load(recent_events: list, recent_states: list) -> int:
    """
    Calculate current cognitive load from behavioral patterns.
    Returns 0-100 where higher = more overwhelmed
    """
    if not recent_events:
        return 50  # default

    # Factors that increase cognitive load:
    # - Long pauses between interactions
    # - Rapid, aggressive tapping
    # - Frequent task switching
    # - Decreasing response quality over time

    pause_count = sum(1 for e in recent_events if e.get('event_type') == 'pause')
    total_events = len(recent_events)

    if total_events == 0:
        return 50

    # High pause ratio = high cognitive load
    pause_ratio = pause_count / total_events

    # Calculate base load
    base_load = min(100, int(pause_ratio * 150))

    # Adjust based on recent trend
    if recent_states:
        recent_avg = sum(s.cognitive_load for s in recent_states[-3:]) / len(recent_states[-3:])
        # Smooth with recent history
        load = int(0.6 * base_load + 0.4 * recent_avg)
    else:
        load = base_load

    return max(0, min(100, load))


def classify_mental_state(cognitive_load: int, keystroke_score: float) -> str:
    """
    Classify current mental state based on metrics.
    Returns: focused/dissociated/frustrated/overwhelmed/flow
    """
    if cognitive_load < 30 and keystroke_score > 70:
        return "flow"
    elif cognitive_load < 50 and keystroke_score > 60:
        return "focused"
    elif keystroke_score < 40:
        return "dissociated"
    elif cognitive_load > 70:
        return "overwhelmed"
    elif cognitive_load > 50:
        return "frustrated"
    else:
        return "neutral"


@router.post("/event")
async def log_behavioral_event(
    request: BehavioralEventRequest,
    db: Session = Depends(get_db)
):
    """
    Log a behavioral event for analysis.
    Called frequently from mobile app during learning sessions.
    """
    event = BehavioralEvent(
        user_id=request.user_id,
        session_id=request.session_id,
        event_type=request.event_type,
        event_data=request.event_data
    )
    db.add(event)
    db.commit()

    return {"status": "logged", "event_id": event.id}


@router.get("/current-state", response_model=CurrentStateResponse)
async def get_current_state(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current mental state analysis.
    Used to adapt learning content in real-time.
    """
    # Get recent behavioral events (last 10 minutes)
    ten_min_ago = datetime.utcnow() - timedelta(minutes=10)
    recent_events = db.query(BehavioralEvent).filter(
        BehavioralEvent.user_id == user_id,
        BehavioralEvent.timestamp >= ten_min_ago
    ).order_by(BehavioralEvent.timestamp).all()

    # Get recent mental state logs (for trend analysis)
    recent_states = db.query(MentalStateLog).filter(
        MentalStateLog.user_id == user_id
    ).order_by(desc(MentalStateLog.timestamp)).limit(10).all()

    # Convert to simple list for analysis
    event_data = [
        {
            'event_type': e.event_type,
            'timestamp': e.timestamp.timestamp(),
            'data': e.event_data
        }
        for e in recent_events
    ]

    # Analyze
    keystroke_score = analyze_keystroke_rhythm(event_data)
    cognitive_load = calculate_cognitive_load(event_data, recent_states)
    state = classify_mental_state(cognitive_load, keystroke_score)

    # Determine if this is an optimal learning window
    optimal = (cognitive_load < 60 and state in ['focused', 'flow'])

    # Store this state assessment
    state_log = MentalStateLog(
        user_id=user_id,
        cognitive_load=cognitive_load,
        state_classification=state,
        keystroke_rhythm_score=keystroke_score,
        interaction_pattern_score=keystroke_score,  # simplified for now
        learning_window_optimal=optimal
    )
    db.add(state_log)
    db.commit()

    # Generate recommendation
    if state == "dissociated":
        recommendation = "You're dissociating. Take 90 seconds. Look away from screen."
    elif state == "overwhelmed":
        recommendation = "Cognitive overload detected. Switching to shorter module."
    elif state == "frustrated":
        recommendation = "Frustration building. Take a breath. We'll adjust difficulty."
    elif state == "flow":
        recommendation = "You're in flow. Keep going. More content coming."
    else:
        recommendation = "Continue learning."

    return CurrentStateResponse(
        cognitive_load=cognitive_load,
        state_classification=state,
        learning_window_optimal=optimal,
        detected_part_id=None,  # TODO: implement DID part detection
        recommendation=recommendation
    )


@router.post("/intervention")
async def trigger_intervention(
    intervention: InterventionTrigger,
    db: Session = Depends(get_db)
):
    """
    System triggers an intervention during learning session.
    Called when behavioral analysis detects need for pause/adjustment.
    """
    session = db.query(LearningSession).filter(
        LearningSession.id == intervention.session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Increment intervention counter
    session.interventions_triggered += 1
    db.commit()

    # Log what happened
    return {
        "intervention_logged": True,
        "type": intervention.trigger_type,
        "reason": intervention.reason,
        "total_interventions": session.interventions_triggered
    }


@router.get("/patterns/{user_id}")
async def get_user_patterns(user_id: str, db: Session = Depends(get_db)):
    """
    Get behavioral patterns for user.
    Shows when they learn best, common states, etc.
    """
    # Get state logs from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    states = db.query(MentalStateLog).filter(
        MentalStateLog.user_id == user_id,
        MentalStateLog.timestamp >= thirty_days_ago
    ).all()

    if not states:
        return {
            "message": "Not enough data yet. Keep using the app.",
            "patterns": None
        }

    # Calculate patterns
    total_states = len(states)
    state_counts = {}
    optimal_hours = {}

    for state in states:
        # Count state types
        state_type = state.state_classification
        state_counts[state_type] = state_counts.get(state_type, 0) + 1

        # Track optimal learning windows by hour
        if state.learning_window_optimal:
            hour = state.timestamp.hour
            optimal_hours[hour] = optimal_hours.get(hour, 0) + 1

    # Convert to percentages
    state_percentages = {
        state: (count / total_states * 100)
        for state, count in state_counts.items()
    }

    # Find best learning times (hours with most optimal windows)
    best_times = sorted(optimal_hours.items(), key=lambda x: x[1], reverse=True)[:3]
    best_time_ranges = [
        f"{hour:02d}:00-{hour+1:02d}:00"
        for hour, count in best_times
    ]

    return {
        "state_distribution": state_percentages,
        "best_learning_times": best_time_ranges,
        "average_cognitive_load": sum(s.cognitive_load for s in states) / total_states,
        "total_assessments": total_states
    }
