"""Backwards-compatible entry point for the Tet problem solver.

The implementation now lives in the :mod:`tet` package. This module re-exports
the long-standing public names so existing imports and the ``python app.py``
invocation keep working unchanged.
"""

from __future__ import annotations

from tet import Solution, build_creative_prompt, candidate_solutions, solve_problem
from tet.cli import main

__all__ = [
    "Solution",
    "solve_problem",
    "candidate_solutions",
    "build_creative_prompt",
    "main",
]


if __name__ == "__main__":
    raise SystemExit(main())
