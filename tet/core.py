"""Core abstractions for the Tet solver engine.

This module defines three things and nothing else:

* :class:`Solution` -- the immutable-ish result every solver returns.
* :class:`Solver`   -- the tiny contract a solver must satisfy.
* :class:`Registry` -- a confidence-ranked dispatcher over many solvers.

The design goal is *humble extensibility*: adding a new capability to Tet
should mean writing one small class and registering it, never editing a
giant ``if/elif`` ladder. The registry ranks every candidate by the
confidence it reports, so the most relevant answer wins instead of merely
the first one that happened to match.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence


@dataclass
class Solution:
    """A lightweight, presentation-friendly wrapper for an answer.

    Attributes:
        kind: Human-facing category, e.g. ``"Math"`` or ``"Units"``.
        answer: The headline result, written to be read out loud.
        details: Optional supporting bullet points.
        confidence: How sure the producing solver is that it understood the
            problem, in ``[0.0, 1.0]``. The registry uses this to rank
            competing solutions.
        source: The registered name of the solver that produced this, filled
            in automatically by the registry.
    """

    kind: str
    answer: str
    details: Optional[List[str]] = None
    confidence: float = 1.0
    source: Optional[str] = None

    def format(self) -> str:
        """Return a friendly, terminal-ready representation."""

        banner = f"✨ {self.kind} solution ready! ✨"
        parts = [banner, self.answer]
        if self.details:
            parts.append("\n".join(f"- {line}" for line in self.details))
        return "\n".join(parts)

    def to_dict(self) -> Dict[str, object]:
        """Return a JSON-serialisable view of the solution."""

        return {
            "kind": self.kind,
            "answer": self.answer,
            "details": list(self.details) if self.details else [],
            "confidence": round(self.confidence, 4),
            "source": self.source,
        }


class Solver:
    """Base class describing the contract every solver satisfies.

    Subclasses set :attr:`name` and :attr:`kind` and implement
    :meth:`solve`. ``solve`` returns ``None`` when the solver does not
    recognise the problem, or a :class:`Solution` (ideally with a calibrated
    ``confidence``) when it does.
    """

    #: Stable identifier, used for ``--list`` and the ``source`` field.
    name: str = "solver"
    #: Default human-facing category for produced solutions.
    kind: str = "Solution"
    #: One-line description for help output.
    description: str = ""

    def solve(self, problem: str) -> Optional[Solution]:  # pragma: no cover
        raise NotImplementedError

    # -- small ergonomic helper so subclasses stay terse --------------------
    def make(
        self,
        answer: str,
        details: Optional[Sequence[str]] = None,
        confidence: float = 1.0,
    ) -> Solution:
        """Build a :class:`Solution` pre-tagged with this solver's identity."""

        return Solution(
            kind=self.kind,
            answer=answer,
            details=list(details) if details else None,
            confidence=confidence,
            source=self.name,
        )


@dataclass
class Registry:
    """A confidence-ranked collection of solvers.

    Solvers are tried in registration order, but results are *ranked* by
    confidence, so order only breaks ties. A fallback solver (one that always
    produces a low-confidence answer) guarantees the registry never returns
    nothing useful.
    """

    solvers: List[Solver] = field(default_factory=list)

    def register(self, solver: Solver) -> Solver:
        """Add a solver. Returns it so it can be used as a decorator."""

        self.solvers.append(solver)
        return solver

    def names(self) -> List[str]:
        return [s.name for s in self.solvers]

    def candidates(self, problem: str) -> List[Solution]:
        """Return every non-empty solution, ranked best-first.

        Ranking is by descending confidence; ties keep registration order,
        which lets callers express deliberate preferences (e.g. safety-first
        solvers registered early).
        """

        found: List[tuple[int, Solution]] = []
        for index, solver in enumerate(self.solvers):
            try:
                solution = solver.solve(problem)
            except Exception:
                # A misbehaving solver must never sink the whole query.
                continue
            if solution is None:
                continue
            if solution.source is None:
                solution.source = solver.name
            found.append((index, solution))

        found.sort(key=lambda pair: (-pair[1].confidence, pair[0]))
        return [solution for _, solution in found]

    def best(self, problem: str) -> Optional[Solution]:
        """Return the single best solution, or ``None`` if nothing matched."""

        ranked = self.candidates(problem)
        return ranked[0] if ranked else None
