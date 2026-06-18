# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo is two unrelated things living side by side:

1. **`app.py`** — a standalone Python CLI ("Tet Problem Solver"), the only part of the repo with tests and an actual runtime. This is where most work happens today.
2. **`backend/`, `frontend/`, `migrations/`** — a sketch of a separate web app (auth + user profiles, looks like a chess/game site given `rating`/`wins`/`losses`/`draws`). These are isolated, uncompiled `.ts`/`.tsx`/`.sql` files with no `package.json`, build config, or dependency manifest anywhere in the repo — they cannot currently be installed, built, or run. Treat them as a design reference, not a working app, unless you add the missing project scaffolding first.

There is no top-level package.json, requirements.txt, or pyproject.toml. Python dependencies are stdlib-only except `pytest` for tests.

## Commands

```bash
# Run the CLI
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py --prompt --medium photo "misty forest boardwalk at dawn"

# Run tests (install pytest first if not present)
pip install pytest
python -m pytest tests/

# Run a single test
python -m pytest tests/test_app.py::test_math_solver_handles_basic_expression
```

`tests/conftest.py` adds the repo root to `sys.path` so `tests/test_app.py` can `import app` directly without packaging.

## Architecture: `app.py`

Everything lives in one module, dispatched through `solve_problem()`:

- **Solver chain** (`solve_problem`): tries solvers in order — `_solve_math` (safe AST-based arithmetic eval, no `eval()`), `_solve_anagram` (lookup against a small hardcoded `_ANAGRAM_LIBRARY`), `_solve_panic_support` (keyword-triggered grounding/breathing protocol). First non-`None` result wins; otherwise falls back to `_brainstorm_steps`.
- **Creative prompt mode** (`build_creative_prompt`, invoked via `--prompt`): separate path from the solver chain. Detects a medium (photo/video/music/art/poem) from an explicit `--medium` flag or by scanning the input text against `_MEDIUM_SYNONYMS`, then fills a template from `_CREATIVE_RECIPES` to produce a structured, mobile/iOS-web-friendly prompt.
- **`Solution`** dataclass is the common return type for both paths (`kind`, `answer`, optional `details`), rendered for the terminal via `Solution.format()`.
- Adding a new solver: write a `_solve_x(problem) -> Optional[Solution]` function returning `None` when it doesn't apply, and add it to the tuple in `solve_problem`. Adding a new creative medium: add an entry to `_MEDIUM_SYNONYMS` and a matching one in `_CREATIVE_RECIPES`.

## Conventions

- Norwegian-language UI strings are used in the frontend auth/profile pages (`Logg inn`, `Opprett bruker`, etc.) — match this when touching those files.
- The backend auth route (`backend/src/routes/auth.ts`) stores users in an in-memory `Map`, hashes passwords with bcrypt, and issues JWTs as an httpOnly `session` cookie (falling back to an `Authorization` header). `migrations/001_create_users.sql` is the intended Postgres schema backing it, but the route doesn't actually use a database — reconcile these if building this out further.
