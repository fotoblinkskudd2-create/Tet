"""Structured, practical support for acute panic moments.

This solver is registered with high confidence on purpose: when someone is in
distress, a calm protocol should win over any incidental numeric match in the
same sentence. The content is deliberately concrete and includes clear
escalation guidance -- it is supportive information, not a medical service.
"""

from __future__ import annotations

from typing import Optional

from ..core import Solution, Solver

_MARKERS = (
    "panic",
    "anxiety attack",
    "panik",
    "angst",
    "heart racing",
    "kan ikke puste",
)


class PanicSupportSolver(Solver):
    name = "panic_support"
    kind = "Panic Support"
    description = "A grounded, step-by-step protocol for panic or anxiety surges."

    def solve(self, problem: str) -> Optional[Solution]:
        lowered = problem.lower()
        if not any(marker in lowered for marker in _MARKERS):
            return None

        answer = (
            "Panic protocol activated: you are safe, this is a stress surge, and we handle it "
            "methodically. Start with grounding right now, then slow breathing, then reality "
            "checks."
        )
        details = [
            "Grounding now: use 5-4-3-2-1, cold water on face/wrists for 30s, or describe one object in forensic detail.",
            "Breathing: inhale 4, hold 4, exhale 6, hold 2. Repeat 6-8 rounds. Longer exhales help your body downshift.",
            "Reality checks: 'This feels awful but not dangerous.' 'It always peaks and passes.' 'Adrenaline cannot harm me.'",
            "Body reset: progressive muscle relaxation from feet to face, tense 5 seconds and release 10 seconds.",
            "Engage attention: familiar music, simple rule-based game, or predictable low-stress content (no news/suspense).",
            "If prescribed for panic, take medication exactly as directed—tools are not failure.",
            "Emergency line: seek urgent help for new crushing chest pain, fainting, one-sided weakness, confusion, persistent severe symptoms, or self-harm thoughts.",
            "Aftercare: eat, hydrate, avoid caffeine/alcohol for 24h, protect sleep, do gentle movement, and reduce stress load.",
        ]
        return self.make(answer, details, confidence=0.97)
