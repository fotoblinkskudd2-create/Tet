"""Tet — a joyful, extensible problem-solving engine.

The public surface is intentionally tiny::

    from tet import solve_problem, build_creative_prompt, Solution

    print(solve_problem("2 + 3 * 4").format())

Everything else (the registry, individual solvers, the CLI) is available
under :mod:`tet.core`, :mod:`tet.solvers` and :mod:`tet.cli` for those who
want to compose their own behaviour.
"""

from __future__ import annotations

from typing import List, Optional

from .core import Registry, Solution, Solver
from .intelligence import suggestions
from .solvers import all_solvers, build_creative_prompt, default_registry

__version__ = "0.2.0"

__all__ = [
    "Solution",
    "Solver",
    "Registry",
    "solve_problem",
    "candidate_solutions",
    "suggestions",
    "build_creative_prompt",
    "default_registry",
    "all_solvers",
    "__version__",
]

# A single shared registry keeps the common path allocation-free and lets the
# lru-cached dictionary index (in the anagram solver) survive between calls.
_REGISTRY: Registry = default_registry()


def solve_problem(problem: str) -> Solution:
    """Return the single best solution for ``problem``.

    The brainstorm fallback guarantees a non-``None`` result, so callers never
    have to handle the empty case.
    """

    solution = _REGISTRY.best(problem)
    assert solution is not None  # brainstorm always matches

    # When nothing specific matched, try to infer intent and offer concrete,
    # copy-pasteable guidance instead of a bare fallback.
    if solution.source == "brainstorm":
        hints = suggestions(problem)
        if hints:
            details = list(solution.details or [])
            solution = Solution(
                kind=solution.kind,
                answer=solution.answer,
                details=details + hints,
                confidence=solution.confidence,
                source=solution.source,
            )
    return solution


def candidate_solutions(problem: str) -> List[Solution]:
    """Return every solver's solution for ``problem``, ranked best-first."""

    return _REGISTRY.candidates(problem)
