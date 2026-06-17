"""Main idea generation engine."""
from dataclasses import dataclass, field
from typing import List, Optional
import random

from .concepts import ConceptDatabase, Concept
from .lateral import LateralEngine
from .ranker import IdeaRanker, IdeaScore


@dataclass
class Idea:
    title: str
    description: str
    logic: str
    use_case: str
    tags: List[str]
    strategy: str
    score: IdeaScore = field(default=None)

    def display(self) -> str:
        lines = [
            f"  ★ {self.title}",
            f"    {self.description}",
            f"    WHY: {self.logic}",
            f"    USE CASE: {self.use_case}",
            f"    Tags: {', '.join(self.tags)}",
        ]
        if self.score:
            lines.append(f"    Score: {self.score}")
        return "\n".join(lines)


DOMAIN_ORDER = ["nature", "technology", "design", "business", "art", "psychology", "science", "philosophy"]


def _domain_distance(d1: str, d2: str) -> float:
    """Simple distance between domains based on their index separation."""
    try:
        i1, i2 = DOMAIN_ORDER.index(d1), DOMAIN_ORDER.index(d2)
        return abs(i1 - i2) / (len(DOMAIN_ORDER) - 1)
    except ValueError:
        return 0.5


class IdeaGenerator:
    DEFAULT_TRENDS = [
        "spatial computing", "post-AGI workflows", "climate anxiety",
        "micro-communities", "ambient AI", "de-growth economics",
        "neuroaesthetics", "longevity tech", "post-scarcity design",
        "embodied computing",
    ]

    def __init__(self, seed: int = None):
        self.db = ConceptDatabase()
        self.ranker = IdeaRanker()
        seed = seed if seed is not None else random.randint(0, 999999)
        self.lateral = LateralEngine(self.db, seed=seed)
        self._rng = random.Random(seed)

    def generate(
        self,
        theme: str,
        domain: Optional[str] = None,
        constraints: Optional[List[str]] = None,
        trends: Optional[List[str]] = None,
        n: int = 8,
    ) -> List[Idea]:
        """Generate n creative ideas for the given theme."""
        constraints = constraints or []
        trends = trends or self.DEFAULT_TRENDS

        theme_concepts = self._find_theme_concepts(theme, domain)
        if not theme_concepts:
            theme_concepts = self.db.random_concepts(4, self._rng)

        theme_tags = list({tag for c in theme_concepts for tag in c.tags})

        ideas: List[Idea] = []
        strategies = [
            self._gen_random_association,
            self._gen_analogical_transfer,
            self._gen_bisociation,
            self._gen_scamper,
            self._gen_constraint_inversion,
            self._gen_worst_inversion,
            self._gen_trend_injection,
        ]

        attempts = 0
        while len(ideas) < n and attempts < n * 4:
            attempts += 1
            strategy_fn = self._rng.choice(strategies)
            try:
                idea = strategy_fn(theme_concepts, theme, theme_tags, constraints, trends)
                if idea:
                    dist = _domain_distance(
                        self._rng.choice(theme_concepts).domain if theme_concepts else "technology",
                        "technology"
                    )
                    idea.score = self.ranker.score(
                        idea.title, idea.tags, theme_tags, dist, idea.strategy
                    )
                    ideas.append(idea)
            except (IndexError, ValueError):
                continue

        ideas = self.ranker.deduplicate(ideas)
        ideas = self.ranker.rank(ideas)
        return ideas[:n]

    # ------------------------------------------------------------------ #
    #  Private generation strategies
    # ------------------------------------------------------------------ #

    def _find_theme_concepts(self, theme: str, domain: Optional[str]) -> List[Concept]:
        theme_lower = theme.lower()
        matches = []
        for c in self.db.all():
            if (theme_lower in c.name or c.name in theme_lower
                    or any(theme_lower in t for t in c.tags)
                    or (domain and c.domain == domain)):
                matches.append(c)
        if not matches and domain:
            matches = self.db.by_domain(domain)
        return matches or self.db.random_concepts(4, self._rng)

    def _gen_random_association(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        anchor, partner, bridge = self.lateral.random_association(theme_concepts)
        title = f"{partner.name.title()} {anchor.name.title()}: {bridge.replace('-', ' ').title()} as Interface"
        desc = (
            f"Apply {partner.name}'s principle of '{self._rng.choice(partner.properties)}' "
            f"to redesign how {theme} handles '{self._rng.choice(anchor.properties)}'. "
            f"The bridge concept is {bridge} — a shared axis that makes the transfer coherent."
        )
        logic = f"{anchor.name} and {partner.name} share the '{bridge}' axis, enabling mechanical analogy."
        use_case = f"A {theme} product that behaves like {partner.name}: {self._rng.choice(partner.analogies or [partner.name])}."
        tags = list(set(anchor.tags[:2] + partner.tags[:2] + [bridge, partner.domain]))
        return Idea(title, desc, logic, use_case, tags, "random_association")

    def _gen_analogical_transfer(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        anchor = self._rng.choice(theme_concepts)
        target_domain = self._rng.choice([d for d in self.db.domains if d != anchor.domain])
        analogy_target, mechanism = self.lateral.analogical_transfer(anchor, target_domain)
        title = f"The {anchor.name.title()} of {theme.title()}: {mechanism.split()[0].title()} Transferred"
        desc = (
            f"{anchor.name.title()} in {anchor.domain} works by: '{mechanism}'. "
            f"Transfer this exact mechanic into {theme}: build a system that {mechanism} "
            f"the same way {anchor.name} does — but for {analogy_target.name}."
        )
        logic = f"Analogical transfer: the mechanism '{mechanism}' is domain-agnostic."
        use_case = f"{theme.title()} product inspired by {anchor.name}: {self._rng.choice(anchor.analogies or [anchor.name])}."
        tags = list(set(anchor.tags[:2] + analogy_target.tags[:2] + [target_domain, "analogy"]))
        return Idea(title, desc, logic, use_case, tags, "analogical_transfer")

    def _gen_bisociation(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        a, b = self.lateral.bisociation(theme_concepts)
        surprise_prop = self._rng.choice(b.properties)
        title = f"When {a.name.title()} Meets {b.name.title()}: Collision Product"
        desc = (
            f"Force {a.name} ({a.domain}) and {b.name} ({b.domain}) into the same solution space. "
            f"{b.name} contributes '{surprise_prop}' — a property {a.name} has never had. "
            f"The result is a {theme} tool that {surprise_prop}."
        )
        logic = f"Koestler bisociation: two unrelated matrices of thought collide to spark insight."
        use_case = f"A {theme} product where {a.name}'s structure is animated by {b.name}'s energy."
        tags = list(set(a.tags[:2] + b.tags[:2] + [a.domain, b.domain, "bisociation"]))
        return Idea(title, desc, logic, use_case, tags, "bisociation")

    def _gen_scamper(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        concept = self._rng.choice(theme_concepts)
        verb, prop = self.lateral.scamper(concept)
        title = f"{verb}: {prop.title()} in {theme.title()}"
        desc = (
            f"Apply SCAMPER's '{verb}' operation to '{prop}' within {theme}. "
            f"What if you could {verb.lower()} the '{prop}' entirely? "
            f"This removes an assumption that has gone unquestioned in {theme} for years."
        )
        logic = f"SCAMPER: systematic creative provocation applied to '{prop}' of {concept.name}."
        use_case = f"{theme.title()} redesigned by questioning: what if we {verb.lower()} '{prop}'?"
        tags = list(set(concept.tags[:3] + [verb.lower().split("/")[0], "scamper", theme.lower()]))
        return Idea(title, desc, logic, use_case, tags, "scamper")

    def _gen_constraint_inversion(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        concept = self._rng.choice(theme_concepts)
        prop, inverted = self.lateral.constraint_inversion(concept)
        constraint_str = f" under constraint: {self._rng.choice(constraints)}" if constraints else ""
        title = f"The {inverted.title()} {theme.title()}: Inversion as Feature"
        desc = (
            f"What if {theme} embraced being '{inverted}' instead of '{prop}'? "
            f"Turn the biggest limitation into the core value proposition{constraint_str}. "
            f"Design the whole experience around the constraint, not despite it."
        )
        logic = f"Constraint inversion: '{prop}' → '{inverted}'. Weakness becomes differentiation."
        use_case = f"A {theme} brand whose USP is being deliberately '{inverted}'."
        tags = list(set(concept.tags[:2] + [inverted, "inversion", "constraint", theme.lower()]))
        return Idea(title, desc, logic, use_case, tags, "constraint_inversion")

    def _gen_worst_inversion(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        concept = self._rng.choice(theme_concepts)
        flipped = self.lateral.worst_idea_inversion(concept)
        title = f"Anti-{concept.name.title()}: {flipped.title()} for {theme.title()}"
        desc = (
            f"Start by designing the worst possible {theme} experience, then invert every decision. "
            f"The result: a {theme} product that does '{flipped}' — "
            f"the exact opposite of what every competitor is doing."
        )
        logic = "Worst-possible-idea then flip: breaks anchoring bias and reveals unexplored territory."
        use_case = f"Anti-pattern product in {theme}: built by negating all conventional wisdom."
        tags = list(set(concept.tags[:2] + ["inversion", "anti-pattern", "contrarian", theme.lower()]))
        return Idea(title, desc, logic, use_case, tags, "worst_idea_inversion")

    def _gen_trend_injection(self, theme_concepts, theme, theme_tags, constraints, trends) -> Idea:
        concept = self._rng.choice(theme_concepts)
        trend, prop = self.lateral.trend_injection(concept, trends)
        title = f"{trend.title()} × {concept.name.title()}: {theme.title()} for What's Next"
        desc = (
            f"Combine the emerging trend of '{trend}' with {concept.name}'s core mechanic: '{prop}'. "
            f"Build a {theme} product for the world where {trend} is mainstream, "
            f"and {prop} is the new expectation."
        )
        logic = f"Trend injection: '{trend}' as a forcing function reveals unmet needs in {theme}."
        use_case = f"First-mover {theme} product designed for the {trend} era."
        tags = list(set(concept.tags[:2] + trend.lower().split() + ["trend", theme.lower()]))
        return Idea(title, desc, logic, use_case, tags, "trend_injection")
