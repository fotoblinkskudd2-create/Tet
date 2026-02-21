# Tet Problem Solver

A joyful command-line helper and full-stack application that solves puzzles, generates creative prompts, and provides panic-support protocols.

## Quick start

```bash
pip install -r requirements.txt
python app.py "2 + 3 * 4"
```

## CLI usage

### Problem solver

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

### Creative prompt builder

Generate ready-to-paste creative briefs for photos, video, music, art, or poetry (mobile-friendly for iOS web inputs):

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"
```

### Panic support protocol

Triggered automatically when the solver detects panic-related keywords. Provides grounding techniques, breathing exercises, and emergency guidance.

## Running tests

```bash
python -m pytest tests/ -v
```

## Architecture

| Layer | Stack | Location |
|-------|-------|----------|
| CLI solver | Python 3.12+, AST-based safe eval | `app.py` |
| Backend API | Express, JWT, bcrypt | `backend/src/routes/` |
| Frontend | Next.js, React, TypeScript | `frontend/src/pages/` |
| Database | PostgreSQL | `migrations/` |

### Security measures

- Math eval: exponent cap, expression length limit, AST node budget
- Auth: email/username/password validation, bcrypt 12 rounds, constant-time login comparison, httpOnly session cookies, `Bearer` token parsing hardened
- Frontend: client-side validation mirroring server rules, ARIA attributes, abort-safe fetches
