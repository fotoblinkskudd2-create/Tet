# Tet - Playful Productivity Tools

A collection of productivity tools with unique twists, ranging from joyful problem-solving to psychotic productivity tracking.

## Projects

### 🔥 Psykotisk Pomodoro Timer

A Pomodoro timer with a dark, surrealistic twist. Each time 25 minutes is up, Claude AI generates a disturbing yet motivating message. Features a glitchy, horror-aesthetic design with visual effects.

**Quick Start:**
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000/pomodoro
```

See [POMODORO_README.md](./POMODORO_README.md) for full documentation.

### 🧠 Tet Problem Solver (CLI)

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

**Usage:**
```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

## Project Structure

```
Tet/
├── frontend/              # Next.js web application
│   ├── src/pages/
│   │   ├── pomodoro.tsx   # Psychotic Pomodoro Timer
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   └── profile/       # User profiles
│   └── public/sounds/     # Audio assets
├── backend/               # Express.js backend
├── app.py                 # Python CLI problem solver
├── migrations/            # Database migrations
└── tests/                 # Test suite
```
