# Fracture - AI Learning App for Chaotic Minds

## Core Philosophy
No pretense. No gamification. No "you got this 💪". Just brutal efficiency and adaptive intelligence for people whose brains don't follow linear paths.

## System Architecture

### Technology Stack

**Backend:**
- FastAPI (Python 3.11+) - API server
- PostgreSQL - Primary database
- Redis - Session/cache management
- Celery - Background task processing
- OpenAI GPT-4 API - Adaptive learning content
- Custom ML models - Behavioral analysis

**Frontend:**
- React Native (Expo) - Cross-platform mobile
- TypeScript - Type safety
- Zustand - State management
- React Query - Server state

**ML/AI Pipeline:**
- scikit-learn - Behavioral pattern classification
- TensorFlow Lite - On-device inference
- OpenAI API - Content generation and adaptation
- Custom keystroke dynamics analysis
- NLP sentiment/dissociation detection

### Core Systems

## 1. Behavioral Analysis Engine

**Purpose:** Detect mental state in real-time from user interaction patterns

**Inputs:**
- Keystroke dynamics (timing, pressure, rhythm)
- Screen interaction patterns (touch aggression, dwell time)
- Response latency
- Linguistic markers (from text input)
- Time of day patterns
- Activity level (from health data)

**Outputs:**
- Mental state classification (focused/dissociated/frustrated/overwhelmed)
- Cognitive load score (0-100)
- Optimal learning window prediction
- Alter/part identification (for DID users)

**Implementation:**
```
/backend/ml/
  behavioral_analyzer.py    # Main analysis engine
  keystroke_model.py        # Keystroke dynamics classifier
  linguistic_analyzer.py    # NLP for text patterns
  state_predictor.py        # Real-time state prediction
```

## 2. Learning Path Engine

**Purpose:** Select what to teach and when, removing decision paralysis

**Decision Factors:**
- User's stated goals (jobs applied for, skills needed)
- Current mental state (from behavioral analysis)
- Historical success patterns (when do they learn best)
- Market demand (what skills actually lead to jobs)
- Prerequisite chains (can't do X without Y)
- Attention span current estimate

**Output:**
- Single learning module (7-45 min depending on state)
- No choices, no browsing
- "Now learn this: CSS Grid. 12 minutes. Start."

**Implementation:**
```
/backend/engine/
  path_selector.py          # Main decision engine
  skill_graph.py            # Prerequisite knowledge graph
  market_analyzer.py        # Job market demand data
  timing_optimizer.py       # When to teach what
```

## 3. Adaptive Content Delivery

**Purpose:** Adjust learning content in real-time based on user state

**Adaptations:**
- Module length (3 min when dissociating, 45 min when in flow)
- Complexity (reduce cognitive load when overwhelmed)
- Modality (visual vs text vs interactive)
- Pacing (pause detection and intervention)

**Intervention Triggers:**
- Keystroke rhythm breaks -> "You're losing focus. Take 90 seconds."
- 3+ min no interaction -> "Still there? Come back when ready."
- Aggressive tapping -> "Frustration detected. Switching to easier example."
- Success streak -> "You're in flow. Here's more."

**Implementation:**
```
/backend/delivery/
  content_adapter.py        # Real-time content adjustment
  module_library.py         # Learning content database
  intervention_system.py    # Pause/support triggers
```

## 4. Consequence Tracker

**Purpose:** Show brutal math instead of motivation porn

**Tracked Metrics:**
- Debt level (if integrated with banking)
- Learning hours accumulated
- Skills acquired
- Job applications sent
- Days until next debt consequence
- Income potential based on current skills

**Projections:**
- "Continue 47 days -> 67% chance webdev job -> 450k salary -> debt clear 18 months"
- "Continue current pattern -> 91% chance utlegg -> lose apartment"

**No sugar coating. Just math.**

**Implementation:**
```
/backend/tracking/
  consequence_calculator.py # Math projections
  debt_tracker.py          # Financial integration
  skill_valuation.py       # Market value of skills
  timeline_projector.py    # Future scenario modeling
```

## 5. Multi-Modal Learning System

**Purpose:** Adapt to different alters/parts in DID users

**Detection:**
- Writing style shifts (vocabulary, sentence structure)
- Interaction pattern changes
- Timing patterns (which part active when)
- Explicit user tagging ("Part X learning now")

**Adaptation:**
- Track which parts prefer which content types
- Allow different learning paths per part
- Enable knowledge transfer visualization
- Maintain coherent skill building across parts

**Implementation:**
```
/backend/multimodal/
  part_detector.py         # Alter/part identification
  preference_mapper.py     # Part-specific learning prefs
  knowledge_bridge.py      # Cross-part skill tracking
```

## 6. Data Integration Layer

**Purpose:** Pull context from user's actual life

**Integrations:**
- Banking (Plaid API) - debt, spending patterns
- Calendar (Google/Apple) - scheduled chaos
- Health data (Apple Health/Google Fit) - sleep, activity
- Screen time APIs - usage patterns
- Location (optional) - environmental context

**Privacy:**
- All sensitive data encrypted at rest
- On-device processing where possible
- No data selling, ever
- User can delete everything instantly

**Implementation:**
```
/backend/integrations/
  plaid_client.py          # Banking integration
  calendar_sync.py         # Calendar data
  health_sync.py           # Health/activity data
  screen_time_sync.py      # Usage patterns
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    phone_hash VARCHAR(64),  -- hashed for privacy
    encryption_key_hash VARCHAR(128),
    subscription_tier VARCHAR(20),  -- free/pro/enterprise
    onboarding_complete BOOLEAN
);
```

### Mental State Log
```sql
CREATE TABLE mental_state_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP,
    cognitive_load SMALLINT,  -- 0-100
    state_classification VARCHAR(50),  -- focused/dissociated/frustrated/etc
    keystroke_rhythm_score FLOAT,
    interaction_pattern_score FLOAT,
    detected_part_id VARCHAR(50),  -- for DID users
    learning_window_optimal BOOLEAN
);
```

### Learning Sessions
```sql
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    module_id UUID REFERENCES learning_modules(id),
    completion_rate FLOAT,  -- 0.0-1.0
    interventions_triggered INTEGER,
    part_id VARCHAR(50),  -- which alter was learning
    final_assessment_score FLOAT
);
```

### Learning Modules
```sql
CREATE TABLE learning_modules (
    id UUID PRIMARY KEY,
    skill_category VARCHAR(100),  -- 'CSS', 'Python', 'Digital Art', etc
    skill_specific VARCHAR(200),  -- 'CSS Grid', 'Python Lists', etc
    difficulty_level SMALLINT,  -- 1-10
    estimated_duration_min INTEGER,
    prerequisite_modules UUID[],  -- array of required prior modules
    content_type VARCHAR(50),  -- 'interactive', 'video', 'text', 'practice'
    content_data JSONB  -- actual learning content
);
```

### Consequence Tracking
```sql
CREATE TABLE consequence_data (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    debt_amount DECIMAL(12,2),  -- encrypted
    debt_currency VARCHAR(3),
    next_payment_due DATE,  -- encrypted
    monthly_income DECIMAL(12,2),  -- encrypted, optional
    skills_market_value DECIMAL(12,2),  -- calculated
    job_probability FLOAT,  -- ML prediction
    debt_clear_months INTEGER,  -- projection
    last_updated TIMESTAMP
);
```

### User Preferences
```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    data_integrations JSONB,  -- which APIs connected
    notification_settings JSONB,
    learning_goals JSONB,  -- job targets, skill targets
    part_profiles JSONB  -- DID alter preferences
);
```

## API Endpoints

### Core Flow
```
POST /api/onboard                    # Initial assessment
POST /api/session/start              # Begin learning session
GET  /api/session/next-module        # Get current learning task
POST /api/session/interaction        # Log user interaction (for analysis)
POST /api/session/complete           # End session
GET  /api/dashboard/consequences     # Get brutal math dashboard
GET  /api/dashboard/progress         # Learning progress
POST /api/integrations/connect       # Connect external data source
```

### Real-time Adaptation
```
POST /api/behavioral/event           # Log keystroke/interaction event
GET  /api/behavioral/current-state   # Get current mental state classification
POST /api/intervention/trigger       # System triggered intervention
```

## Mobile App Structure

```
/mobile/
  src/
    screens/
      OnboardingScreen.tsx           # "How fucked are you?"
      LearningScreen.tsx             # Main learning interface
      ConsequenceDashboard.tsx       # The brutal math
      IntegrationSettings.tsx        # Connect data sources
    components/
      LearningModule.tsx             # Adaptive content renderer
      InterventionOverlay.tsx        # Pause/support popups
      ProgressTracker.tsx            # Skills gained
    hooks/
      useBehavioralTracking.ts       # Client-side behavior logging
      useLearningSession.ts          # Session management
    services/
      api.ts                         # Backend communication
      keystrokeAnalyzer.ts           # On-device keystroke tracking
      encryption.ts                  # Local data encryption
```

## Security & Privacy

**Encryption:**
- All sensitive data encrypted with user-specific keys
- Keys derived from user passphrase + device ID
- Backend never sees plaintext debt/health data

**On-Device Processing:**
- Keystroke analysis runs locally
- Linguistic analysis runs locally
- Only aggregated metrics sent to backend

**Data Deletion:**
- User can nuke everything instantly
- No backup retention
- Permanent deletion confirmed

**No Selling:**
- Revenue from subscriptions only
- No ads
- No data brokering
- Open source data handling code for audit

## Deployment

**Backend:**
- Docker containers on AWS/GCP
- Auto-scaling based on load
- Multi-region for latency

**Mobile:**
- React Native compiled to native
- Expo for updates
- TestFlight/Play Store beta initially

**ML Models:**
- TensorFlow Lite models deployed to mobile
- Backend models on GPU instances
- Regular retraining pipeline

## MVP Feature Priority

**Phase 1 (2-4 weeks):**
1. Onboarding assessment
2. Basic behavioral tracking (keystroke, timing)
3. Learning module delivery (fixed content)
4. Simple consequence dashboard (manual input)
5. iOS app only

**Phase 2 (4-6 weeks):**
1. AI-powered path selection
2. Real-time adaptation
3. Integration with banking/calendar
4. Android app
5. Intervention system

**Phase 3 (6-8 weeks):**
1. Multi-modal system (DID support)
2. Advanced ML models
3. Job market analysis
4. Content expansion
5. Enterprise features (NAV integration)

## Success Metrics

**User Success:**
- Learning hours per week
- Skills acquired
- Job applications sent
- Jobs obtained
- Debt reduced

**System Success:**
- Mental state prediction accuracy
- Intervention timing effectiveness
- Module completion rates
- User retention (not streaks - actual learning)

**Business Success:**
- Subscription conversions
- Enterprise partnerships (NAV, etc)
- User testimonials (real stories, not marketing)

---

This is not a wellness app.
This is a survival tool.
Build it like one.
