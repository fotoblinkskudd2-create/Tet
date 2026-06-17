"""CLI interface for the idea engine — stdlib only."""
import sys
import textwrap
from .generator import IdeaGenerator


BANNER = r"""
 ██╗██████╗ ███████╗ █████╗      ███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
 ██║██╔══██╗██╔════╝██╔══██╗     ██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
 ██║██║  ██║█████╗  ███████║     █████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗
 ██║██║  ██║██╔══╝  ██╔══██║     ██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝
 ██║██████╔╝███████╗██║  ██║     ███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
 ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
"""

DIVIDER = "─" * 72
MEDAL = ["🥇", "🥈", "🥉", "  4.", "  5.", "  6.", "  7.", "  8."]


def _wrap(text: str, width: int = 66, indent: str = "    ") -> str:
    return textwrap.fill(text, width=width, initial_indent=indent, subsequent_indent=indent)


def run_cli():
    print(BANNER)
    print("  Creative Idea Generator — lateral thinking engine\n")

    if len(sys.argv) > 1:
        theme = " ".join(sys.argv[1:])
    else:
        theme = input("  Enter a theme or domain: ").strip() or "future of work"

    constraints_raw = input("  Constraints (comma-separated, or Enter to skip): ").strip()
    constraints = [c.strip() for c in constraints_raw.split(",") if c.strip()]

    trends_raw = input("  Inject trends (comma-separated, or Enter for defaults): ").strip()
    trends = [t.strip() for t in trends_raw.split(",") if t.strip()] or None

    print(f"\n{DIVIDER}")
    print(f"  Generating ideas for: «{theme}»")
    if constraints:
        print(f"  Constraints: {', '.join(constraints)}")
    print(DIVIDER)

    gen = IdeaGenerator()
    ideas = gen.generate(theme, constraints=constraints, trends=trends, n=8)

    for i, idea in enumerate(ideas):
        medal = MEDAL[i] if i < len(MEDAL) else f"  {i+1}."
        print(f"\n{medal} {idea.title}")
        print(_wrap(idea.description))
        print(_wrap(f"↳ Logic: {idea.logic}"))
        print(_wrap(f"↳ Use case: {idea.use_case}"))
        print(_wrap(f"↳ Tags: {', '.join(idea.tags)}"))
        if idea.score:
            s = idea.score
            bar_orig = "█" * int(s.originality * 10) + "░" * (10 - int(s.originality * 10))
            bar_via  = "█" * int(s.viability * 10)  + "░" * (10 - int(s.viability * 10))
            print(f"    Score → orig [{bar_orig}] via [{bar_via}] = {s.combined:.2f}")

    print(f"\n{DIVIDER}")
    print(f"  {len(ideas)} ideas generated. Let your mind run.\n")


if __name__ == "__main__":
    run_cli()
