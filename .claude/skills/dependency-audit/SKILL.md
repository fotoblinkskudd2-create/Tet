---
name: dependency-audit
description: Use when asked about this repo's dependencies, packaging, or whether a new import is safe to add to app.py — the project currently has zero third-party runtime dependencies.
---

# Dependency Audit

`app.py` imports only from the Python standard library (`argparse`, `ast`, `operator`, `re`, `dataclasses`, `typing`). There is no `requirements.txt`, `pyproject.toml`, or `setup.py` in the repo root — check before assuming one exists.

Before adding a third-party import:
- Confirm it's actually necessary — the project's value is partly its zero-dependency simplicity (`_safe_math_eval` reimplements safe evaluation with `ast` specifically to avoid pulling in a sandboxing library).
- If a dependency is genuinely needed, add a `requirements.txt` at the repo root rather than assuming `pip install` state is implicit.
- `tests/` only needs `pytest` — check `tests/conftest.py` for any fixture-level dependencies before adding test-only packages.
