"""Intelligent "did you mean ...?" routing.

When no specialised solver recognises a problem, Tet does not just shrug and
fall back to brainstorming -- it tries to *infer the intent*. It compares the
words in the query against each capability's vocabulary (with typo tolerance
via :mod:`difflib`) and, when something looks close, offers a concrete,
copy-pasteable example of the command that would have worked.

This turns near-misses ("covert 10 km to mile", "speed of ligth") into
helpful guidance instead of dead ends.
"""

from __future__ import annotations

import difflib
import re
from dataclasses import dataclass
from typing import List, Tuple

_TOKEN_RE = re.compile(r"[a-zA-Z%][a-zA-Z'’\-]*")


@dataclass(frozen=True)
class Signal:
    solver: str
    label: str
    keywords: Tuple[str, ...]
    example: str


# Vocabulary that hints at each capability, plus a ready-to-run example.
_SIGNALS: Tuple[Signal, ...] = (
    Signal("units", "a unit conversion",
           ("convert", "kilometers", "kilometres", "miles", "kilograms", "pounds",
            "celsius", "fahrenheit", "meters", "metres", "feet", "inches",
            "ounces", "gallons", "liters", "litres"),
           "convert 10 km to miles"),
    Signal("temporal", "a date calculation",
           ("days", "date", "weekday", "until", "between", "calendar", "today"),
           "days until 2026-12-25"),
    Signal("bases", "a number-base conversion",
           ("hex", "hexadecimal", "binary", "octal", "decimal", "base"),
           "convert 255 to hex"),
    Signal("roman", "a Roman numeral",
           ("roman", "numeral", "numerals"),
           "roman numeral for 2026"),
    Signal("percentage", "a percentage",
           ("percent", "percentage", "%"),
           "15% of 200"),
    Signal("statistics", "a statistics summary",
           ("mean", "median", "average", "mode", "stdev", "variance", "range"),
           "mean of 2 4 6 8"),
    Signal("anagram", "an anagram",
           ("anagram", "unscramble", "scramble", "rearrange"),
           "anagram of listen"),
    Signal("knowledge", "a constant lookup",
           ("constant", "speed", "light", "planck", "avogadro", "boltzmann",
            "gravitational", "prefix", "electron", "proton"),
           "what is the speed of light"),
    Signal("arithmetic", "an arithmetic expression",
           ("plus", "minus", "times", "divided", "multiply", "multiplied",
            "add", "subtract", "sqrt", "squared", "factorial", "power"),
           "12 * (3 + 4)"),
)


def _tokens(text: str) -> List[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text)]


def _signal_score(tokens: List[str], signal: Signal) -> float:
    """Score how strongly ``tokens`` evoke ``signal`` (0..1-ish)."""

    score = 0.0
    keyword_words = list(signal.keywords)
    for token in tokens:
        if token in signal.keywords:
            score = max(score, 1.0)
            continue
        if len(token) >= 4:
            close = difflib.get_close_matches(token, keyword_words, n=1, cutoff=0.82)
            if close:
                # Near-miss (typo) — strong but slightly below an exact hit.
                score = max(score, 0.8)
    return score


def rank_intents(problem: str, threshold: float = 0.75) -> List[Tuple[Signal, float]]:
    """Return plausible intents for ``problem``, best first."""

    tokens = _tokens(problem)
    if not tokens:
        return []
    ranked = [(s, _signal_score(tokens, s)) for s in _SIGNALS]
    ranked = [pair for pair in ranked if pair[1] >= threshold]
    ranked.sort(key=lambda pair: pair[1], reverse=True)
    return ranked


def suggestions(problem: str, limit: int = 2) -> List[str]:
    """Human-readable "did you mean ...?" lines for a stuck query."""

    lines = []
    for signal, _score in rank_intents(problem)[:limit]:
        lines.append(f"Did you mean {signal.label}? Try: {signal.example}")
    return lines
