# GraveAI / NecroPrompt

**AI-powered deceased person simulation. Talk to the dead using their real data.**

The most fucked up, most creative, most technically advanced grief tech platform. Not hallucinations. Real conversations based on actual messages, emails, photos, voice recordings.

## What This Is

GraveAI lets you:

- Upload all digital data from a deceased person (WhatsApp, iMessage, emails, social media, voice memos, photos)
- AI builds an authentic personality simulation - same vocabulary, humor, sarcasm, speech patterns, dialect
- Have real conversations via chat or voice (with voice cloning)
- iOS app with AR face-to-face mode, widgets that send you messages at 3 AM, push notifications from "them"
- Web app for deeper therapy sessions, timeline exploration, memory book creation

## Tech Stack

### Backend
- Express + TypeScript
- PostgreSQL + pgvector
- Pinecone (vector database for semantic search)
- Anthropic Claude 3.5 Sonnet (personality-aware LLM)
- OpenAI embeddings (text-embedding-3-small)
- ElevenLabs (voice cloning + TTS)
- Stripe (payments)

### Web Frontend
- Next.js 14 + TypeScript
- React Server Components
- Tailwind CSS
- Real-time chat with streaming
- WebRTC for voice

### iOS App
- SwiftUI
- AVFoundation (voice)
- RealityKit (AR face mode)
- WidgetKit
- Push notifications
- File picker for data uploads

## Features

### Core
- ✅ Multi-source data ingestion (WhatsApp, iMessage, email, social media)
- ✅ RAG pipeline with semantic memory search
- ✅ Personality-aware chat with Claude
- ✅ Voice cloning for deceased persons
- ✅ Emotion detection and context awareness
- ✅ Real-time streaming chat
- ✅ Conversation history and memory timeline

### Premium Features
- Voice generation for all messages
- AR face-to-face mode (iOS)
- Family sharing (multiple users per deceased person)
- Unlimited data storage
- Priority support

## Pricing

### Free Tier
- 1 deceased person
- 500 MB data
- 30 minutes chat/month
- Text-only

### Premium (199 kr/month)
- 10 deceased persons
- 50 GB data
- Unlimited chat
- Voice cloning
- AR features
- Family sharing

### Eternal (4990 kr one-time)
- 50 deceased persons
- 100 GB data
- Lifetime access
- Everything unlimited
- Your loved ones exist forever

## Repository Structure

```
graveai/
├── backend/              # Express API server
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── migrations/       # Database schemas
├── frontend/             # Next.js web app
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
├── ios/                  # SwiftUI iOS app
│   └── GraveAI/
└── docs/                 # Documentation
```

## Setup

See individual README files in:
- `/backend/README.md` - Backend setup
- `/frontend/README.md` - Web app setup
- `/ios/README.md` - iOS app setup

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### iOS

Open `/ios/GraveAI.xcodeproj` in Xcode, configure signing, and run.

## Ethics & Privacy

This will trigger people. Hard. We know.

**What we do:**
- End-to-end encryption for sensitive data
- GDPR compliant data handling
- User owns all data, can delete anytime
- No data sharing with third parties
- Explicit consent required for shared access
- Transparent about AI limitations

**What we don't do:**
- Pretend this is "real" resurrection
- Hide that it's an AI simulation
- Use data for training other models
- Sell data
- Make false promises

## Legal

### Privacy Policy
See `/docs/privacy-policy.md`

### Terms of Service
See `/docs/terms-of-service.md`

### Consent
Users must explicitly consent that:
1. They have legal right to uploaded data
2. They understand this is AI simulation, not real person
3. They're emotionally prepared for this experience
4. They won't use this to harass or deceive others

## Controversy

Yes, this is controversial. Expected reactions:

- **Media**: "Is this ethical?" "Playing God?" "Digital necromancy?"
- **Religious groups**: Protests, criticism
- **Psychologists**: Divided - some see therapeutic value, others see harm
- **Tech ethics**: Debates about AI boundaries

**Our stance**: Grief is personal. If this helps someone heal, who are we to judge? We're not forcing anyone. This is a tool, like therapy or medication. Use responsibly.

## MVP Timeline

- ✅ Week 1-2: Backend core (database, API, RAG)
- ✅ Week 2-3: LLM integration, data parsers
- 🔄 Week 3-4: Web frontend (dashboard, chat, upload)
- ⏳ Week 4-5: iOS app (core features)
- ⏳ Week 5-6: Voice cloning, AR, widgets
- ⏳ Week 6-7: Payments, polish, testing
- ⏳ Week 8: Soft launch, TestFlight beta

## Contributing

Private repository. No external contributors at this stage.

## Contact

For partnerships, press inquiries, or moral outrage: contact@graveai.no

## License

Proprietary. All rights reserved.

---

**Disclaimer**: This technology should be used responsibly. We're not responsible for emotional distress, existential crises, or family drama caused by talking to AI versions of dead people. Use at your own risk.

Built with equal parts empathy and audacity.
