# Fracture Backend

FastAPI backend for Fracture - the learning app that doesn't pretend you're okay.

## Setup

### Local Development with Docker

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Edit `.env` and add your OpenAI API key

3. Start services:
```bash
cd ..
docker-compose up -d
```

4. Create database tables and seed data:
```bash
docker-compose exec backend python seed_modules.py
```

5. API will be available at: `http://localhost:8000`

6. API docs at: `http://localhost:8000/docs`

### Local Development without Docker

1. Install PostgreSQL and Redis locally

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy and configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

5. Create database:
```bash
createdb fracture
```

6. Seed database:
```bash
python seed_modules.py
```

7. Run server:
```bash
uvicorn src.main:app --reload
```

## API Endpoints

### Onboarding
- `POST /api/onboard/` - Initial "How fucked are you?" assessment
- `GET /api/onboard/assessment/{user_id}` - Get user assessment

### Learning Sessions
- `POST /api/session/start` - Start learning session
- `GET /api/session/next-module` - Get next learning module (AI selected)
- `POST /api/session/interaction` - Log user interaction
- `POST /api/session/complete` - Complete session
- `GET /api/session/active/{user_id}` - Get active session

### Behavioral Analysis
- `POST /api/behavioral/event` - Log behavioral event
- `GET /api/behavioral/current-state` - Get current mental state analysis
- `POST /api/behavioral/intervention` - Trigger intervention
- `GET /api/behavioral/patterns/{user_id}` - Get user behavioral patterns

### Dashboard
- `GET /api/dashboard/consequences/{user_id}` - The brutal math
- `GET /api/dashboard/progress/{user_id}` - Progress tracking

### Integrations
- `POST /api/integrations/connect` - Connect external data source
- `GET /api/integrations/{user_id}` - Get connected integrations
- `DELETE /api/integrations/{user_id}/{integration_type}` - Disconnect integration

## Architecture

See `/FRACTURE_ARCHITECTURE.md` for detailed system design.

### Key Components

**Behavioral Analysis Engine**
- Analyzes keystroke dynamics
- Detects dissociation and cognitive load
- Predicts optimal learning windows

**Learning Path Engine**
- AI selects next module based on mental state
- No user choice - removes decision paralysis
- Adapts difficulty and duration in real-time

**Consequence Tracker**
- Shows brutal math projections
- Tracks debt and job probability
- No motivation porn - just facts

**Multi-Modal Learning** (DID Support)
- Detects different alters/parts
- Adapts content per part
- Tracks knowledge transfer

## Database Schema

- `users` - User accounts
- `mental_state_log` - Real-time mental state tracking
- `learning_modules` - Learning content library
- `learning_sessions` - Session history
- `consequence_data` - Financial and projection data
- `user_preferences` - Settings and integrations
- `behavioral_events` - Raw behavioral data

## Development

### Adding Learning Modules

Edit `seed_modules.py` to add new learning content. Each module needs:
- `skill_category` - e.g., "Python", "CSS", "Digital Art"
- `skill_specific` - e.g., "Python Lists", "CSS Grid"
- `difficulty_level` - 1-10
- `estimated_duration_min` - Time estimate
- `content_type` - "interactive", "text", "video", "practice"
- `content_data` - Actual learning content (JSON)

### Testing

```bash
pytest tests/
```

## Production Deployment

1. Set strong `SECRET_KEY` in environment
2. Use production PostgreSQL (not Docker)
3. Configure Redis for session management
4. Set up SSL/TLS
5. Enable rate limiting
6. Configure backup strategy
7. Set up monitoring (Sentry, DataDog, etc.)

## Security

- All sensitive data encrypted at rest
- User-specific encryption keys
- No data selling
- Privacy-first design
- Open source data handling for audit

## License

MIT (for now - will finalize later)
