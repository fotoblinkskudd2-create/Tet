"""
Onboarding API routes
The initial "How fucked are you?" assessment
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib
import secrets

from ..database import get_db
from ..models import User, ConsequenceData, UserPreference
from ..schemas import OnboardingRequest, OnboardingResponse

router = APIRouter()


@router.post("/", response_model=OnboardingResponse)
async def onboard_user(
    request: OnboardingRequest,
    db: Session = Depends(get_db)
):
    """
    Initial onboarding assessment.
    No pretense. Just brutal honesty about where they are.
    """

    # Create user
    encryption_key = secrets.token_hex(32)
    encryption_key_hash = hashlib.sha256(encryption_key.encode()).hexdigest()

    user = User(
        encryption_key_hash=encryption_key_hash,
        onboarding_complete=True
    )
    db.add(user)
    db.flush()

    # Create consequence tracking if debt provided
    if request.debt_amount:
        consequence = ConsequenceData(
            user_id=user.id,
            debt_amount=request.debt_amount,
            debt_currency="NOK",
            next_payment_due=None,  # can be updated later
            skills_market_value=0,  # will be calculated
            job_probability=0.0  # will be calculated
        )
        db.add(consequence)

    # Create user preferences
    preferences = UserPreference(
        user_id=user.id,
        learning_goals={
            "primary_goal": request.primary_goal,
            "situation": request.current_situation,
            "has_did": request.has_did,
            "chaos_level": request.chaos_level
        }
    )
    db.add(preferences)

    db.commit()
    db.refresh(user)

    # Generate assessment message based on chaos level
    if request.chaos_level >= 80:
        assessment = "You're in deep. But you showed up. That's something."
        path = "Start with 5-minute modules. Build momentum. Don't think, just do."
    elif request.chaos_level >= 50:
        assessment = "Rough but not critical. You can pull out of this."
        path = "15-minute learning blocks. Consistent small wins."
    else:
        assessment = "You're functional. Use that while you have it."
        path = "30-minute deep work. Build skills fast."

    # Add debt context if provided
    if request.debt_amount:
        if request.debt_amount > 200000:
            assessment += f" {request.debt_amount} kr debt. That's a kreftsvulst. We know."
        path += f" Targeting job-ready skills. Market value matters, not theory."

    return OnboardingResponse(
        user_id=user.id,
        message="No bullshit. No 'you got this'. Just a path forward.",
        initial_assessment=assessment,
        recommended_path=path
    )


@router.get("/assessment/{user_id}")
async def get_assessment(user_id: str, db: Session = Depends(get_db)):
    """Get current user assessment"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    preferences = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    consequence = db.query(ConsequenceData).filter(ConsequenceData.user_id == user_id).first()

    return {
        "user_id": str(user.id),
        "created_at": user.created_at,
        "learning_goals": preferences.learning_goals if preferences else {},
        "debt_amount": float(consequence.debt_amount) if consequence and consequence.debt_amount else None,
        "subscription_tier": user.subscription_tier
    }
