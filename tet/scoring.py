"""Transparent scoring helpers for ideas, inventions and stock conviction.

These are deliberately simple, explainable weighted models. The point is not
prediction but consistent comparison: score ten eco ideas the same way and the
ranking tells you where to spend attention.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple


def _clamp(value: float, lo: float = 0.0, hi: float = 10.0) -> float:
    return max(lo, min(hi, float(value)))


@dataclass
class ScoreResult:
    total: float          # 0-100
    label: str            # qualitative bucket
    breakdown: Dict[str, float]
    notes: List[str]

    def format(self) -> str:
        lines = [f"Score: {self.total:.0f}/100  ({self.label})"]
        for factor, value in self.breakdown.items():
            lines.append(f"  - {factor}: {value:.1f}/10")
        lines.extend(f"  • {n}" for n in self.notes)
        return "\n".join(lines)


def _bucket(total: float) -> str:
    if total >= 80:
        return "pursue now"
    if total >= 65:
        return "strong — develop"
    if total >= 50:
        return "promising — refine"
    if total >= 35:
        return "weak — park it"
    return "drop or rethink"


# Each model is (factor_name -> weight). Weights sum to 1.0.
ECO_MODEL: Dict[str, float] = {
    "impact": 0.30,        # ecological / economic upside
    "feasibility": 0.25,   # can it actually be built/run
    "market": 0.20,        # demand / willingness to pay
    "defensibility": 0.15, # moat, hard to copy
    "timing": 0.10,        # is the world ready now
}

INVENTION_MODEL: Dict[str, float] = {
    "novelty": 0.30,       # is it genuinely new
    "usefulness": 0.25,    # does it solve a real problem
    "feasibility": 0.20,   # buildable with known means
    "patentability": 0.15, # claimable, non-obvious
    "market": 0.10,        # commercial pull
}

STOCK_MODEL: Dict[str, float] = {
    "conviction": 0.30,    # how sure is the thesis
    "moat": 0.25,          # durable advantage
    "valuation": 0.20,     # margin of safety (10 = cheap)
    "growth": 0.15,        # runway
    "risk": 0.10,          # 10 = low risk
}

MODELS: Dict[str, Dict[str, float]] = {
    "eco": ECO_MODEL,
    "invention": INVENTION_MODEL,
    "patent": INVENTION_MODEL,
    "stock": STOCK_MODEL,
}


def score(model: str, factors: Dict[str, float]) -> ScoreResult:
    """Score a set of 0-10 factors against a named model.

    Missing factors default to a neutral 5. Unknown factors are ignored but
    flagged so typos are visible.
    """

    weights = MODELS.get(model)
    if weights is None:
        raise ValueError(
            f"Unknown scoring model '{model}'. Choose from {', '.join(MODELS)}."
        )

    notes: List[str] = []
    breakdown: Dict[str, float] = {}
    total = 0.0
    for factor, weight in weights.items():
        raw = factors.get(factor)
        if raw is None:
            value = 5.0
            notes.append(f"'{factor}' not provided — assumed neutral (5).")
        else:
            value = _clamp(raw)
        breakdown[factor] = value
        total += value * weight

    for given in factors:
        if given not in weights:
            notes.append(f"Ignored unknown factor '{given}'.")

    total_100 = round(total * 10, 1)
    return ScoreResult(
        total=total_100,
        label=_bucket(total_100),
        breakdown=breakdown,
        notes=notes,
    )


def rank(model: str, candidates: List[Tuple[str, Dict[str, float]]]) -> List[Tuple[str, ScoreResult]]:
    """Score and rank several candidates with the same model."""

    scored = [(name, score(model, factors)) for name, factors in candidates]
    scored.sort(key=lambda pair: pair[1].total, reverse=True)
    return scored
