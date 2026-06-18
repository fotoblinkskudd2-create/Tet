"""Self-review pass for the BYGGER cell.

Before an output is handed to the DOMMER cell, the builder reviews its own work
against the run card. This is cheap, catches obvious gaps early, and lets the
builder attach explicit ``claims`` that the gate can check. Self-review never
promotes anything; it only annotates and, where trivial, repairs.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List

from .contracts import Output, RunCard


@dataclass
class ReviewResult:
    output: Output
    gaps: List[str]

    @property
    def clean(self) -> bool:
        return not self.gaps


class SelfReview:
    def run(self, card: RunCard, output: Output) -> ReviewResult:
        haystack = (output.body + "\n" + "\n".join(output.claims)).lower()
        gaps: List[str] = []

        for criterion in card.acceptance:
            words = [w for w in re.findall(r"[a-zæøå0-9]+", criterion.lower()) if len(w) > 3]
            if words and not any(w in haystack for w in words):
                gaps.append(criterion)

        # Promote each satisfied acceptance criterion into an explicit claim so
        # the downstream gate has something concrete to verify.
        evidenced = [c for c in card.acceptance if c not in gaps]
        claims = list(dict.fromkeys(output.claims + [f"Addresses: {c}" for c in evidenced]))
        annotated = Output(
            card_id=output.card_id,
            body=output.body,
            claims=claims,
            id=output.id,
            created_at=output.created_at,
            meta={**output.meta, "self_review_gaps": gaps},
        )
        return ReviewResult(output=annotated, gaps=gaps)
