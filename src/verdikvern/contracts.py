"""Data contracts for the KUTT24 Value Engine.

Everything that flows through the engine is a typed, serializable contract.
The pipeline is strictly:

    Input -> MemoryContext -> RunCard -> Output -> Judgement -> (next Input)

Contracts are intentionally plain dataclasses so they survive JSON round-trips
into and out of the memory store. No behaviour lives here; this module is the
shared vocabulary every other module speaks.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Any, Dict, List, Optional


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _now() -> float:
    return time.time()


class Verdict(str, Enum):
    """Possible outcomes of the PromotionGate."""

    PASS = "PASS"
    REWORK = "REWORK"
    BLOCK = "BLOCK"


@dataclass
class Input:
    """A unit of work entering the engine."""

    text: str
    task_id: Optional[str] = None
    source: str = "operator"
    id: str = field(default_factory=lambda: _new_id("in"))
    created_at: float = field(default_factory=_now)
    meta: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Input":
        return cls(**data)


@dataclass
class MemoryRecord:
    """A single durable observation the engine has chosen to remember."""

    kind: str
    text: str
    tags: List[str] = field(default_factory=list)
    id: str = field(default_factory=lambda: _new_id("mem"))
    created_at: float = field(default_factory=_now)
    weight: float = 1.0
    meta: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MemoryRecord":
        return cls(**data)


@dataclass
class MemoryContext:
    """The slice of memory bound to one input before building begins."""

    records: List[MemoryRecord] = field(default_factory=list)
    summary: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "records": [r.to_dict() for r in self.records],
            "summary": self.summary,
        }


@dataclass
class RunCard:
    """The plan of record for a single build attempt.

    A RunCard is what the BYGGER cell commits to before producing output. The
    DOMMER cell judges the Output *against* this card, so the card carries the
    acceptance criteria explicitly. This is the "output-binding" contract:
    output is only valid if it satisfies the card it was built under.
    """

    input_id: str
    objective: str
    acceptance: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)
    attempt: int = 1
    id: str = field(default_factory=lambda: _new_id("card"))
    created_at: float = field(default_factory=_now)
    meta: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RunCard":
        return cls(**data)


@dataclass
class Output:
    """The artifact produced by the BYGGER cell under a RunCard."""

    card_id: str
    body: str
    claims: List[str] = field(default_factory=list)
    id: str = field(default_factory=lambda: _new_id("out"))
    created_at: float = field(default_factory=_now)
    meta: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Output":
        return cls(**data)


@dataclass
class Judgement:
    """The DOMMER cell's ruling on an Output, gated by the PromotionGate."""

    output_id: str
    verdict: Verdict
    reasons: List[str] = field(default_factory=list)
    rework_notes: List[str] = field(default_factory=list)
    score: float = 0.0
    id: str = field(default_factory=lambda: _new_id("judge"))
    created_at: float = field(default_factory=_now)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["verdict"] = self.verdict.value
        return d

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Judgement":
        data = dict(data)
        data["verdict"] = Verdict(data["verdict"])
        return cls(**data)


@dataclass
class CycleResult:
    """Everything produced by one full turn of the run loop."""

    input: Input
    context: MemoryContext
    card: RunCard
    output: Output
    judgement: Judgement

    def to_dict(self) -> Dict[str, Any]:
        return {
            "input": self.input.to_dict(),
            "context": self.context.to_dict(),
            "card": self.card.to_dict(),
            "output": self.output.to_dict(),
            "judgement": self.judgement.to_dict(),
        }
