"""Tet problem solver — an extensible, joyful reasoning toolkit.

Public API:
    solve_problem(problem)        -> Solution
    build_creative_prompt(seed)   -> Solution
    Solution, Capability, Registry
    REGISTRY                      -> the populated capability registry
"""
from __future__ import annotations

from typing import Optional

from .core import Capability, Registry, Solution
from . import (
    creative,
    datetime_tools,
    math_eval,
    numbers,
    quant,
    text_tools,
    units,
    wellbeing,
)
from .creative import build_creative_prompt

__all__ = [
    "Solution",
    "Capability",
    "Registry",
    "REGISTRY",
    "solve_problem",
    "build_creative_prompt",
]


def _build_registry() -> Registry:
    registry = Registry()
    for capability in (
        wellbeing.CAPABILITY,
        units.CAPABILITY,
        datetime_tools.CAPABILITY,
        numbers.BASE_CAPABILITY,
        numbers.ROMAN_CAPABILITY,
        numbers.NUMBER_THEORY_CAPABILITY,
        quant.STATISTICS_CAPABILITY,
        quant.PERCENTAGE_CAPABILITY,
        quant.SEQUENCE_CAPABILITY,
        text_tools.ANAGRAM_CAPABILITY,
        text_tools.TEXT_CAPABILITY,
        math_eval.CAPABILITY,
    ):
        registry.register(capability)
    return registry


REGISTRY = _build_registry()


def _brainstorm_steps(problem: str) -> Solution:
    steps = [
        "Name the goal in one joyful sentence.",
        "List the facts and doodle a tiny diagram.",
        "Break the challenge into two bite-sized steps.",
        "Pick the easiest step and start there—momentum is magic!",
    ]
    answer = f"I don't have a direct solver for: '{problem}'. But we can still win together!"
    return Solution(kind="Brainstorm", answer=answer, details=steps, confidence=0.3, tags=("fallback",))


def solve_problem(problem: str, registry: Optional[Registry] = None) -> Solution:
    """Solve a problem by trying each registered capability in priority order.

    The first capability that recognises the problem wins; if none do, an
    upbeat brainstorming scaffold is returned so the user is never stuck.
    """

    active = registry or REGISTRY
    for capability in active.ordered():
        solution = capability.solve(problem)
        if solution is not None:
            return solution
    return _brainstorm_steps(problem)
