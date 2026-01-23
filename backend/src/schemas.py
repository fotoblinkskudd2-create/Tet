"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, UUID4
from typing import Optional, Dict, List, Any
from datetime import datetime
from decimal import Decimal


# ============================================================================
# ONBOARDING SCHEMAS
# ============================================================================

class OnboardingRequest(BaseModel):
    chaos_level: int = Field(..., ge=0, le=100, description="How fucked are you? 0-100")
    primary_goal: str = Field(..., description="What do you need to learn?")
    current_situation: str = Field(..., description="Your current life situation")
    has_did: bool = Field(default=False, description="Do you have DID/dissociative issues?")
    debt_amount: Optional[Decimal] = Field(None, description="Total debt (optional)")
    days_until_crisis: Optional[int] = Field(None, description="Days until next major deadline/crisis")


class OnboardingResponse(BaseModel):
    user_id: UUID4
    message: str
    initial_assessment: str
    recommended_path: str


# ============================================================================
# SESSION SCHEMAS
# ============================================================================

class SessionStartRequest(BaseModel):
    user_id: UUID4


class SessionStartResponse(BaseModel):
    session_id: UUID4
    message: str


class NextModuleResponse(BaseModel):
    module_id: UUID4
    skill_category: str
    skill_specific: str
    estimated_duration_min: int
    content_type: str
    content_data: Dict[str, Any]
    message: str  # "Now learn this: CSS Grid. 12 minutes. Start."


class InteractionEvent(BaseModel):
    session_id: UUID4
    event_type: str  # keystroke/tap/swipe/pause
    timestamp: datetime
    event_data: Dict[str, Any]


class SessionCompleteRequest(BaseModel):
    session_id: UUID4
    completion_rate: float = Field(..., ge=0.0, le=1.0)
    self_assessment: Optional[int] = Field(None, ge=1, le=10)


class SessionCompleteResponse(BaseModel):
    message: str
    skills_gained: List[str]
    next_session_recommendation: str


# ============================================================================
# BEHAVIORAL SCHEMAS
# ============================================================================

class BehavioralEventRequest(BaseModel):
    user_id: UUID4
    session_id: Optional[UUID4] = None
    event_type: str
    event_data: Dict[str, Any]


class CurrentStateResponse(BaseModel):
    cognitive_load: int  # 0-100
    state_classification: str
    learning_window_optimal: bool
    detected_part_id: Optional[str] = None
    recommendation: str


class InterventionTrigger(BaseModel):
    session_id: UUID4
    trigger_type: str  # pause/encourage/simplify/extend
    reason: str


# ============================================================================
# DASHBOARD SCHEMAS
# ============================================================================

class ConsequenceDashboard(BaseModel):
    # Current state
    learning_hours_total: float
    learning_hours_this_week: float
    skills_acquired: List[str]
    current_skill_market_value: Decimal

    # Financial (if provided)
    debt_amount: Optional[Decimal] = None
    debt_change_this_week: Optional[Decimal] = None
    days_until_next_payment: Optional[int] = None

    # Projections - the brutal math
    continue_current_path: Dict[str, Any]  # what happens if they keep going
    give_up_projection: Dict[str, Any]  # what happens if they stop

    # No motivation. Just facts.


class ProgressDashboard(BaseModel):
    days_active: int
    total_sessions: int
    total_learning_minutes: int
    modules_completed: int
    current_streak_days: int  # not gamified, just a fact

    # Skill progression
    skills_by_category: Dict[str, List[str]]

    # Mental state trends
    average_cognitive_load: float
    optimal_learning_windows: List[str]  # time periods when they learn best
    detected_parts: Optional[List[str]] = None  # for DID users


# ============================================================================
# INTEGRATION SCHEMAS
# ============================================================================

class IntegrationConnectRequest(BaseModel):
    user_id: UUID4
    integration_type: str  # plaid/calendar/health/screentime
    credentials: Dict[str, str]


class IntegrationConnectResponse(BaseModel):
    success: bool
    message: str
    integration_id: Optional[str] = None


# ============================================================================
# LEARNING MODULE SCHEMAS
# ============================================================================

class LearningModuleCreate(BaseModel):
    skill_category: str
    skill_specific: str
    difficulty_level: int = Field(..., ge=1, le=10)
    estimated_duration_min: int
    prerequisite_modules: List[UUID4] = []
    content_type: str
    content_data: Dict[str, Any]


class LearningModuleResponse(BaseModel):
    id: UUID4
    skill_category: str
    skill_specific: str
    difficulty_level: int
    estimated_duration_min: int
    content_type: str

    class Config:
        from_attributes = True
