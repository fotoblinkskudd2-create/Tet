# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This repo contains two components:

1. **Tet Problem Solver** (`app.py`) — A fully functional Python CLI that solves math expressions, anagrams, provides panic support, brainstorming steps, and generates structured creative prompts. Uses only Python stdlib (no external runtime dependencies). This is the primary runnable product.
2. **Web platform skeleton** (`backend/`, `frontend/`, `migrations/`) — Skeleton TypeScript code for an Express backend and Next.js frontend with a PostgreSQL migration. These have **no `package.json` files** and cannot be built or run as-is.

### Running the application

```bash
python3 app.py "2 + 3 * 4"
python3 app.py --prompt --medium photo "misty forest boardwalk at dawn"
```

See `README.md` for full CLI usage.

### Testing

```bash
python3 -m pytest tests/ -v
```

All tests are in `tests/test_app.py`. The `conftest.py` adds the project root to `sys.path`.

### Linting

No linter is configured in the repo. You can run `ruff check app.py tests/` for basic Python linting.

### Non-obvious notes

- The app uses only Python stdlib — no `requirements.txt` or `pyproject.toml` exists. The only dev dependency is `pytest`.
- The `backend/` and `frontend/` directories contain TypeScript source files but lack `package.json`, `tsconfig.json`, and all other config files needed to build/run them. Do not attempt to build or run these without first creating the necessary config and installing dependencies.
- The `migrations/001_create_users.sql` file is standalone SQL; no migration runner is configured.
