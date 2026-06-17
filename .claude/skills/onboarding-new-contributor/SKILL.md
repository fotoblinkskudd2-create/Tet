---
name: onboarding-new-contributor
description: Use at the start of a session working on this repo for the first time, or when asked "what is this project" — gives a fast orientation to Tet Problem Solver's structure before diving into a specific change.
---

# Onboarding: Tet Problem Solver

This is a small, single-file CLI tool (`app.py`) plus a pytest suite (`tests/`). There is no build step, no third-party runtime dependency, and no `requirements.txt` — `python app.py "<problem>"` just works.

Two modes:
- **Solver mode** (default): `solve_problem()` dispatches across math, anagram, and panic-support solvers, falling back to a generic brainstorm response.
- **Prompt mode** (`--prompt`): `build_creative_prompt()` turns a short idea into a structured photo/video/music/art/poem prompt sized for pasting into iOS web inputs, with optional wide/panoramic framing via `--wide` or wide-related keywords in the seed text.

Other repo-level skills cover specific subsystems in depth: `math-solver`, `anagram-library`, `panic-support-protocol`, `creative-prompt-builder`, `wide-image-prompts`, `solver-dispatch-order`, `solution-formatting`. Start with whichever matches the part of `app.py` you're touching rather than re-deriving the architecture from scratch.

Note: `backend/`, `frontend/`, and `migrations/` contain an unrelated, separate scaffold (an Express/TypeScript auth router with JWT sessions, a Next.js-style login/signup/profile UI, and a Postgres `users` table migration with rating/stats columns — looks like an early sketch for a game-rating app). It shares no code or tests with `app.py` and isn't wired into the CLI tool; treat it as a separate concern unless the task explicitly asks you to work on it.
