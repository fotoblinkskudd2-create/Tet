---
name: solution-formatting
description: Use when changing the Solution dataclass or its .format() method in app.py — controls how every solver's output is rendered to the terminal, including the emoji banner and bullet details.
---

# Solution Formatting

`Solution` (`app.py`) is the single output type every solver returns: `kind`, `answer`, and optional `details: List[str]`. `.format()` renders a `"✨ {kind} solution ready! ✨"` banner, then `answer`, then each detail prefixed with `"- "` on its own line, joined with `"\n"`.

This is the only rendering path — `main` always calls `solution.format()` before printing, regardless of which solver or `build_creative_prompt` produced the `Solution`. If you need solver-specific formatting (e.g. numbered steps instead of bullets), that has to be a new field/branch on `Solution.format()` itself, not a per-solver override, since nothing else calls into solver internals directly.

Tests assert against `solution.answer` and `solution.details` directly (not the rendered string), so changing `.format()`'s presentation doesn't require touching `tests/test_app.py` unless you also change what data solvers populate.
