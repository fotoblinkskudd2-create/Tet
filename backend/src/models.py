"""
Database models for Fracture
"""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, ARRAY, JSON, DECIMAL, Date, BigInteger
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    phone_hash = Column(String(64), unique=True, nullable=True)
    encryption_key_hash = Column(String(128))
    subscription_tier = Column(String(20), default="free")  # free/pro/enterprise
    onboarding_complete = Column(Boolean, default=False)

    # Relationships
    mental_states = relationship("MentalStateLog", back_populates="user")
    learning_sessions = relationship("LearningSession", back_populates="user")
    consequence_data = relationship("ConsequenceData", back_populates="user", uselist=False)
    preferences = relationship("UserPreference", back_populates="user", uselist=False)


class MentalStateLog(Base):
    __tablename__ = "mental_state_log"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Mental state metrics
    cognitive_load = Column(Integer)  # 0-100
    state_classification = Column(String(50))  # focused/dissociated/frustrated/etc
    keystroke_rhythm_score = Column(Float)
    interaction_pattern_score = Column(Float)
    detected_part_id = Column(String(50), nullable=True)  # for DID users
    learning_window_optimal = Column(Boolean)

    # Relationships
    user = relationship("User", back_populates="mental_states")


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_category = Column(String(100), index=True)  # 'CSS', 'Python', 'Digital Art'
    skill_specific = Column(String(200))  # 'CSS Grid', 'Python Lists'
    difficulty_level = Column(Integer)  # 1-10
    estimated_duration_min = Column(Integer)
    prerequisite_modules = Column(ARRAY(UUID(as_uuid=True)), default=[])
    content_type = Column(String(50))  # 'interactive', 'video', 'text', 'practice'
    content_data = Column(JSON)  # actual learning content

    # Relationships
    sessions = relationship("LearningSession", back_populates="module")


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    module_id = Column(UUID(as_uuid=True), ForeignKey("learning_modules.id"))

    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    completion_rate = Column(Float)  # 0.0-1.0
    interventions_triggered = Column(Integer, default=0)
    part_id = Column(String(50), nullable=True)  # which alter was learning
    final_assessment_score = Column(Float, nullable=True)

    # Relationships
    user = relationship("User", back_populates="learning_sessions")
    module = relationship("LearningModule", back_populates="sessions")


class ConsequenceData(Base):
    __tablename__ = "consequence_data"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)

    # Financial data (encrypted)
    debt_amount = Column(DECIMAL(12, 2), nullable=True)
    debt_currency = Column(String(3), default="NOK")
    next_payment_due = Column(Date, nullable=True)
    monthly_income = Column(DECIMAL(12, 2), nullable=True)

    # Calculated projections
    skills_market_value = Column(DECIMAL(12, 2))
    job_probability = Column(Float)  # ML prediction 0.0-1.0
    debt_clear_months = Column(Integer, nullable=True)

    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="consequence_data")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)

    data_integrations = Column(JSON, default={})  # which APIs connected
    notification_settings = Column(JSON, default={})
    learning_goals = Column(JSON, default={})  # job targets, skill targets
    part_profiles = Column(JSON, default={})  # DID alter preferences

    # Relationships
    user = relationship("User", back_populates="preferences")


class BehavioralEvent(Base):
    """Raw behavioral events for ML training"""
    __tablename__ = "behavioral_events"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("learning_sessions.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    event_type = Column(String(50))  # keystroke/tap/swipe/pause/etc
    event_data = Column(JSON)  # specific event details

    # Processed at regular intervals, then deleted
    processed = Column(Boolean, default=False)
