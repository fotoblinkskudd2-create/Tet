"""Idea scoring and ranking system."""
from dataclasses import dataclass
from typing import List, Set
import math


@dataclass
class IdeaScore:
    originality: float      # 0-1: how unexpected/novel
    viability: float        # 0-1: how implementable
    surprise: float         # 0-1: how counter-intuitive
    relevance: float        # 0-1: how on-theme
    combined: float         # weighted final score

    def __repr__(self):
        return (f"Score(orig={self.originality:.2f}, via={self.viability:.2f}, "
                f"surp={self.surprise:.2f}, rel={self.relevance:.2f} → {self.combined:.2f})")


class IdeaRanker:
    WEIGHTS = {"originality": 0.35, "viability": 0.25, "surprise": 0.25, "relevance": 0.15}

    def __init__(self):
        self._seen_combinations: Set[str] = set()

    def score(self, idea_title: str, idea_tags: List[str],
              theme_tags: List[str], domain_distance: float,
              strategy: str) -> IdeaScore:

        key = frozenset(idea_tags[:4])
        repetition_penalty = 0.3 if str(key) in self._seen_combinations else 0.0
        self._seen_combinations.add(str(key))

        # Originality: penalise repetition, reward cross-domain distance
        originality = min(1.0, domain_distance * 0.6 + 0.4) - repetition_penalty

        # Viability: inversion strategies produce wilder ideas, slightly less viable
        viability_map = {
            "random_association": 0.75,
            "analogical_transfer": 0.80,
            "bisociation": 0.60,
            "scamper": 0.70,
            "constraint_inversion": 0.65,
            "worst_idea_inversion": 0.55,
            "trend_injection": 0.72,
        }
        viability = viability_map.get(strategy, 0.65)

        # Surprise: more tags shared = less surprising
        shared = len(set(idea_tags) & set(theme_tags))
        surprise = max(0.0, 1.0 - shared * 0.2)

        # Relevance: at least some overlap with theme tags
        relevance = min(1.0, shared * 0.3 + 0.2)

        combined = (
            self.WEIGHTS["originality"] * max(0.0, originality)
            + self.WEIGHTS["viability"] * viability
            + self.WEIGHTS["surprise"] * surprise
            + self.WEIGHTS["relevance"] * relevance
        )

        return IdeaScore(
            originality=round(max(0.0, originality), 3),
            viability=round(viability, 3),
            surprise=round(surprise, 3),
            relevance=round(relevance, 3),
            combined=round(combined, 3),
        )

    def rank(self, ideas: list) -> list:
        return sorted(ideas, key=lambda i: i.score.combined, reverse=True)

    def deduplicate(self, ideas: list, threshold: float = 0.85) -> list:
        """Remove ideas that are too similar based on tag overlap."""
        kept = []
        for idea in ideas:
            tags_a = set(idea.tags)
            is_dup = False
            for other in kept:
                tags_b = set(other.tags)
                if tags_a and tags_b:
                    jaccard = len(tags_a & tags_b) / len(tags_a | tags_b)
                    if jaccard > threshold:
                        is_dup = True
                        break
            if not is_dup:
                kept.append(idea)
        return kept
