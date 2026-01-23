"""
Dashboard API routes
The brutal math. No sugar coating.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from decimal import Decimal

from ..database import get_db
from ..models import (
    User, LearningSession, LearningModule, ConsequenceData, MentalStateLog
)
from ..schemas import ConsequenceDashboard, ProgressDashboard

router = APIRouter()


def calculate_skill_market_value(completed_skills: list) -> Decimal:
    """
    Calculate market value of acquired skills.
    Based on real job market data (simplified for MVP).
    """
    # Skill value estimates (NOK annual salary impact)
    skill_values = {
        'Python': 80000,
        'JavaScript': 75000,
        'React': 70000,
        'CSS': 40000,
        'HTML': 35000,
        'SQL': 60000,
        'Git': 30000,
        'API': 50000,
        'TypeScript': 65000,
    }

    total_value = Decimal(0)
    for skill in completed_skills:
        # Match skill categories
        for skill_key, value in skill_values.items():
            if skill_key.lower() in skill.lower():
                total_value += Decimal(value)
                break

    return total_value


def estimate_job_probability(
    skills_count: int,
    market_value: Decimal,
    learning_hours: float
) -> float:
    """
    ML-based job probability estimate.
    Simplified algorithm for MVP - will be replaced with real ML model.
    """
    # Factors:
    # - Number of skills (more is better)
    # - Market value (higher is better)
    # - Total learning hours (experience proxy)

    if skills_count == 0:
        return 0.0

    # Base probability from skills
    skill_factor = min(1.0, skills_count / 8)  # 8 skills = 100% of factor

    # Market value factor (assuming 450k target salary)
    value_factor = min(1.0, float(market_value) / 200000)

    # Hours factor (200 hours = experienced enough)
    hours_factor = min(1.0, learning_hours / 200)

    # Combined probability (weighted average)
    probability = (
        0.4 * skill_factor +
        0.35 * value_factor +
        0.25 * hours_factor
    )

    return min(1.0, probability)


@router.get("/consequences/{user_id}", response_model=ConsequenceDashboard)
async def get_consequences(user_id: str, db: Session = Depends(get_db)):
    """
    The brutal math dashboard.
    Shows exactly where you are and where you're headed.
    No motivation. Just facts.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get completed skills
    completed_sessions = db.query(LearningSession, LearningModule).join(
        LearningModule
    ).filter(
        LearningSession.user_id == user_id,
        LearningSession.completion_rate >= 0.7,
        LearningSession.module_id.isnot(None)
    ).all()

    skills_acquired = list(set([
        f"{module.skill_specific}"
        for session, module in completed_sessions
    ]))

    # Calculate total learning hours
    total_minutes = db.query(
        func.sum(
            func.extract('epoch', LearningSession.ended_at - LearningSession.started_at) / 60
        )
    ).filter(
        LearningSession.user_id == user_id,
        LearningSession.ended_at.isnot(None)
    ).scalar() or 0

    total_hours = float(total_minutes) / 60

    # This week's hours
    week_ago = datetime.utcnow() - timedelta(days=7)
    week_minutes = db.query(
        func.sum(
            func.extract('epoch', LearningSession.ended_at - LearningSession.started_at) / 60
        )
    ).filter(
        LearningSession.user_id == user_id,
        LearningSession.started_at >= week_ago,
        LearningSession.ended_at.isnot(None)
    ).scalar() or 0

    week_hours = float(week_minutes) / 60

    # Calculate skill market value
    market_value = calculate_skill_market_value(skills_acquired)

    # Get consequence data (debt, etc)
    consequence = db.query(ConsequenceData).filter(
        ConsequenceData.user_id == user_id
    ).first()

    # Update consequence calculations
    if consequence:
        consequence.skills_market_value = market_value
        consequence.job_probability = estimate_job_probability(
            len(skills_acquired), market_value, total_hours
        )

        # Estimate debt clearance time
        if consequence.debt_amount and consequence.job_probability > 0.5:
            estimated_salary = 450000  # Conservative webdev starting salary
            monthly_salary = Decimal(estimated_salary / 12)
            monthly_debt_payment = monthly_salary * Decimal(0.3)  # 30% to debt
            if monthly_debt_payment > 0:
                months_to_clear = int(consequence.debt_amount / monthly_debt_payment)
                consequence.debt_clear_months = months_to_clear
            else:
                consequence.debt_clear_months = None
        else:
            consequence.debt_clear_months = None

        db.commit()
        db.refresh(consequence)

    # Calculate debt change this week
    debt_change = None
    if consequence and consequence.debt_amount:
        # Simplified - would track actual changes in real version
        debt_change = Decimal(0)  # Placeholder

    # Days until next payment
    days_until_payment = None
    if consequence and consequence.next_payment_due:
        days_until_payment = (consequence.next_payment_due - datetime.utcnow().date()).days

    # PROJECTIONS - THE BRUTAL MATH

    # If they continue current pace
    if week_hours > 0:
        weeks_to_job_ready = max(1, int((200 - total_hours) / week_hours)) if total_hours < 200 else 0
        continue_projection = {
            "weeks_to_job_ready": weeks_to_job_ready,
            "estimated_job_probability": float(consequence.job_probability) if consequence else 0.0,
            "estimated_salary": 450000 if (consequence and consequence.job_probability > 0.5) else 0,
            "debt_clear_months": consequence.debt_clear_months if consequence else None,
            "message": f"Continue {int(week_hours)} hours/week → job ready in {weeks_to_job_ready} weeks → {int((consequence.job_probability if consequence else 0) * 100)}% job probability"
        }
    else:
        continue_projection = {
            "weeks_to_job_ready": None,
            "estimated_job_probability": 0.0,
            "estimated_salary": 0,
            "debt_clear_months": None,
            "message": "0 hours this week. No progress. No outcome."
        }

    # If they give up
    give_up_projection = {
        "debt_status": "Continues growing with interest" if (consequence and consequence.debt_amount) else "N/A",
        "job_probability": 0.0,
        "income_potential": 0,
        "consequence_timeline": "Next payment missed → inkasso → utlegg → kredittrating destroyed" if (consequence and consequence.debt_amount and consequence.debt_amount > 100000) else "Stagnation continues",
        "message": "Give up now → nothing changes → debt wins → you lose"
    }

    return ConsequenceDashboard(
        learning_hours_total=total_hours,
        learning_hours_this_week=week_hours,
        skills_acquired=skills_acquired,
        current_skill_market_value=market_value,
        debt_amount=consequence.debt_amount if consequence else None,
        debt_change_this_week=debt_change,
        days_until_next_payment=days_until_payment,
        continue_current_path=continue_projection,
        give_up_projection=give_up_projection
    )


@router.get("/progress/{user_id}", response_model=ProgressDashboard)
async def get_progress(user_id: str, db: Session = Depends(get_db)):
    """
    Progress dashboard.
    Shows what's been done. No celebration, just facts.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Days active (since account creation)
    days_active = (datetime.utcnow() - user.created_at).days

    # Total sessions
    total_sessions = db.query(func.count(LearningSession.id)).filter(
        LearningSession.user_id == user_id,
        LearningSession.ended_at.isnot(None)
    ).scalar() or 0

    # Total learning minutes
    total_minutes = db.query(
        func.sum(
            func.extract('epoch', LearningSession.ended_at - LearningSession.started_at) / 60
        )
    ).filter(
        LearningSession.user_id == user_id,
        LearningSession.ended_at.isnot(None)
    ).scalar() or 0

    # Modules completed
    modules_completed = db.query(func.count(LearningSession.id)).filter(
        LearningSession.user_id == user_id,
        LearningSession.completion_rate >= 0.9
    ).scalar() or 0

    # Current streak (consecutive days with sessions)
    # Simplified for MVP - would track actual daily activity
    current_streak = 0
    today = datetime.utcnow().date()
    for days_back in range(30):
        check_date = today - timedelta(days=days_back)
        has_session = db.query(LearningSession).filter(
            LearningSession.user_id == user_id,
            func.date(LearningSession.started_at) == check_date
        ).first()
        if has_session:
            current_streak += 1
        else:
            break

    # Skills by category
    completed_sessions = db.query(LearningSession, LearningModule).join(
        LearningModule
    ).filter(
        LearningSession.user_id == user_id,
        LearningSession.completion_rate >= 0.7,
        LearningSession.module_id.isnot(None)
    ).all()

    skills_by_category = {}
    for session, module in completed_sessions:
        category = module.skill_category
        if category not in skills_by_category:
            skills_by_category[category] = []
        if module.skill_specific not in skills_by_category[category]:
            skills_by_category[category].append(module.skill_specific)

    # Mental state trends
    recent_states = db.query(MentalStateLog).filter(
        MentalStateLog.user_id == user_id
    ).order_by(desc(MentalStateLog.timestamp)).limit(100).all()

    avg_cognitive_load = 0.0
    if recent_states:
        avg_cognitive_load = sum(s.cognitive_load for s in recent_states) / len(recent_states)

    # Optimal learning windows
    optimal_states = [s for s in recent_states if s.learning_window_optimal]
    optimal_hours_count = {}
    for state in optimal_states:
        hour = state.timestamp.hour
        optimal_hours_count[hour] = optimal_hours_count.get(hour, 0) + 1

    # Top 3 optimal times
    top_hours = sorted(optimal_hours_count.items(), key=lambda x: x[1], reverse=True)[:3]
    optimal_windows = [f"{hour:02d}:00-{hour+1:02d}:00" for hour, _ in top_hours]

    return ProgressDashboard(
        days_active=days_active,
        total_sessions=total_sessions,
        total_learning_minutes=int(total_minutes),
        modules_completed=modules_completed,
        current_streak_days=current_streak,
        skills_by_category=skills_by_category,
        average_cognitive_load=avg_cognitive_load,
        optimal_learning_windows=optimal_windows,
        detected_parts=None  # TODO: DID support
    )
