---
name: release-checklist
description: Use before tagging or shipping a change to app.py as "done" — a checklist covering tests, README sync, and CLI help text consistency for this repo.
---

# Release Checklist

Before reporting a change to `app.py` as complete:

1. `python -m pytest tests/ -v` passes (see `run-tests` skill).
2. `python app.py --help` output still matches what's documented in `README.md` (see `readme-usage-sync` skill) — argparse `help=` strings are the source of truth.
3. Manually run the changed code path once, e.g. `python app.py --prompt --medium photo "<seed>"`, to confirm the printed `Solution.format()` output reads correctly — tests check substrings, not the full rendered banner.
4. No new solver silently shadows an existing one (see `solver-dispatch-order` skill) — run a couple of the *other* solvers' example inputs too.
