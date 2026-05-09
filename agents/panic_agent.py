from __future__ import annotations

from agents.base_agent import BaseAgent
from core.queue import Task

_PROTOCOL = [
    "GROUNDING (now): 5-4-3-2-1 senses, or cold water on face/wrists for 30s.",
    "BREATHING: inhale 4s → hold 4s → exhale 6s → hold 2s. Repeat 6–8 rounds.",
    "REALITY CHECK: 'This feels awful but is not dangerous. It always peaks and passes.'",
    "BODY RESET: progressive muscle relaxation, feet to face — tense 5s, release 10s.",
    "ATTENTION ANCHOR: familiar music, a simple rule-based game, or neutral low-stakes content.",
    "MEDICATION: if prescribed for panic, take exactly as directed — tools are not failure.",
    "EMERGENCY: seek urgent help for crushing chest pain, fainting, one-sided weakness, confusion, or self-harm thoughts.",
    "AFTERCARE: eat, hydrate, avoid caffeine/alcohol 24h, protect sleep, gentle movement.",
]


class PanicAgent(BaseAgent):
    @property
    def task_type(self) -> str:
        return "panic"

    def process_task(self, task: Task) -> dict:
        context = task.payload.get("context", "General panic support requested.")
        return {
            "context": context,
            "protocol": _PROTOCOL,
            "message": "Panic protocol activated. You are safe. This is a stress surge and it will pass.",
        }
