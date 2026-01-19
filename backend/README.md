# GraveAI Backend

AI-powered deceased person simulation backend. Talk to your dead loved ones using their actual data.

## Tech Stack

- **Server**: Express + TypeScript
- **Database**: PostgreSQL (or Supabase)
- **Vector DB**: Pinecone (for semantic memory search)
- **LLM**: Anthropic Claude 3.5 Sonnet
- **Voice**: ElevenLabs (voice cloning + TTS)
- **Embeddings**: OpenAI text-embedding-3-small
- **Payments**: Stripe

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For embeddings
- `ANTHROPIC_API_KEY` - For chat (Claude)
- `JWT_SECRET` - Random secret for JWT tokens

Optional (but recommended):
- `PINECONE_API_KEY` - For fast vector search
- `ELEVENLABS_API_KEY` - For voice cloning
- `STRIPE_SECRET_KEY` - For payments

### 3. Run database migrations

```bash
# Make sure PostgreSQL is running
npm run migrate
```

This will create all necessary tables.

### 4. Start development server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Deceased Persons

- `GET /api/deceased` - List all
- `POST /api/deceased` - Create new
- `GET /api/deceased/:id` - Get one
- `PATCH /api/deceased/:id` - Update
- `DELETE /api/deceased/:id` - Delete
- `GET /api/deceased/:id/stats` - Get statistics

### Chat

- `POST /api/chat` - Send message and get response
  - Supports streaming with `stream: true`
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id` - Get conversation with messages
- `DELETE /api/chat/conversations/:id` - Delete conversation

## Features Implemented

✅ User authentication with JWT
✅ Database schema for deceased persons, memories, conversations
✅ RAG (Retrieval Augmented Generation) pipeline
✅ Semantic memory search with embeddings
✅ Claude LLM integration with personality-aware prompts
✅ Voice cloning service (ElevenLabs)
✅ Data parsers (WhatsApp, iMessage, email, Facebook, Instagram, Twitter, diary)
✅ Chat API with streaming support
✅ Rate limiting and security middleware
✅ Subscription tier system (free/premium/eternal)

## TODO

- [ ] Upload routes for data sources
- [ ] Voice generation endpoint
- [ ] Stripe payment integration
- [ ] Background job processing for data parsing
- [ ] WebSocket support for real-time chat
- [ ] Admin dashboard
- [ ] Analytics and usage tracking
- [ ] Email notifications
- [ ] Privacy compliance (GDPR)

## Architecture

```
backend/
├── src/
│   ├── server.ts              # Main server
│   ├── config.ts              # Configuration
│   ├── db.ts                  # Database connection
│   ├── types/                 # TypeScript types
│   ├── middleware/            # Auth, rate limiting
│   ├── routes/                # API endpoints
│   │   ├── auth.ts
│   │   ├── deceased.ts
│   │   └── chat.ts
│   └── services/              # Business logic
│       ├── rag.ts             # RAG pipeline
│       ├── llm.ts             # LLM chat generation
│       ├── voice.ts           # Voice cloning
│       └── parsers.ts         # Data parsers
└── migrations/                # SQL migrations
```

## Subscription Tiers

### Free
- 1 deceased person
- 500 MB data
- 30 minutes chat/month
- No voice cloning
- No AR features

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
- Unlimited everything
- Lifetime access
- Priority support

## Security

- Passwords hashed with bcryptjs
- JWT tokens with 30-day expiration
- Rate limiting on all endpoints
- CORS configured for production
- SQL injection prevention with parameterized queries
- Input validation with Zod (TODO)

## Production Deployment

Recommended: Railway, Render, or Fly.io

```bash
npm run build
npm start
```

Make sure to set all environment variables in production.

## License

Proprietary - All rights reserved
