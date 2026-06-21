"""Domain definitions for the Tet personal system.

Every captured item belongs to exactly one category. Categories carry a
bilingual label (English / Norwegian) so the dashboard and CLI stay friendly
for a Norwegian-speaking user while remaining readable in code.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class Category:
    """A single area of life or work that the system tracks."""

    key: str
    label_en: str
    label_no: str
    emoji: str
    description: str
    # Optional metadata fields that make sense to capture for this category.
    fields: Tuple[str, ...] = field(default_factory=tuple)

    @property
    def label(self) -> str:
        return f"{self.emoji} {self.label_en} / {self.label_no}"


# The registry is intentionally ordered: daily life first, speculative ideas
# in the middle, money matters last.
CATEGORIES: Dict[str, Category] = {
    c.key: c
    for c in (
        Category(
            key="daily",
            label_en="Daily",
            label_no="Hverdag",
            emoji="📅",
            description="Everyday tasks, notes, errands and reminders.",
            fields=("due", "context"),
        ),
        Category(
            key="ai",
            label_en="AI",
            label_no="KI",
            emoji="🤖",
            description="AI experiments, prompts, models and automations to try.",
            fields=("model", "prompt", "result"),
        ),
        Category(
            key="invention",
            label_en="Invention",
            label_no="Oppfinnelse",
            emoji="💡",
            description="Raw invention ideas before they are patent-ready.",
            fields=("problem", "solution", "novelty"),
        ),
        Category(
            key="patent",
            label_en="Patent",
            label_no="Patent",
            emoji="📜",
            description="Inventions being developed toward a patent filing.",
            fields=("claim", "prior_art", "status_office"),
        ),
        Category(
            key="workflow",
            label_en="Workflow",
            label_no="Arbeidsflyt",
            emoji="🔄",
            description="Repeatable processes, checklists and automations.",
            fields=("trigger", "steps", "tools"),
        ),
        Category(
            key="music",
            label_en="Music",
            label_no="Musikk",
            emoji="🎵",
            description="Track ideas, lyrics, references and production notes.",
            fields=("bpm", "key", "reference"),
        ),
        Category(
            key="video",
            label_en="Video",
            label_no="Video",
            emoji="🎬",
            description="Video concepts, shot lists and edit notes.",
            fields=("length", "aspect", "reference"),
        ),
        Category(
            key="art",
            label_en="Art",
            label_no="Kunst",
            emoji="🎨",
            description="Visual art ideas, styles and palettes.",
            fields=("medium", "palette", "reference"),
        ),
        Category(
            key="image",
            label_en="Image",
            label_no="Bilde",
            emoji="🖼️",
            description="Image/photo concepts and generation prompts.",
            fields=("subject", "lighting", "prompt"),
        ),
        Category(
            key="concept",
            label_en="Concept",
            label_no="Konsept",
            emoji="🧩",
            description="Cross-cutting concepts, frameworks and big-picture ideas.",
            fields=("thesis", "evidence"),
        ),
        Category(
            key="eco",
            label_en="Eco/Econ idea",
            label_no="Øko-idé",
            emoji="🌱",
            description="Economic and ecological ideas worth hunting and scoring.",
            fields=("impact", "feasibility", "market"),
        ),
        Category(
            key="stock",
            label_en="Stock",
            label_no="Aksje",
            emoji="📈",
            description="Stock watchlist with thesis, target and conviction.",
            fields=("ticker", "thesis", "target", "conviction"),
        ),
    )
}

CATEGORY_KEYS: List[str] = list(CATEGORIES.keys())


def resolve_category(value: str) -> str:
    """Map a user supplied string to a known category key.

    Accepts the key, the English label or a few common aliases so the CLI is
    forgiving about input.
    """

    if not value:
        raise ValueError("A category is required.")
    lowered = value.strip().lower()
    if lowered in CATEGORIES:
        return lowered

    aliases = {
        "task": "daily",
        "todo": "daily",
        "note": "daily",
        "ki": "ai",
        "idea": "invention",
        "ide": "invention",
        "idé": "invention",
        "process": "workflow",
        "flow": "workflow",
        "song": "music",
        "track": "music",
        "film": "video",
        "clip": "video",
        "picture": "image",
        "photo": "image",
        "foto": "image",
        "economy": "eco",
        "economic": "eco",
        "ecological": "eco",
        "okonomi": "eco",
        "okologi": "eco",
        "aksje": "stock",
        "share": "stock",
        "equity": "stock",
    }
    if lowered in aliases:
        return aliases[lowered]

    for key, cat in CATEGORIES.items():
        if lowered == cat.label_en.lower() or lowered == cat.label_no.lower():
            return key

    raise ValueError(
        f"Unknown category '{value}'. Known categories: {', '.join(CATEGORY_KEYS)}"
    )
