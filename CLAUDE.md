# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Install all dependencies (Python + backend + frontend):**
```bash
make install        # all three layers
make install-py     # pytest only
make install-backend
make install-frontend
```

**Run the CLI app:**
```bash
python app.py "2 + 3 * 4"
python app.py "anagram of listen"
python app.py "I am having a panic attack"
python app.py --prompt --medium photo "sunset pier"
python app.py --help
```

**Test, lint, build, clean:**
```bash
make test                                                                 # run pytest
make lint                                                                 # tsc --noEmit on backend + frontend
make build                                                                # compile TypeScript
make clean                                                                # remove build artefacts
python -m pytest tests/test_app.py::test_math_solver_handles_basic_expression -v  # single test
```

## Architecture

This is a **three-layer project** where only the Python CLI is fully implemented. The TypeScript backend and Next.js frontend are early-stage stubs that are not yet integrated with each other or with the CLI.

### Python CLI (`app.py`)

The core application. Zero external dependencies — stdlib only.

**Request routing** in `solve_problem()` tries each solver in priority order:
1. `_solve_math()` — AST-based safe arithmetic (prevents code injection via `ast.literal_eval`-style parsing)
2. `_solve_anagram()` — Dictionary lookup against `_ANAGRAM_LIBRARY`
3. `_solve_panic_support()` — Keyword detection → 8-step structured protocol
4. `_brainstorm_steps()` — Upbeat fallback for everything else

The `--prompt` flag routes instead to `build_creative_prompt()`, which uses `_CREATIVE_RECIPES` (a dict keyed by medium: photo, video, music, art, poem) to produce iOS-optimized output (short sentences, no markdown). Medium is either specified via `--medium` or auto-detected from the seed text by `_detect_medium_from_text()`.

All solvers return a `Solution` dataclass:
```python
@dataclass
class Solution:
    kind: str
    answer: str
    details: Optional[List[str]] = None
```

### TypeScript Backend (`backend/src/routes/auth.ts`)

Express.js auth routes: `POST /signup`, `POST /login`, `GET /me`. Uses bcrypt for password hashing and JWT for tokens. Auth middleware supports both session cookies and Bearer tokens. No `package.json` exists yet — dependencies (`express`, `jsonwebtoken`, `bcryptjs`, `uuid`) are imported but not installed.

### Next.js Frontend (`frontend/src/pages/`)

Pages: `/auth/login`, `/auth/signup`, `/profile/[id]` (dynamic). UI labels are in Norwegian. No `package.json` or `tsconfig.json` exists yet.

### Database (`migrations/001_create_users.sql`)

PostgreSQL. Single `users` table with UUID primary key, email, username, password_hash, Elo-style `rating`, JSONB `stats` (games_played/wins/losses/draws), and auto-updating `updated_at` trigger. No connection/ORM code exists yet.

## Key Conventions

- The Python CLI tone is intentionally upbeat and encouraging — maintain this in any new solver output.
- `_safe_math_eval()` uses AST node whitelisting, not `eval()`. Never replace it with `eval()`.
- Creative prompt output is intentionally plain-text/iOS-friendly — no markdown, short sentences.
- Tests live in `tests/` with `conftest.py` adding the project root to `sys.path`.
