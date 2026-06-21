"""Solver implementations and the default registry wiring."""

from __future__ import annotations

from typing import List

from ..core import Registry, Solver
from .anagram import AnagramSolver
from .arithmetic import ArithmeticSolver
from .brainstorm import BrainstormSolver
from .creative import CreativeSolver, build_creative_prompt
from .numeric import (
    BaseConversionSolver,
    PercentageSolver,
    RomanSolver,
    StatisticsSolver,
)
from .temporal import TemporalSolver
from .units import UnitsSolver
from .wellbeing import PanicSupportSolver

__all__ = [
    "AnagramSolver",
    "ArithmeticSolver",
    "BaseConversionSolver",
    "BrainstormSolver",
    "CreativeSolver",
    "PanicSupportSolver",
    "PercentageSolver",
    "RomanSolver",
    "StatisticsSolver",
    "TemporalSolver",
    "UnitsSolver",
    "build_creative_prompt",
    "default_registry",
    "all_solvers",
]


def all_solvers() -> List[Solver]:
    """Every solver Tet knows about, including the creative builder.

    The creative solver is *not* part of auto-dispatch (it would match almost
    any text), but it belongs in enumeration/help output.
    """

    return [
        ArithmeticSolver(),
        UnitsSolver(),
        TemporalSolver(),
        BaseConversionSolver(),
        RomanSolver(),
        PercentageSolver(),
        StatisticsSolver(),
        AnagramSolver(),
        PanicSupportSolver(),
        CreativeSolver(),
        BrainstormSolver(),
    ]


def default_registry() -> Registry:
    """The registry used by :func:`tet.solve_problem`.

    Order is mostly cosmetic because ranking is by confidence, but the
    wellbeing solver is placed first so that, on a confidence tie, support
    wins. The creative solver is intentionally excluded (see above), and the
    brainstorm fallback is registered last.
    """

    registry = Registry()
    registry.register(PanicSupportSolver())
    registry.register(ArithmeticSolver())
    registry.register(UnitsSolver())
    registry.register(TemporalSolver())
    registry.register(BaseConversionSolver())
    registry.register(RomanSolver())
    registry.register(PercentageSolver())
    registry.register(StatisticsSolver())
    registry.register(AnagramSolver())
    registry.register(BrainstormSolver())
    return registry
