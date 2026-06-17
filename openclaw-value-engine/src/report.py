"""Builds the ranked Markdown report and JSON export from scored ideas."""
from __future__ import annotations

import json
import os
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List

from src.dashboard import write_dashboard
from src.parser import parse_ideas_directory
from src.scorer import score_ideas

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUTS_DIR = os.path.join(PROJECT_ROOT, "inputs")
OUTPUTS_DIR = os.path.join(PROJECT_ROOT, "outputs")


def build_json_report(scored_ideas: List[Dict[str, Any]]) -> Dict[str, Any]:
    category_counts = Counter(idea["category"] for idea in scored_ideas)
    recommendation_counts = Counter(idea["recommendation"] for idea in scored_ideas)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "idea_count": len(scored_ideas),
        "category_counts": dict(category_counts),
        "recommendation_counts": dict(recommendation_counts),
        "ideas": scored_ideas,
    }


def build_markdown_report(scored_ideas: List[Dict[str, Any]]) -> str:
    lines: List[str] = []
    lines.append("# OpenClaw Value Report")
    lines.append("")
    lines.append(f"Generert: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"Antall idéer: {len(scored_ideas)}")
    lines.append("")

    recommendation_counts = Counter(idea["recommendation"] for idea in scored_ideas)
    lines.append(
        f"PASS: {recommendation_counts.get('PASS', 0)} | "
        f"REWORK: {recommendation_counts.get('REWORK', 0)} | "
        f"BLOCK: {recommendation_counts.get('BLOCK', 0)}"
    )
    lines.append("")

    lines.append("## Rangert liste")
    lines.append("")
    lines.append("| # | Score | Anbefaling | Navn | Kategori | Hvem betaler |")
    lines.append("|---|-------|------------|------|----------|--------------|")
    for rank, idea in enumerate(scored_ideas, start=1):
        lines.append(
            f"| {rank} | {idea['total_score']} | {idea['recommendation']} | "
            f"{idea['name']} | {idea['category']} | {idea['who_pays']} |"
        )
    lines.append("")

    lines.append("## Detaljer per idé")
    lines.append("")
    for rank, idea in enumerate(scored_ideas, start=1):
        lines.append(f"### {rank}. {idea['name']} — {idea['total_score']}/100 ({idea['recommendation']})")
        lines.append("")
        lines.append(f"- **Kategori:** {idea['category']}")
        lines.append(f"- **Problem:** {idea['problem']}")
        lines.append(f"- **Hvem betaler:** {idea['who_pays']}")
        lines.append(f"- **Første salgbare leveranse:** {idea['first_deliverable']}")
        lines.append(
            f"- **Faktorer:** teknisk vanskelighet {idea['technical_difficulty']}/10, "
            f"markedsverdi {idea['market_value']}/10, byggbarhet {idea['buildability']}/10, "
            f"dokumentasjonsverdi {idea['documentation_value']}/10, risiko {idea['risk']}/10"
        )
        lines.append(f"- **Forklaring av score:** {idea['explanation']}")
        lines.append(f"- **Neste handling innen 24 timer:** {idea['next_action']}")
        lines.append("")

    return "\n".join(lines)


def run(inputs_dir: str = INPUTS_DIR, outputs_dir: str = OUTPUTS_DIR) -> Dict[str, Any]:
    os.makedirs(outputs_dir, exist_ok=True)

    ideas = parse_ideas_directory(inputs_dir)
    scored_ideas = score_ideas(ideas)

    json_report = build_json_report(scored_ideas)
    markdown_report = build_markdown_report(scored_ideas)

    with open(os.path.join(outputs_dir, "value_report.json"), "w", encoding="utf-8") as handle:
        json.dump(json_report, handle, ensure_ascii=False, indent=2)

    with open(os.path.join(outputs_dir, "value_report.md"), "w", encoding="utf-8") as handle:
        handle.write(markdown_report)

    write_dashboard(scored_ideas, os.path.join(outputs_dir, "dashboard.html"))

    return json_report


if __name__ == "__main__":
    report = run()
    print(f"Skåret {report['idea_count']} idéer. Se outputs/value_report.md og outputs/dashboard.html")
