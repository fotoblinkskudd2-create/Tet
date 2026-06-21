"""Core types and the capability registry for the Tet problem solver.

The solver is built around a small, explicit registry of *capabilities*.  Each
capability knows how to recognise the problems it can handle, how to solve them,
and how to describe itself (for ``--list`` and the REPL ``help`` command).  This
keeps the engine open for extension: adding a new skill is a matter of writing a
function and registering it, never editing a giant ``if`` ladder.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, List, Optional, Sequence, Tuple


@dataclass
class Solution:
    """A lightweight wrapper for solutions returned by the solver.

    ``kind``, ``answer`` and ``details`` form the stable public contract.  The
    optional ``confidence`` and ``tags`` fields add metadata for richer output
    modes (JSON, ranking) without changing the human-readable format.
    """

    kind: str
    answer: str
    details: Optional[List[str]] = None
    confidence: float = 1.0
    tags: Tuple[str, ...] = ()

    def format(self) -> str:
        """Return a user-friendly representation of the solution."""

        banner = f"✨ {self.kind} solution ready! ✨"
        parts = [banner, self.answer]
        if self.details:
            parts.append("\n".join(f"- {line}" for line in self.details))
        return "\n".join(parts)

    def to_dict(self) -> dict:
        """Return a JSON-serialisable view of the solution."""

        return {
            "kind": self.kind,
            "answer": self.answer,
            "details": list(self.details) if self.details else [],
            "confidence": self.confidence,
            "tags": list(self.tags),
        }


# A solver function inspects a problem string and either returns a Solution or
# ``None`` to signal "not my department, try the next capability".
SolverFunc = Callable[[str], Optional[Solution]]


@dataclass(frozen=True)
class Capability:
    """A single registered skill of the solver."""

    name: str
    summary: str
    examples: Tuple[str, ...]
    solve: SolverFunc
    priority: int = 100  # lower runs earlier; specific skills should sort first


@dataclass
class Registry:
    """An ordered collection of capabilities."""

    capabilities: List[Capability] = field(default_factory=list)

    def register(self, capability: Capability) -> Capability:
        self.capabilities.append(capability)
        self.capabilities.sort(key=lambda c: (c.priority, c.name))
        return capability

    def ordered(self) -> Sequence[Capability]:
        return tuple(self.capabilities)

    def names(self) -> Tuple[str, ...]:
        return tuple(c.name for c in self.capabilities)
