"""
External data integration API routes
Connect banking, calendar, health data for context
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import UserPreference
from ..schemas import IntegrationConnectRequest, IntegrationConnectResponse

router = APIRouter()


@router.post("/connect", response_model=IntegrationConnectResponse)
async def connect_integration(
    request: IntegrationConnectRequest,
    db: Session = Depends(get_db)
):
    """
    Connect external data source.
    Supports: banking (Plaid), calendar, health, screen time
    """
    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == request.user_id
    ).first()

    if not preferences:
        raise HTTPException(status_code=404, detail="User preferences not found")

    # Get current integrations
    integrations = preferences.data_integrations or {}

    # Validate integration type
    valid_types = ['plaid', 'calendar', 'health', 'screentime']
    if request.integration_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid integration type. Must be one of: {valid_types}"
        )

    # Store integration credentials (encrypted in production)
    # TODO: Implement actual API connections
    # For MVP, just store the intent

    if request.integration_type == 'plaid':
        # Banking integration via Plaid
        # In production: validate access_token, fetch account data
        integrations['plaid'] = {
            'connected': True,
            'access_token': request.credentials.get('access_token', ''),
            'item_id': request.credentials.get('item_id', ''),
            'last_sync': None
        }
        message = "Banking connected. Will track debt changes."

    elif request.integration_type == 'calendar':
        # Google/Apple Calendar
        integrations['calendar'] = {
            'connected': True,
            'provider': request.credentials.get('provider', 'google'),
            'last_sync': None
        }
        message = "Calendar connected. Will detect free learning windows."

    elif request.integration_type == 'health':
        # Apple Health / Google Fit
        integrations['health'] = {
            'connected': True,
            'provider': request.credentials.get('provider', 'apple'),
            'last_sync': None
        }
        message = "Health data connected. Will track sleep and activity patterns."

    elif request.integration_type == 'screentime':
        # Screen time tracking
        integrations['screentime'] = {
            'connected': True,
            'last_sync': None
        }
        message = "Screen time tracking enabled. Will analyze usage patterns."

    # Update preferences
    preferences.data_integrations = integrations
    db.commit()

    return IntegrationConnectResponse(
        success=True,
        message=message,
        integration_id=request.integration_type
    )


@router.get("/{user_id}")
async def get_integrations(user_id: str, db: Session = Depends(get_db)):
    """Get all connected integrations for user"""
    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == user_id
    ).first()

    if not preferences:
        return {"integrations": {}}

    integrations = preferences.data_integrations or {}

    # Return status of each integration
    return {
        "integrations": {
            integration_type: {
                'connected': data.get('connected', False),
                'last_sync': data.get('last_sync')
            }
            for integration_type, data in integrations.items()
        }
    }


@router.delete("/{user_id}/{integration_type}")
async def disconnect_integration(
    user_id: str,
    integration_type: str,
    db: Session = Depends(get_db)
):
    """Disconnect an integration"""
    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == user_id
    ).first()

    if not preferences:
        raise HTTPException(status_code=404, detail="User preferences not found")

    integrations = preferences.data_integrations or {}

    if integration_type not in integrations:
        raise HTTPException(status_code=404, detail="Integration not found")

    # Remove integration
    del integrations[integration_type]
    preferences.data_integrations = integrations
    db.commit()

    return {
        "success": True,
        "message": f"{integration_type} disconnected"
    }
