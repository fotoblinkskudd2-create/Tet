---
name: brainstorm-fallback-tuning
description: Use when editing _brainstorm_steps in app.py, the catch-all solver that responds when no other solver (math, anagram, panic support) matches the input.
---

# Brainstorm Fallback Tuning

`_brainstorm_steps` is unconditional — it never returns `None` and is only reached when every solver in `solve_problem`'s tuple has already returned `None`. It always returns four fixed steps (name the goal, list facts, break into two steps, start with the easiest).

Because it's the universal fallback, treat changes here as affecting *every* unmatched query, not a narrow case:
- `tests/test_app.py::test_brainstorm_fallback_is_upbeat` asserts both a literal phrase ("win together") in `answer` and "joyful" inside one of the `details` — keep at least one detail upbeat in tone if you edit the wording.
- If you want a query to get a more specific response instead of this generic fallback, that means writing a new dedicated solver (see `solver-dispatch-order` skill) and placing it earlier in the dispatch tuple — don't special-case it inside `_brainstorm_steps`.
