from __future__ import annotations

from agents.base_agent import BaseAgent
from core.queue import Task

_FRAMEWORK = [
    "Define the core goal in one clear, specific sentence.",
    "List all known facts, constraints, and unknowns.",
    "Break the problem into 2–3 concrete sub-problems.",
    "Identify the smallest, highest-leverage sub-problem and start there.",
    "Set a 30-minute next action with a measurable output.",
    "Schedule a checkpoint to evaluate progress before scaling up.",
]


class BrainstormAgent(BaseAgent):
    @property
    def task_type(self) -> str:
        return "brainstorm"

    def process_task(self, task: Task) -> dict:
        problem = task.payload.get("problem", "").strip()
        if not problem:
            raise ValueError("Empty problem statement")
        return {
            "problem": problem,
            "framework": _FRAMEWORK,
            "summary": f"Structured approach ready for: '{problem}'",
        }
