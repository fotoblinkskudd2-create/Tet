---
name: regression-test-writer
description: Use when writing a new pytest test in tests/test_app.py for app.py — covers the existing test conventions (one solver/feature per test, asserting on Solution.kind and substrings of .answer/.details).
---

# Regression Test Writer

`tests/test_app.py` follows one pattern per test: call `app.solve_problem(...)` or `app.build_creative_prompt(...)`, assert `solution.kind` matches the expected solver name, then assert on specific substrings inside `solution.answer` or `solution.details` rather than full-string equality — this keeps tests resilient to copy tweaks in the surrounding prose.

When adding a test for a new behavior:
1. Name it `test_<behavior>_<expected_outcome>` (e.g. `test_creative_prompt_detects_wide_from_text`).
2. Assert `.kind` first — it's the cheapest signal that dispatch routed correctly.
3. Use lowercase substring checks (`"foo" in solution.answer.lower()`) to avoid brittle case-sensitivity failures.
4. Run `python -m pytest tests/ -v` (see the `run-tests` skill) before considering the change done.
