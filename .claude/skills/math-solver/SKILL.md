---
name: math-solver
description: Use when extending or debugging the arithmetic solver (_safe_math_eval, _solve_math) in app.py — e.g. adding a new operator, handling a new numeric format, or fixing an evaluation bug.
---

# Math Solver

`_safe_math_eval` in `app.py` walks a Python `ast` tree and only evaluates whitelisted node types (`allowed_bin_ops`, `allowed_unary_ops`). It never calls `eval()`.

To add an operator:
1. Add the `ast` node type and its `operator` function to `allowed_bin_ops` or `allowed_unary_ops`.
2. Confirm `_evaluate` already dispatches on `type(node.op) in allowed_bin_ops` — no other change needed.
3. Add a regression test in `tests/test_app.py` covering the new operator.

Never widen `_evaluate` to accept `ast.Call`, `ast.Name`, or `ast.Attribute` — that reopens the arbitrary-code-execution risk `_safe_math_eval` exists to close.
