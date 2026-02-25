# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is a multi-component project ("Tet Problem Solver") with three services:

| Component | Tech | Port | Purpose |
|---|---|---|---|
| Python CLI | Python 3.12 (stdlib only) | N/A | Problem solver, creative prompt builder (main product) |
| Backend API | Express.js + TypeScript | 3001 | Auth API (signup/login/session) with in-memory store |
| Frontend | Next.js 14 (React + TS) | 3000 | Norwegian-language auth UI (login, signup, profile) |

### Running services

- **Python CLI**: `python3 app.py "your problem"` from repo root. See `README.md` for usage examples.
- **Python tests**: `pytest tests/ -v` from repo root.
- **Backend**: `cd backend && npx ts-node src/index.ts` (listens on port 3001).
- **Frontend**: `cd frontend && npx next dev -p 3000` (listens on port 3000, proxies `/api/*` to backend via `next.config.js` rewrites).

### Non-obvious notes

- The Python CLI uses **only stdlib modules** — no `requirements.txt` needed. The only external Python dependency is `pytest` for running tests.
- The backend uses an **in-memory `Map`** for user storage — no PostgreSQL needed at runtime. The `migrations/` SQL file is for future use.
- The frontend ESLint config is at `frontend/.eslintrc.json`. Without it, `next lint` prompts interactively — always keep this file present.
- The frontend proxies API calls to the backend via `next.config.js` rewrites. Both services must be running for the auth flow to work end-to-end.
- TypeScript type-checking: `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc --noEmit`.
