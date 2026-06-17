"""Parser for raw idea markdown files.

Reads `## Idea: <name>` sections with `Felt: verdi` lines underneath and
turns them into structured idea dicts the scoring engine can consume.
"""
from __future__ import annotations

import glob
import os
import re
from typing import Any, Dict, List

HEADING_RE = re.compile(r"^##\s+(?:Idea:\s*)?(.+?)\s*$")
FIELD_RE = re.compile(r"^([^:]+):\s*(.*)$")

# Maps the Norwegian labels used in the input files to internal field names.
FIELD_MAP = {
    "kategori": "category",
    "problem": "problem",
    "hvem betaler": "who_pays",
    "første salgbare leveranse": "first_deliverable",
    "teknisk vanskelighet": "technical_difficulty",
    "markedsverdi": "market_value",
    "byggbarhet": "buildability",
    "dokumentasjonsverdi": "documentation_value",
    "risiko": "risk",
}

NUMERIC_FIELDS = {
    "technical_difficulty",
    "market_value",
    "buildability",
    "documentation_value",
    "risk",
}

REQUIRED_FIELDS = [
    "name",
    "category",
    "problem",
    "who_pays",
    "first_deliverable",
    "technical_difficulty",
    "market_value",
    "buildability",
    "documentation_value",
    "risk",
]


class IdeaParseError(ValueError):
    """Raised when one or more ideas are missing required fields."""


def _split_into_blocks(text: str) -> List[List[str]]:
    """Splits raw markdown text into one line-list per `## Idea:` section."""
    blocks: List[List[str]] = []
    current: List[str] | None = None
    for line in text.splitlines():
        heading = HEADING_RE.match(line)
        if heading:
            current = [line]
            blocks.append(current)
        elif current is not None:
            current.append(line)
    return blocks


def _parse_block(lines: List[str]) -> Dict[str, Any]:
    heading_match = HEADING_RE.match(lines[0])
    idea: Dict[str, Any] = {"name": heading_match.group(1).strip()}

    for line in lines[1:]:
        if not line.strip():
            continue
        field_match = FIELD_RE.match(line)
        if not field_match:
            continue
        label = field_match.group(1).strip().lower()
        value = field_match.group(2).strip()
        field_name = FIELD_MAP.get(label)
        if field_name is None:
            continue
        if field_name in NUMERIC_FIELDS:
            try:
                idea[field_name] = int(value)
            except ValueError as exc:
                raise IdeaParseError(
                    f"Idé '{idea['name']}': feltet '{label}' må være et heltall, fikk '{value}'"
                ) from exc
        else:
            idea[field_name] = value

    return idea


def validate_idea(idea: Dict[str, Any]) -> List[str]:
    """Returns a list of missing or invalid required fields for one idea."""
    missing = [field for field in REQUIRED_FIELDS if not str(idea.get(field, "")).strip()]
    for field in NUMERIC_FIELDS:
        if field in idea:
            value = idea[field]
            if not isinstance(value, int) or not (1 <= value <= 10):
                missing.append(f"{field} (må være heltall 1-10, fikk {value!r})")
    return missing


def parse_ideas_text(text: str, source: str = "<text>") -> List[Dict[str, Any]]:
    blocks = _split_into_blocks(text)
    ideas: List[Dict[str, Any]] = []
    errors: List[str] = []

    for block in blocks:
        idea = _parse_block(block)
        missing = validate_idea(idea)
        if missing:
            errors.append(
                f"Idé '{idea.get('name', '?')}' i {source} mangler/har ugyldige felt: {', '.join(missing)}"
            )
        else:
            ideas.append(idea)

    if errors:
        raise IdeaParseError("\n".join(errors))

    return ideas


def parse_ideas_file(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as handle:
        text = handle.read()
    return parse_ideas_text(text, source=os.path.basename(path))


def parse_ideas_directory(directory: str) -> List[Dict[str, Any]]:
    ideas: List[Dict[str, Any]] = []
    for path in sorted(glob.glob(os.path.join(directory, "*.md"))):
        ideas.extend(parse_ideas_file(path))
    return ideas
