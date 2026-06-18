"""KUTT24 — Memory-Bound Value Engine.

A memory-first, output-binding loop:

    input -> memory -> run card -> output -> judgement -> next input

Three cells (HENTER -> BYGGER -> DOMMER), a strict PromotionGate
(PASS / REWORK / BLOCK), a 100-task bank, and a deterministic mock mode.
No X/Twitter dependency. No blind auto-deploy. Civil / clean-room only.
"""

from .contracts import (
    CycleResult,
    Input,
    Judgement,
    MemoryContext,
    MemoryRecord,
    Output,
    RunCard,
    Verdict,
)
from .gates import GateConfig, PromotionGate
from .run_loop import EngineConfig, LoopReport, ValueEngine
from .task_bank import Task, TaskBank

__version__ = "1.0.0"

__all__ = [
    "CycleResult",
    "Input",
    "Judgement",
    "MemoryContext",
    "MemoryRecord",
    "Output",
    "RunCard",
    "Verdict",
    "GateConfig",
    "PromotionGate",
    "EngineConfig",
    "LoopReport",
    "ValueEngine",
    "Task",
    "TaskBank",
]
