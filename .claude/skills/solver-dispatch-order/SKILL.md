---
name: solver-dispatch-order
description: Use when adding a brand-new solver function to app.py's solve_problem dispatcher, or debugging why a query is answered by the wrong solver (e.g. brainstorm fallback instead of a specific solver).
---

# Solver Dispatch Order

`solve_problem` in `app.py` tries solvers in a fixed tuple order: `(_solve_math, _solve_anagram, _solve_panic_support)`. The first one to return a non-`None` `Solution` wins; if all return `None`, `_brainstorm_steps` is the catch-all fallback.

When adding a new solver:
1. Write it as `def _solve_x(problem: str) -> Optional[Solution]:` returning `None` when it doesn't apply — never raise for a non-match.
2. Add it to the tuple in `solve_problem`. Position matters: put narrower/more specific matchers before broader ones to avoid them stealing queries.
3. Add a test that confirms both the positive match and that an adjacent solver's test cases still pass unchanged (regression check for ordering conflicts).

This dispatcher is separate from `build_creative_prompt`, which is only reached via the `--prompt` CLI flag in `main` and never runs through `solve_problem`.
