# Tet Problem Solver

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

## SocialPoster - iOS React Web App

An iOS-optimized React web app for creating and scheduling social media content across 5 platforms, up to 4 times per day.

### Supported Platforms

- Instagram - Photos and stories
- Facebook - Posts and sharing
- X (Twitter) - Short messages (280 chars)
- TikTok - Video content
- LinkedIn - Professional networking

### Features

- **Dashboard** (`/social`) - Overview of today's posts, stats, and schedule
- **Content Composer** (`/social/compose`) - Create posts with AI-powered content suggestions, hashtag management, and multi-platform publishing
- **Schedule Manager** (`/social/schedule`) - Day and week views with 4 daily time slots (09:00, 12:00, 17:00, 20:00)
- **Platform Manager** (`/social/platforms`) - Connect and manage all 5 social media accounts
- **iOS PWA** - Add to Home Screen for a native app experience with safe area support and dark mode

### Tech Stack

- **Frontend**: Next.js, React, TypeScript, CSS (iOS design system)
- **Backend**: Express.js, TypeScript, in-memory storage
- **Auth**: JWT-based session management

### Running the App

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:3001`.
