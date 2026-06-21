"""A playful, extensible problem-solving CLI application.

This module is a thin facade over the :mod:`solver` package.  The package holds
the capability registry and the individual solvers; everything re-exported here
keeps the original public surface (``solve_problem``, ``build_creative_prompt``,
``Solution``, ``main``) stable for existing callers and tests.
"""
from __future__ import annotations

from solver import REGISTRY, Solution, build_creative_prompt, solve_problem
from solver.cli import main

__all__ = [
    "Solution",
    "REGISTRY",
    "solve_problem",
    "build_creative_prompt",
    "main",
]


if __name__ == "__main__":
    raise SystemExit(main())
