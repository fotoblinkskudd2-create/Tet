"""Lateral thinking algorithms for idea generation."""
import random
from typing import List, Tuple
from .concepts import Concept, ConceptDatabase


class LateralEngine:
    """Combines concepts using different lateral thinking strategies."""

    SCAMPER = ["Substitute", "Combine", "Adapt", "Modify/Magnify", "Put to other uses", "Eliminate", "Reverse"]

    def __init__(self, db: ConceptDatabase, seed: int = None):
        self.db = db
        self.rng = random.Random(seed)

    # --- Strategy 1: Random cross-domain association ---
    def random_association(self, theme_concepts: List[Concept]) -> Tuple[Concept, Concept, str]:
        """Pick one concept from theme, one from a different domain, find bridge."""
        anchor = self.rng.choice(theme_concepts)
        all_other = [c for c in self.db.all() if c.domain != anchor.domain]
        partner = self.rng.choice(all_other)
        shared_tags = set(anchor.tags) & set(partner.tags)
        bridge = list(shared_tags)[0] if shared_tags else self.rng.choice(anchor.tags)
        return anchor, partner, bridge

    # --- Strategy 2: Constraint inversion ---
    def constraint_inversion(self, concept: Concept) -> Tuple[str, str]:
        """Take a property and invert it to find new design space."""
        prop = self.rng.choice(concept.properties)
        antonym = self.rng.choice(concept.antonyms) if concept.antonyms else f"non-{concept.name}"
        return prop, antonym

    # --- Strategy 3: Analogical transfer ---
    def analogical_transfer(self, concept: Concept, target_domain: str) -> Tuple[Concept, str]:
        """Map how concept's mechanism works in a new domain."""
        target_concepts = self.db.by_domain(target_domain)
        if not target_concepts:
            target_concepts = self.db.random_concepts(3, self.rng)
        analogy_target = self.rng.choice(target_concepts)
        mechanism = self.rng.choice(concept.properties)
        return analogy_target, mechanism

    # --- Strategy 4: SCAMPER ---
    def scamper(self, concept: Concept) -> Tuple[str, str]:
        """Apply a SCAMPER verb to generate a mutation direction."""
        verb = self.rng.choice(self.SCAMPER)
        prop = self.rng.choice(concept.properties)
        return verb, prop

    # --- Strategy 5: Bisociation (Koestler) ---
    def bisociation(self, theme_concepts: List[Concept]) -> Tuple[Concept, Concept]:
        """Two unrelated concepts forced into collision."""
        a = self.rng.choice(theme_concepts)
        others = [c for c in self.db.all() if c not in theme_concepts and c.domain != a.domain]
        b = self.rng.choice(others)
        return a, b

    # --- Strategy 6: Worst possible idea (then flip) ---
    def worst_idea_inversion(self, concept: Concept) -> str:
        """Generate worst idea, then flip it."""
        worst_verbs = ["eliminate all", "hide every", "make slower", "charge extra for", "remove"]
        best_props = concept.properties
        worst = f"{self.rng.choice(worst_verbs)} {self.rng.choice(best_props)}"
        inversions = {
            "eliminate all": "celebrate every",
            "hide every": "surface every",
            "make slower": "make instant",
            "charge extra for": "give away",
            "remove": "multiply",
        }
        verb = worst.split()[0] + " " + worst.split()[1]
        flipped_verb = next((v for k, v in inversions.items() if worst.startswith(k)), "radically enhance")
        return f"{flipped_verb} {self.rng.choice(best_props)}"

    # --- Strategy 7: Trend injection ---
    def trend_injection(self, concept: Concept, trends: List[str]) -> Tuple[str, str]:
        """Combine concept with a current trend."""
        trend = self.rng.choice(trends) if trends else "AI"
        prop = self.rng.choice(concept.properties)
        return trend, prop
