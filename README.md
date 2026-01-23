# Fracture

**AI Learning App for Chaotic Minds**

No pretense. No gamification. No "you got this 💪".

Just brutal efficiency and adaptive intelligence for people whose brains don't follow linear paths.

---

## What Is This?

Fracture is a learning app designed for people in crisis. Not "crisis" like "having a bad day." Crisis like:

- 250k debt and 83 kr til den 15.
- DID making your brain seven different movies simultaneously
- So overwhelmed that choosing what to learn paralyzes you completely

Traditional learning apps are designed for people with stable lives and linear brains. Fracture is designed for chaos.

## Core Philosophy

**AI Takes Control**
- No browsing courses
- No "choose your learning path"
- App tells you: "Now learn this: CSS Grid. 12 minutes. Start."
- Decision paralysis eliminated

**Brutal Math, Not Motivation**
- No streaks, badges, or "you're on fire 🔥"
- Shows: "Continue 47 days → 67% job probability → debt clear 18 months"
- Or: "Give up now → inkasso → utlegg → game over"
- Just facts

**Real-Time Adaptation**
- Tracks keystroke rhythm, screen interactions, timing patterns
- Detects dissociation, cognitive overload, frustration
- Adjusts module length (3 min → 45 min based on state)
- Intervenes: "You're dissociating. Take 90 seconds."

**DID Support**
- Detects different alters/parts from interaction patterns
- Adapts content per part
- Tracks knowledge transfer
- Enables coherent skill building across parts

## Architecture

See [FRACTURE_ARCHITECTURE.md](FRACTURE_ARCHITECTURE.md) for full system design.

### Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL + Redis
- OpenAI GPT-4 API
- Custom ML models for behavioral analysis

**Frontend:**
- React Native (Expo)
- TypeScript
- Cross-platform (iOS/Android)

**Security:**
- End-to-end encryption
- On-device processing where possible
- No data selling, ever

## Quick Start

### Backend Setup

```bash
# Start services
docker-compose up -d

# Seed database
docker-compose exec backend python seed_modules.py

# API available at: http://localhost:8000
# Docs at: http://localhost:8000/docs
```

See [backend/README.md](backend/README.md) for details.

### Mobile App Setup

```bash
cd mobile
npm install
npm start
```

## Current Status

**MVP Features Implemented:**
- ✅ Onboarding assessment
- ✅ Behavioral tracking (keystroke, interaction patterns)
- ✅ Mental state classification
- ✅ Learning module delivery
- ✅ Consequence dashboard (brutal math)
- ✅ Progress tracking
- ✅ Data integration framework
- ✅ 15+ learning modules (CSS, Python, JavaScript, Git, HTML, Art)

**In Progress:**
- 🚧 React Native mobile app
- 🚧 AI-powered module selection (using OpenAI)
- 🚧 Real-time intervention system
- 🚧 DID multi-modal support

**Planned:**
- ⏳ Banking integration (Plaid)
- ⏳ Calendar integration
- ⏳ Health data integration
- ⏳ ML model training for state prediction
- ⏳ Job market analysis
- ⏳ Enterprise features (NAV integration)

## Why This Matters

**Traditional learning apps fail people in crisis because:**
1. They require stable routines
2. They require decision-making capacity
3. They rely on motivation and willpower
4. They assume linear progress

**Fracture works because:**
1. AI eliminates choice paralysis
2. Adapts to mental state in real-time
3. Shows consequences, not encouragement
4. Accepts chaos as baseline

## Business Model

**Freemium:**
- Free: 30 min/day, basic features
- Pro ($9.99/month): Unlimited, full AI, all integrations, consequence tracking

**Enterprise:**
- Partner with NAV, Aetat, mental health services
- Bulk licensing for people under attføring
- Potential 7.5B NOK annual savings for Norway if 10% get jobs

## This Is Not a Wellness App

This is a survival tool.

If you have 250k debt, a fracturing mind, and 47 days until the next crisis - you don't need meditation. You need skills that lead to jobs that pay money that clears debt.

Fracture is built for that.

---

## Contributing

Currently in MVP development. Contributions welcome after initial release.

## License

MIT (tentative)

---

**Contact:** [To be added]

**Status:** Active development, not production-ready

**Warning:** This app deals with serious mental health and financial crisis situations. If you're implementing similar features, prioritize user safety and consider ethical implications.
