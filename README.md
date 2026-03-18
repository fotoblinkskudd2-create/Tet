# Grafset + OpenClaw

A smart iOS-web app for budget-friendly creative ideas, AI agent assistance, and promoting content through OpenClaw. Built on top of a playful problem-solving CLI.

## Features

- **Grafset Smart Ideas** — Browse curated budget-friendly creative ideas across design, marketing, content, social, and branding categories
- **Smart Agent Assistant** — Describe an idea in a few words and the AI agent shapes it into a production-ready creative brief
- **OpenClaw Promo** — Submit and promote your best Grafset ideas to the OpenClaw community
- **iOS Web Optimized** — Responsive layout with safe-area support, PWA manifest, no-zoom inputs, and compact paste-ready outputs for mobile Safari
- **Multi-Medium Support** — Photo, video, music, art, and poetry prompts in one place

## Web App Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with navigation to Grafset and OpenClaw |
| `/grafset` | Smart ideas catalog with category filters and inline agent assistant |
| `/openclaw` | Promotion submission form and community feed |
| `/auth/login` | User login |
| `/auth/signup` | User registration |
| `/profile/[id]` | Player profile and stats |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/grafset/agent` | Generate a creative prompt from a seed phrase |
| GET | `/api/grafset/ideas` | List all smart cheap ideas with agent tips |
| POST | `/api/openclaw/promote` | Submit a new promotional entry |
| GET | `/api/openclaw/feed` | Retrieve recent promotions |
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get current user (requires auth) |

## CLI Usage

The Python CLI still works standalone for quick prompt generation:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

### Build creative prompts for iOS web

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.

## Project Structure

```
├── app.py                          # Python CLI — problem solver + creative prompt builder
├── frontend/
│   ├── public/manifest.json        # PWA manifest for iOS home-screen install
│   └── src/
│       ├── pages/
│       │   ├── index.tsx            # Home page
│       │   ├── _app.tsx             # App wrapper with iOS meta tags
│       │   ├── _document.tsx        # Document with apple-touch-icon
│       │   ├── grafset/index.tsx    # Grafset Smart Ideas + agent assistant
│       │   ├── openclaw/index.tsx   # OpenClaw promotion page
│       │   ├── auth/login.tsx       # Login form
│       │   ├── auth/signup.tsx      # Registration form
│       │   └── profile/[id].tsx     # User profile
│       └── styles/globals.css       # iOS-optimized responsive styles
├── backend/
│   └── src/routes/
│       ├── auth.ts                  # Authentication routes
│       ├── grafset.ts               # Grafset agent + ideas API
│       └── openclaw.ts              # OpenClaw promotion API
├── migrations/
│   └── 001_create_users.sql         # PostgreSQL schema
└── tests/
    ├── test_app.py                  # Original CLI tests
    ├── test_grafset.py              # Grafset agent tests
    └── test_openclaw.py             # OpenClaw promotion tests
```
