"""Scoring engine: turns a parsed idea into a fully explained score card."""
from __future__ import annotations

from typing import Any, Dict, List

# Weights sum to 100. Difficulty and risk are inverted (lower is better)
# before being weighted, since a harder/riskier idea should pull the score down.
WEIGHTS = {
    "market_value": 30,
    "buildability": 25,
    "documentation_value": 15,
    "technical_difficulty": 15,  # inverted
    "risk": 15,  # inverted
}

PASS_THRESHOLD = 70
REWORK_THRESHOLD = 40


def _component(field: str, value: int, weight: int, inverted: bool) -> float:
    normalized = (11 - value) if inverted else value
    return (normalized / 10) * weight


def score_idea(idea: Dict[str, Any]) -> Dict[str, Any]:
    """Computes the total score, recommendation, explanation and next action."""
    components = {
        "market_value": _component("market_value", idea["market_value"], WEIGHTS["market_value"], inverted=False),
        "buildability": _component("buildability", idea["buildability"], WEIGHTS["buildability"], inverted=False),
        "documentation_value": _component(
            "documentation_value", idea["documentation_value"], WEIGHTS["documentation_value"], inverted=False
        ),
        "technical_difficulty": _component(
            "technical_difficulty", idea["technical_difficulty"], WEIGHTS["technical_difficulty"], inverted=True
        ),
        "risk": _component("risk", idea["risk"], WEIGHTS["risk"], inverted=True),
    }
    total_score = round(sum(components.values()))
    total_score = max(0, min(100, total_score))

    if total_score >= PASS_THRESHOLD:
        recommendation = "PASS"
    elif total_score >= REWORK_THRESHOLD:
        recommendation = "REWORK"
    else:
        recommendation = "BLOCK"

    explanation = (
        f"Markedsverdi {idea['market_value']}/10 ga {components['market_value']:.1f}p "
        f"(vekt {WEIGHTS['market_value']}). "
        f"Byggbarhet {idea['buildability']}/10 ga {components['buildability']:.1f}p "
        f"(vekt {WEIGHTS['buildability']}). "
        f"Dokumentasjonsverdi {idea['documentation_value']}/10 ga {components['documentation_value']:.1f}p "
        f"(vekt {WEIGHTS['documentation_value']}). "
        f"Teknisk vanskelighet {idea['technical_difficulty']}/10 (invertert) ga "
        f"{components['technical_difficulty']:.1f}p (vekt {WEIGHTS['technical_difficulty']}). "
        f"Risiko {idea['risk']}/10 (invertert) ga {components['risk']:.1f}p (vekt {WEIGHTS['risk']}). "
        f"Totalt: {total_score}/100 -> {recommendation}."
    )

    next_action = (
        f"Innen 24 timer: lag '{idea['first_deliverable']}' og send/presenter den for "
        f"{idea['who_pays']}."
    )

    scored = dict(idea)
    scored.update(
        {
            "score_components": {k: round(v, 1) for k, v in components.items()},
            "total_score": total_score,
            "recommendation": recommendation,
            "explanation": explanation,
            "next_action": next_action,
        }
    )
    return scored


def score_ideas(ideas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    scored = [score_idea(idea) for idea in ideas]
    scored.sort(key=lambda item: item["total_score"], reverse=True)
    return scored
