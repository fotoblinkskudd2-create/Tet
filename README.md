# Tet

A full-stack application featuring:
- **News Scanner**: Scans news from Norway, USA, and the world, filters out bullshit, and presents pure facts
- **Problem Solver CLI**: A joyful command-line helper for solving puzzles and generating creative prompts
- **Authentication System**: User management with JWT-based authentication

## News Scanner

Tet's News Scanner automatically fetches news from multiple sources across Norway, USA, and the world, uses AI to filter out opinions and speculation, and presents only verified facts.

### Features

- **Multi-region coverage**: Norway, USA, and World news
- **Fact extraction**: AI-powered filtering removes opinions, speculation, and clickbait
- **Automatic categorization**: Articles are categorized into politics, economy, technology, health, etc.
- **Real-time updates**: Automatic scanning every 30 minutes
- **Clean UI**: Modern, responsive interface with dark mode support

### Architecture

#### Backend (Node.js/TypeScript)
- Express.js REST API
- PostgreSQL database
- RSS feed parsing
- OpenAI integration for fact extraction
- Automated cron jobs for news scanning

#### Frontend (Next.js/React)
- Server-side rendering
- Tailwind CSS styling
- Real-time article filtering
- Responsive design

### Getting Started

#### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Python 3.8+ (for CLI tools)
- OpenAI API key (optional, for enhanced fact filtering)

#### Database Setup

1. Create a PostgreSQL database:
```bash
createdb tet_db
```

2. Run migrations:
```bash
psql -d tet_db -f migrations/001_create_users.sql
psql -d tet_db -f migrations/002_create_articles.sql
```

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tet_db
PORT=3001
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-api-key  # Optional
```

5. Start the backend server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### API Endpoints

#### News Endpoints

- `GET /api/news` - Get all news articles (with optional filters)
  - Query params: `region`, `category`, `source`, `limit`, `offset`
- `GET /api/news/:id` - Get single article by ID
- `GET /api/news/stats` - Get statistics about news sources
- `GET /api/news/search/query` - Search articles
- `GET /api/news/meta/regions` - Get available regions
- `GET /api/news/meta/sources` - Get available sources

#### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Manual News Scanning

You can manually trigger a news scan:

```bash
cd backend
npm run scan-news
```

### News Sources

**Norway:**
- NRK
- VG
- Aftenposten
- Dagbladet

**USA:**
- NPR
- New York Times
- Washington Post

**World:**
- BBC World
- The Guardian
- Al Jazeera

### How Fact Filtering Works

The news scanner uses OpenAI's GPT-4o-mini to analyze each article and:

1. **Remove**:
   - Subjective opinions and viewpoints
   - Speculation and assumptions
   - Emotional language and exaggerations
   - Clickbait and sensationalism
   - Ad content and sponsored material
   - Irrelevant details

2. **Keep**:
   - Verifiable facts and events
   - Concrete numbers and statistics
   - Quotes from named sources
   - Dates, locations, and specific details
   - Objective descriptions of events

3. **Categorize**: Automatically categorizes articles into relevant topics

## Problem Solver CLI

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

## Usage

Run the solver with your problem statement:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.
