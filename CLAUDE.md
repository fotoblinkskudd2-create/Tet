# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## Repository overview

This repo currently contains two unrelated efforts at very different stages of maturity:

1. **`app.py` — "Tet Problem Solver" (Python CLI)**. A small, self-contained, fully-tested
   command-line tool. This is the only part of the repo with a working test suite and is
   the most actively developed piece.
2. **Web app scaffolding (`backend/`, `frontend/`, `migrations/`)**. Early, disconnected
   source files for what looks like a rating-based game/chess platform with user accounts
   (email/username/password, ELO-style `rating`, win/loss/draw stats). There is **no
   build tooling yet** — no `package.json`, `tsconfig.json`, framework config, or
   dependency manifest for either `backend/` or `frontend/`. Treat these as design
   references/snippets rather than a runnable app until tooling is added.

Root also contains `Cursor` (an empty placeholder file from an early commit) and
`README.md` (usage docs for `app.py`).

## Repository structure

```
app.py                                 # CLI entry point, all solver logic
tests/
  conftest.py                          # adds repo root to sys.path so `import app` works
  test_app.py                          # pytest tests for app.py
backend/src/routes/auth.ts             # Express router: signup/login/me (in-memory store)
frontend/src/pages/auth/login.tsx      # Next.js login page (Norwegian UI)
frontend/src/pages/auth/signup.tsx     # Next.js signup page (Norwegian UI)
frontend/src/pages/profile/[id].tsx    # Next.js user profile page (Norwegian UI)
migrations/001_create_users.sql        # Postgres `users` table + updated_at trigger
README.md                              # Usage docs for the CLI
```

## `app.py` — Tet Problem Solver

A playful CLI that takes a free-text "problem" and tries a chain of solvers in order
(`solve_problem`):

1. `_solve_math` — evaluates arithmetic via a restricted AST walker (`_safe_math_eval`).
   **Never replace this with `eval()`** — only the operators in `allowed_bin_ops` /
   `allowed_unary_ops` are permitted, by design, for safety.
2. `_solve_anagram` — looks up word jumbles in the small `_ANAGRAM_LIBRARY` dict.
3. `_solve_panic_support` — detects panic/anxiety-related keywords (English + Norwegian,
   e.g. "panik", "angst", "kan ikke puste") and returns a structured grounding/breathing
   protocol. This is safety-sensitive content — preserve the emergency-line guidance and
   the calm, methodical tone if editing.
4. `_brainstorm_steps` — fallback when nothing else matches; always upbeat.

All solvers return a `Solution` dataclass (`kind`, `answer`, `details`) whose `.format()`
produces the banner + answer + bullet list shown to the user.

Separately, `build_creative_prompt` (invoked via `--prompt`) turns a short seed phrase
into a structured creative brief for photo/video/music/art/poem mediums, using
`_MEDIUM_SYNONYMS` for alias detection and `_CREATIVE_RECIPES` for the per-medium
style/structure/platform/delivery text. Keep the "mobile-first, short sentences, no
markdown" framing — it's tailored for iOS web share sheets.

### CLI usage

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

## Development workflow

### Python (`app.py` + tests)

- Requires Python 3.11+ (no third-party runtime dependencies — stdlib only).
- Tests use `pytest` but it is **not pre-installed** in this environment; install it
  first if needed: `pip install pytest`.
- Run the test suite from the repo root:
  ```bash
  python3 -m pytest tests/ -v
  ```
- `tests/conftest.py` inserts the repo root onto `sys.path` so tests can `import app`
  directly — keep `app.py` at the repo root.
- When adding a new solver, add it to the tuple in `solve_problem` (order matters — more
  specific solvers should run before the generic brainstorm fallback) and add a
  corresponding test in `tests/test_app.py`.

### Backend (`backend/src/routes/auth.ts`)

- Express router using `jsonwebtoken`, `bcryptjs`, and `uuid`. Currently has **no**
  `package.json`/build config in this repo — it's a standalone source file.
- Auth design conventions to preserve if extending:
  - Sessions are JWTs (7-day expiry) stored in an `httpOnly`, `sameSite: lax` cookie
    named `session`; `secure` is gated on `NODE_ENV === 'production'`.
  - `parseTokenFromRequest` also accepts a Bearer token via `Authorization` header as a
    fallback to the cookie.
  - User store is an in-memory `Map<string, User>` — not persisted. The
    `migrations/001_create_users.sql` schema describes the intended Postgres shape
    (UUID id, unique email/username, `rating` default 1200, win/loss/draw/games_played
    counters, `updated_at` trigger) but the route handlers don't talk to a DB yet. If you
    wire up persistence, align field names with this migration (`password_hash`,
    `games_played`, etc., snake_case in SQL vs camelCase in TS).
  - Passwords hashed with `bcryptjs` (cost factor 10). Email is lower-cased before
    storage/lookup; both email and username must be unique.

### Frontend (`frontend/src/pages/...`)

- Next.js pages (pages router, `.tsx`), no framework config present yet.
- **UI copy is in Norwegian (Bokmål)** — keep new user-facing strings consistent with
  existing ones (e.g. "Logg inn", "Opprett konto", "Kunne ikke logge inn", "Laster
  profil...").
- Pages call relative API routes (`/api/auth/login`, `/api/auth/signup`,
  `/api/users/{id}`) — these correspond conceptually to the backend router in
  `backend/src/routes/auth.ts`, though no actual API wiring/proxy exists yet.
- `frontend/src/pages/profile/[id].tsx` expects a `UserProfile` shape
  (`id`, `username`, `rating`, `stats: {gamesPlayed, wins, losses, draws}`) matching the
  `User`/`UserStats` interfaces in the backend router.

## General conventions

- Keep the playful, upbeat tone of `app.py`'s user-facing strings — it's intentional
  product voice, not filler.
- This repo has no linter/formatter config (no `.eslintrc`, `pyproject.toml`, etc.) —
  match the existing style of whichever file you're editing.
- Don't add new top-level dependency manifests (`package.json`, `requirements.txt`,
  etc.) speculatively; only add them when actually wiring up a runnable build for
  `backend/` or `frontend/`.
