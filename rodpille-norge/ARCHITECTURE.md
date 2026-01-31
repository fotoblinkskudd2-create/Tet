# RødPilleNorge - Systemarkitektur

## Oversikt
```
+-----------------------------------------------------------------------------------+
|                              RODPILLE NORGE PLATFORM                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +------------------+     +------------------+     +------------------+           |
|  |   EXPO MOBILE    |     |   NEXT.JS WEB    |     |   ADMIN PANEL    |           |
|  |   (iOS/Android)  |     |   (PWA)          |     |   (Next.js)      |           |
|  +--------+---------+     +--------+---------+     +--------+---------+           |
|           |                        |                        |                     |
|           +------------------------+------------------------+                     |
|                                    |                                              |
|                          +---------v---------+                                    |
|                          |    API GATEWAY    |                                    |
|                          |   (Next.js API)   |                                    |
|                          +---------+---------+                                    |
|                                    |                                              |
|  +----------------+----------------+----------------+----------------+            |
|  |                |                |                |                |            |
|  v                v                v                v                v            |
| +-----+     +----------+     +---------+     +--------+     +----------+         |
| |AUTH |     |   FEED   |     |   AI    |     |PAYMENT |     | REALTIME |         |
| |SRVCE|     |  SERVICE |     | AGENTS  |     |SERVICE |     |  SERVICE |         |
| +--+--+     +----+-----+     +----+----+     +---+----+     +----+-----+         |
|    |             |                |              |               |                |
|    +-------------+----------------+--------------+---------------+                |
|                                   |                                               |
|                          +--------v--------+                                      |
|                          |    SUPABASE     |                                      |
|                          | +-------------+ |                                      |
|                          | | PostgreSQL  | |                                      |
|                          | | Auth        | |                                      |
|                          | | Realtime    | |                                      |
|                          | | Storage     | |                                      |
|                          | +-------------+ |                                      |
|                          +-----------------+                                      |
|                                   |                                               |
|  +----------------+---------------+---------------+----------------+              |
|  |                |               |               |                |              |
|  v                v               v               v                v              |
| +------+    +--------+     +---------+     +--------+     +----------+           |
| |STRIPE|    |  S3    |     | OPENAI  |     |FIREBASE|     |  X API   |           |
| |      |    |STORAGE |     |   API   |     |  PUSH  |     |(Twitter) |           |
| +------+    +--------+     +---------+     +--------+     +----------+           |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Database Schema (PostgreSQL/Supabase)

### Tabeller

```sql
-- Users & Auth
users
  - id: uuid (PK)
  - email: text
  - username: text (unique)
  - avatar_url: text
  - bio: text
  - role: enum (normie, rod_pille, moderator, admin)
  - red_pill_score: int
  - lies_exposed_count: int
  - created_at: timestamp
  - updated_at: timestamp
  - is_banned: boolean
  - is_shadow_banned: boolean
  - stripe_customer_id: text
  - subscription_tier: enum (free, elite)

-- Posts
posts
  - id: uuid (PK)
  - author_id: uuid (FK -> users)
  - title: text
  - content: text (markdown)
  - source_url: text (required)
  - media_urls: jsonb
  - tags: text[]
  - ai_tags: text[]
  - lie_score: int (0-100)
  - lie_analysis: jsonb
  - upvotes: int
  - downvotes: int
  - red_pill_score: int (calculated)
  - controversial_factor: float
  - is_flagged: boolean
  - flag_reason: text
  - created_at: timestamp
  - updated_at: timestamp

-- Comments
comments
  - id: uuid (PK)
  - post_id: uuid (FK -> posts)
  - author_id: uuid (FK -> users)
  - parent_id: uuid (FK -> comments, nullable)
  - content: text
  - upvotes: int
  - downvotes: int
  - created_at: timestamp
  - is_deleted: boolean

-- Votes
votes
  - id: uuid (PK)
  - user_id: uuid (FK -> users)
  - post_id: uuid (FK -> posts, nullable)
  - comment_id: uuid (FK -> comments, nullable)
  - vote_type: enum (up, down)
  - created_at: timestamp

-- Reports
reports
  - id: uuid (PK)
  - reporter_id: uuid (FK -> users)
  - post_id: uuid (FK -> posts, nullable)
  - comment_id: uuid (FK -> comments, nullable)
  - reason: text
  - ai_spam_score: float
  - status: enum (pending, reviewed, dismissed)
  - created_at: timestamp

-- Subscriptions
subscriptions
  - id: uuid (PK)
  - user_id: uuid (FK -> users)
  - stripe_subscription_id: text
  - status: enum (active, canceled, past_due)
  - current_period_end: timestamp
  - created_at: timestamp

-- Donations
donations
  - id: uuid (PK)
  - user_id: uuid (FK -> users, nullable)
  - amount: int (øre)
  - stripe_payment_id: text
  - created_at: timestamp

-- Notifications
notifications
  - id: uuid (PK)
  - user_id: uuid (FK -> users)
  - type: text
  - title: text
  - body: text
  - data: jsonb
  - read: boolean
  - created_at: timestamp

-- RSS Sources
rss_sources
  - id: uuid (PK)
  - name: text
  - url: text
  - is_active: boolean
  - last_fetched: timestamp

-- Lie Database (static reference)
known_lies
  - id: uuid (PK)
  - party: text
  - claim: text
  - truth: text
  - source: text
  - category: text
```

## API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/verify-email
- POST /api/auth/enable-2fa
- GET /api/auth/oauth/google
- GET /api/auth/oauth/apple
- GET /api/auth/oauth/twitter

### Feed
- GET /api/feed?sort=trending|newest|redpill&page=&limit=
- GET /api/posts/:id
- POST /api/posts
- PUT /api/posts/:id
- DELETE /api/posts/:id
- POST /api/posts/:id/vote
- GET /api/posts/:id/comments
- POST /api/posts/:id/comments
- POST /api/posts/:id/report

### AI
- POST /api/ai/fact-check
- POST /api/ai/auto-tag
- POST /api/ai/generate-meme
- POST /api/ai/daily-summary
- POST /api/ai/wake-up-analysis

### Users
- GET /api/users/:id
- PUT /api/users/:id
- GET /api/users/:id/posts
- GET /api/users/:id/stats

### Payments
- POST /api/payments/create-subscription
- POST /api/payments/cancel-subscription
- POST /api/payments/donate
- POST /api/webhooks/stripe

### Notifications
- GET /api/notifications
- PUT /api/notifications/:id/read
- POST /api/notifications/register-push

### Admin/Mod
- GET /api/admin/reports
- POST /api/admin/ban/:userId
- POST /api/admin/shadow-ban/:userId
- DELETE /api/admin/posts/:id

## Tech Stack

### Frontend (Web)
- Next.js 14 (App Router)
- TailwindCSS
- Zustand (state)
- React Query
- PWA (next-pwa)

### Frontend (Mobile)
- Expo SDK 50
- React Native
- Expo Router
- NativeWind

### Backend
- Next.js API Routes
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- OpenAI API (GPT-4)
- Stripe

### Infrastructure
- Vercel (web hosting)
- Expo EAS (mobile builds)
- Supabase Cloud
- Cloudflare R2 (S3-compatible storage)

## Mappestruktur

```
rodpille-norge/
├── apps/
│   ├── web/                 # Next.js PWA
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   ├── mobile/              # Expo React Native
│   │   ├── app/
│   │   ├── components/
│   │   └── assets/
│   └── admin/               # Admin panel
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── database/            # Supabase client & types
│   ├── ai-agents/           # AI fact-check chain
│   └── config/              # Shared configs
├── supabase/
│   ├── migrations/
│   └── functions/
├── turbo.json
└── package.json
```
