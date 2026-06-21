"""Creative prompt helpers for the Tet system.

This reuses the prompt builder that already lives in ``app.py`` (single source
of truth) and adds light convenience for the multi-medium creative categories:
music, video, art and image.
"""
from __future__ import annotations

from typing import Optional

try:  # pragma: no cover - import shim depends on how the package is launched
    from app import build_creative_prompt, Solution
except Exception:  # pragma: no cover
    import os
    import sys

    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from app import build_creative_prompt, Solution  # type: ignore


# Map Tet categories onto the prompt builder's mediums.
CATEGORY_TO_MEDIUM = {
    "music": "music",
    "video": "video",
    "art": "art",
    "image": "photo",
    "concept": "art",
}


def prompt_for_category(category: str, seed: str) -> Solution:
    """Build a creative brief tuned to a Tet category."""

    medium = CATEGORY_TO_MEDIUM.get(category)
    return build_creative_prompt(seed, medium_hint=medium)


def prompt(seed: str, medium: Optional[str] = None) -> Solution:
    """Direct pass-through to the shared creative prompt builder."""

    return build_creative_prompt(seed, medium_hint=medium)
