"""Concept database with semantic associations for lateral thinking."""
from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class Concept:
    name: str
    domain: str
    tags: List[str]
    properties: List[str]
    antonyms: List[str] = field(default_factory=list)
    analogies: List[str] = field(default_factory=list)


CONCEPTS: List[Concept] = [
    # --- NATURE ---
    Concept("mycelium", "nature", ["network", "hidden", "distributed", "organic"],
            ["grows underground", "connects trees", "decomposes matter", "spreads invisibly"],
            antonyms=["isolated", "centralized"], analogies=["internet", "neural network"]),
    Concept("migration", "nature", ["movement", "seasonal", "collective", "instinct"],
            ["follows patterns", "crosses barriers", "driven by survival"],
            analogies=["remote work", "data flow", "trend cycles"]),
    Concept("symbiosis", "nature", ["mutual benefit", "interdependence", "cooperation"],
            ["both parties gain", "different species", "long-term relationship"],
            analogies=["partnership", "platform ecosystem", "API integration"]),
    Concept("metamorphosis", "nature", ["transformation", "phases", "radical change"],
            ["irreversible", "takes time", "produces something unrecognizable"],
            analogies=["pivot", "rebranding", "technology disruption"]),
    Concept("bioluminescence", "nature", ["light", "darkness", "signal", "attraction"],
            ["self-generated light", "communication", "defense mechanism"],
            analogies=["dark mode UI", "beacon marketing", "ambient notification"]),
    Concept("swarm intelligence", "nature", ["collective", "emergent", "decentralized"],
            ["no central control", "simple rules produce complexity", "adaptive"],
            analogies=["DAO", "crowd wisdom", "distributed computing"]),
    Concept("camouflage", "nature", ["adaptation", "deception", "context-awareness"],
            ["blends with environment", "protective", "dynamic"],
            analogies=["contextual UI", "stealth marketing", "adaptive design"]),
    Concept("echo location", "nature", ["sensing", "feedback", "navigation", "sound"],
            ["uses reflection", "works in darkness", "precise mapping"],
            analogies=["A/B testing", "user feedback loops", "radar systems"]),

    # --- TECHNOLOGY ---
    Concept("blockchain", "technology", ["immutable", "distributed", "trustless", "transparent"],
            ["no single owner", "append-only", "cryptographically secured"],
            analogies=["public ledger", "notary", "witness"]),
    Concept("neural network", "technology", ["learning", "pattern recognition", "layers"],
            ["trained on data", "black box", "improves with examples"],
            analogies=["brain", "apprenticeship", "intuition"]),
    Concept("API", "technology", ["interface", "connection", "abstraction", "protocol"],
            ["hides complexity", "enables interoperability", "contract-based"],
            analogies=["waiter in restaurant", "universal adapter", "language translator"]),
    Concept("compression", "technology", ["efficiency", "reduction", "encoding"],
            ["removes redundancy", "lossy or lossless", "enables transmission"],
            analogies=["summarization", "minimalism", "abstraction"]),
    Concept("caching", "technology", ["speed", "memory", "anticipation", "locality"],
            ["stores frequent data nearby", "trades space for time", "invalidation is hard"],
            analogies=["muscle memory", "pantry stocking", "habit"]),
    Concept("open source", "technology", ["transparency", "community", "remix", "free"],
            ["anyone can contribute", "forks create diversity", "trust through visibility"],
            analogies=["creative commons", "public library", "potluck dinner"]),
    Concept("zero knowledge proof", "technology", ["privacy", "verification", "paradox"],
            ["proves without revealing", "mathematical certainty", "counterintuitive"],
            analogies=["age verification without ID", "password hashing", "sealed bid"]),
    Concept("edge computing", "technology", ["distributed", "local", "latency", "decentralized"],
            ["processes near source", "reduces bandwidth", "offline-capable"],
            analogies=["local market", "pop-up store", "neighborhood clinic"]),

    # --- DESIGN ---
    Concept("negative space", "design", ["absence", "contrast", "breathing room", "silence"],
            ["defined by what is not there", "gives meaning to content", "creates tension"],
            analogies=["silence in music", "pause in speech", "fasting"]),
    Concept("affordance", "design", ["intuition", "usability", "invitation", "clarity"],
            ["signals its own use", "reduces cognitive load", "culturally learned"],
            analogies=["door handle", "button shape", "color convention"]),
    Concept("skeuomorphism", "design", ["familiarity", "metaphor", "transition", "comfort"],
            ["mimics physical objects", "eases learning curve", "can limit innovation"],
            analogies=["leather calendar app", "film grain filter", "cursive font"]),
    Concept("modular design", "design", ["flexibility", "interchangeable", "scalable"],
            ["components snap together", "replace without rebuilding", "mix and match"],
            analogies=["LEGO", "microservices", "prefab housing"]),
    Concept("gestalt", "design", ["wholeness", "perception", "grouping", "emergence"],
            ["whole greater than parts", "brain fills gaps", "patterns perceived instantly"],
            analogies=["constellations", "team synergy", "narrative arc"]),
    Concept("brutalism", "design", ["raw", "honest", "confrontational", "functional"],
            ["exposes structure", "anti-decorative", "deliberately uncomfortable"],
            analogies=["raw concrete", "anti-branding", "radical transparency"]),

    # --- BUSINESS ---
    Concept("freemium", "business", ["access", "conversion", "value ladder", "trust"],
            ["free entry", "premium ceiling", "converts over time"],
            analogies=["drug dealer model", "try before you buy", "public park"]),
    Concept("flywheel", "business", ["momentum", "compounding", "self-reinforcing"],
            ["each turn makes next easier", "takes initial energy", "hard to stop"],
            analogies=["network effect", "compound interest", "reputation"]),
    Concept("blue ocean", "business", ["uncontested", "creation", "differentiation"],
            ["avoids competition", "creates new demand", "redefines value"],
            analogies=["first mover", "genre creation", "unexplored territory"]),
    Concept("subscription", "business", ["recurring", "predictable", "relationship", "loyalty"],
            ["steady cashflow", "churn is the enemy", "lifetime value matters"],
            analogies=["membership", "marriage", "utility service"]),
    Concept("pivot", "business", ["adaptation", "survival", "learning", "courage"],
            ["changes direction while keeping learnings", "data-driven", "counter-intuitive"],
            analogies=["metamorphosis", "jazz improvisation", "course correction"]),
    Concept("platform", "business", ["marketplace", "two-sided", "network", "infrastructure"],
            ["connects buyers and sellers", "value created by users", "takes a cut"],
            analogies=["shopping mall", "telephone network", "language"]),

    # --- ART ---
    Concept("juxtaposition", "art", ["contrast", "tension", "meaning", "unexpected"],
            ["places opposites near each other", "creates new meaning through proximity"],
            analogies=["product placement", "A/B comparison", "mashup"]),
    Concept("improvisation", "art", ["spontaneous", "rule-free", "present", "generative"],
            ["responds to environment", "no undo", "failure is part of it"],
            analogies=["agile development", "live support", "freestyle"]),
    Concept("collage", "art", ["remix", "layering", "context-shift", "reuse"],
            ["combines existing elements", "changes meaning through placement", "democratic"],
            analogies=["mashup", "sampling", "bricolage"]),
    Concept("leitmotif", "art", ["recurring theme", "identity", "signature", "thread"],
            ["appears throughout", "evolves subtly", "creates cohesion"],
            analogies=["brand voice", "design system token", "franchise worldbuilding"]),
    Concept("negative capability", "art", ["uncertainty", "mystery", "openness", "Keats"],
            ["tolerates not knowing", "resists premature closure", "generative ambiguity"],
            analogies=["hypothesis testing", "beginner's mind", "divergent thinking"]),

    # --- PSYCHOLOGY ---
    Concept("cognitive dissonance", "psychology", ["conflict", "tension", "change", "belief"],
            ["holding contradictory beliefs", "creates discomfort", "drives behavior change"],
            analogies=["brand disruption", "plot twist", "paradigm shift"]),
    Concept("flow state", "psychology", ["focus", "effortless", "optimal", "immersion"],
            ["time disappears", "challenge matches skill", "intrinsically rewarding"],
            analogies=["game design sweet spot", "UX onboarding", "maker culture"]),
    Concept("anchoring", "psychology", ["reference", "bias", "pricing", "framing"],
            ["first number dominates", "hard to adjust from", "used in negotiation"],
            analogies=["price positioning", "headline framing", "first impression"]),
    Concept("social proof", "psychology", ["validation", "herd", "trust", "conformity"],
            ["others' choices reduce uncertainty", "reviews matter", "FOMO trigger"],
            analogies=["star ratings", "waitlist", "bestseller label"]),
    Concept("loss aversion", "psychology", ["fear", "asymmetry", "motivation", "risk"],
            ["losses feel twice as large as gains", "drives defensive decisions"],
            analogies=["insurance", "warranty", "undo button"]),

    # --- SCIENCE ---
    Concept("emergence", "science", ["complexity", "system", "unpredictable", "bottom-up"],
            ["properties arise from interaction", "not in parts alone", "self-organizing"],
            analogies=["culture", "language", "market prices"]),
    Concept("entropy", "science", ["disorder", "decay", "time", "inevitable"],
            ["systems tend toward disorder", "requires energy to maintain order"],
            analogies=["technical debt", "organizational drift", "cultural erosion"]),
    Concept("resonance", "science", ["amplification", "frequency", "harmony", "alignment"],
            ["matched frequencies amplify", "can destroy or create"],
            analogies=["viral content", "community fit", "product-market fit"]),
    Concept("catalysis", "science", ["acceleration", "enable", "unchanged agent", "threshold"],
            ["lowers activation energy", "catalyst is not consumed", "enables reaction"],
            analogies=["platform", "facilitator", "community manager"]),
    Concept("phase transition", "science", ["threshold", "sudden change", "tipping point"],
            ["small input causes massive shift", "irreversible at the edge"],
            analogies=["viral moment", "market adoption curve", "political revolution"]),
    Concept("dark matter", "science", ["hidden", "influence", "unknown", "majority"],
            ["not directly observable", "explains anomalies", "most of the universe"],
            analogies=["tacit knowledge", "shadow IT", "emotional labor"]),

    # --- PHILOSOPHY ---
    Concept("dialectics", "philosophy", ["thesis", "antithesis", "synthesis", "conflict"],
            ["opposites create new truth", "conflict is productive", "Hegel"],
            analogies=["design critique", "negotiation", "A/B test synthesis"]),
    Concept("bricolage", "philosophy", ["improvisation", "found materials", "resourcefulness"],
            ["builds with what is at hand", "meaning from fragments", "Lévi-Strauss"],
            analogies=["startup culture", "remix", "rapid prototyping"]),
    Concept("liminal space", "philosophy", ["threshold", "between", "transition", "potential"],
            ["neither here nor there", "maximum transformation potential", "disorienting"],
            analogies=["beta product", "onboarding", "pivot moment"]),
    Concept("Occam's razor", "philosophy", ["simplicity", "parsimony", "clarity"],
            ["simpler explanations preferred", "do not multiply entities unnecessarily"],
            analogies=["minimum viable product", "single responsibility", "minimalism"]),
]


class ConceptDatabase:
    def __init__(self):
        self._concepts = CONCEPTS
        self._by_domain: Dict[str, List[Concept]] = {}
        self._by_tag: Dict[str, List[Concept]] = {}
        for c in self._concepts:
            self._by_domain.setdefault(c.domain, []).append(c)
            for tag in c.tags:
                self._by_tag.setdefault(tag, []).append(c)

    @property
    def domains(self) -> List[str]:
        return list(self._by_domain.keys())

    def by_domain(self, domain: str) -> List[Concept]:
        return self._by_domain.get(domain, [])

    def by_tag(self, tag: str) -> List[Concept]:
        return self._by_tag.get(tag, [])

    def related_to(self, concept: Concept, n: int = 5) -> List[Concept]:
        scores: Dict[str, int] = {}
        for tag in concept.tags:
            for c in self._by_tag.get(tag, []):
                if c.name != concept.name:
                    scores[c.name] = scores.get(c.name, 0) + 1
        ranked = sorted(self._concepts, key=lambda c: scores.get(c.name, 0), reverse=True)
        return [c for c in ranked if c.name != concept.name][:n]

    def random_concepts(self, n: int, rng) -> List[Concept]:
        pool = list(self._concepts)
        rng.shuffle(pool)
        return pool[:n]

    def all(self) -> List[Concept]:
        return list(self._concepts)
