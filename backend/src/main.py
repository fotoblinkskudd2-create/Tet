"""
Fracture - AI Learning App for Chaotic Minds
Main FastAPI application
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .database import engine, Base
from .routes import onboarding, session, dashboard, behavioral, integrations
from .config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    logger.info("Fracture starting up...")
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized")
    yield
    logger.info("Fracture shutting down...")


app = FastAPI(
    title="Fracture API",
    description="Learning app that doesn't pretend you're okay",
    version="0.1.0",
    lifespan=lifespan
)

# CORS - allow mobile app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(onboarding.router, prefix="/api/onboard", tags=["onboarding"])
app.include_router(session.router, prefix="/api/session", tags=["session"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(behavioral.router, prefix="/api/behavioral", tags=["behavioral"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])


@app.get("/")
async def root():
    return {
        "app": "Fracture",
        "status": "running",
        "message": "No pretense. Just learning."
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
