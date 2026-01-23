"""
Configuration settings for Fracture backend
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://fracture:fracture@localhost:5432/fracture"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Keys
    OPENAI_API_KEY: str = ""

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:19006",  # Expo dev
        "exp://localhost:19000",
    ]

    # App Settings
    MAX_LEARNING_SESSION_MINUTES: int = 180  # 3 hours max
    MIN_LEARNING_SESSION_MINUTES: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
