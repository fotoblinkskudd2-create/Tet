"""A structured, practical support protocol for panic and acute-stress moments.

This is deliberately conservative: it offers grounding, breathing and reality-
check guidance, and it always surfaces clear emergency criteria.  It is not a
substitute for professional or emergency care.
"""
from __future__ import annotations

from typing import Optional

from .core import Capability, Solution

_PANIC_MARKERS = (
    "panic",
    "anxiety attack",
    "panik",
    "angst",
    "heart racing",
    "kan ikke puste",
    "can't breathe",
    "cant breathe",
    "hyperventilat",
)


def solve_panic_support(problem: str) -> Optional[Solution]:
    lowered = problem.lower()
    if not any(marker in lowered for marker in _PANIC_MARKERS):
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
    return Solution(kind="Panic Support", answer=answer, details=details, tags=("wellbeing",))


CAPABILITY = Capability(
    name="panic-support",
    summary="A calm, structured protocol for panic or acute-stress moments.",
    examples=("I think I am having a panic attack", "my heart is racing and I can't breathe"),
    solve=solve_panic_support,
    priority=10,  # safety first: this should win whenever it matches
)
