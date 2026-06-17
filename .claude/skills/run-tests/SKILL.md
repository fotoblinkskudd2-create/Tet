---
name: run-tests
description: Use when verifying changes to app.py or adding new solver/prompt behavior in this repo. Runs the pytest suite in tests/ and explains failures by mapping them back to the solver function involved.
---

# Run Tests

```bash
python -m pytest tests/ -v
```

- Tests live in `tests/test_app.py`, fixtures in `tests/conftest.py`.
- Each test targets one solver (`_solve_math`, `_solve_anagram`, `_solve_panic_support`) or `build_creative_prompt`. A failure in `test_creative_prompt_*` means a recipe in `_CREATIVE_RECIPES` or a detector (`_detect_medium_from_text`, `_detect_wide_orientation`) changed behavior.
- After editing `app.py`, always run the full suite before reporting work as done — solvers are dispatched in a fixed order in `solve_problem`, so a new keyword match can silently steal cases from an existing solver.
