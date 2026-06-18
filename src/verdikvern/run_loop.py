"""The KUTT24 run loop.

One turn of the loop is:

    input -> memory -> run card -> output -> judgement -> next input

The loop is bounded (no runaway autonomy), persists only durable facts to
memory, pauses on BLOCK (never auto-promotes a block), and feeds REWORK back in
as the next input until it either PASSes or hits the attempt cap.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

from .agents import ByggerCell, DommerCell, HenterCell
from .contracts import CycleResult, Input, MemoryRecord, Verdict
from .gates import PromotionGate, GateConfig
from .input_binder import InputBinder
from .llm_router import LLMRouter
from .memory_binder import MemoryBinder
from .self_review import SelfReview


@dataclass
class EngineConfig:
    max_attempts: int = 3            # per-input rework cap before forced stop
    memory_path: str = ".verdikvern/memory.json"
    live: bool = False               # default: deterministic mock backend
    gate: GateConfig = field(default_factory=GateConfig)


@dataclass
class LoopReport:
    cycles: List[CycleResult] = field(default_factory=list)
    final_verdict: Optional[Verdict] = None

    @property
    def attempts(self) -> int:
        return len(self.cycles)

    @property
    def passed(self) -> bool:
        return self.final_verdict is Verdict.PASS


class ValueEngine:
    def __init__(self, config: Optional[EngineConfig] = None) -> None:
        self.config = config or EngineConfig()
        self.router = LLMRouter(live=self.config.live)
        self.memory = MemoryBinder(self.config.memory_path)
        self.binder = InputBinder()
        self.henter = HenterCell(self.router)
        self.bygger = ByggerCell(self.router, SelfReview())
        self.dommer = DommerCell(self.router, PromotionGate(self.config.gate))

    @property
    def backend_name(self) -> str:
        return self.router.backend_name

    def run_input(self, input: Input) -> LoopReport:
        """Run one input through to PASS, BLOCK, or attempt-cap."""

        report = LoopReport()
        current: Optional[Input] = input
        attempt = 1

        while current is not None and attempt <= self.config.max_attempts:
            context = self.memory.bind(current)
            card = self.henter.run(current, context, attempt=attempt)
            output = self.bygger.run(card, context)
            judgement = self.dommer.run(card, output)

            report.cycles.append(
                CycleResult(input=current, context=context, card=card, output=output, judgement=judgement)
            )
            report.final_verdict = judgement.verdict

            # Persist only durable facts: the verdict and a one-line trace.
            self.memory.remember(
                MemoryRecord(
                    kind="cycle",
                    text=f"{judgement.verdict.value} on '{card.objective[:80]}' (attempt {attempt})",
                    tags=[judgement.verdict.value.lower(), current.task_id or "adhoc"],
                    meta={"score": judgement.score},
                )
            )

            if judgement.verdict is Verdict.PASS:
                break
            if judgement.verdict is Verdict.BLOCK:
                # Hard stop. The loop must surface a block to a human.
                break

            # REWORK: derive the next input and loop again.
            current = self.binder.follow_up(current, judgement)
            attempt += 1

        return report

    def run_text(self, text: str) -> LoopReport:
        return self.run_input(self.binder.from_text(text))

    def run_task(self, task_id: str) -> LoopReport:
        return self.run_input(self.binder.from_task(task_id))
