"""Command-line interface for the Tet problem solver."""
from __future__ import annotations

import argparse
import json
import sys
from typing import Iterable, List, Optional

from . import REGISTRY, solve_problem
from .creative import SUPPORTED_MEDIUMS, build_creative_prompt


def _format_capability_list() -> str:
    lines = ["Tet can currently handle these kinds of problems:", ""]
    for cap in REGISTRY.ordered():
        lines.append(f"  {cap.name:<16} {cap.summary}")
        lines.append(f"  {'':<16} e.g. {cap.examples[0]!r}")
    lines.append(f"  {'creative-prompt':<16} Build a creative brief (use --prompt).")
    lines.append("")
    lines.append("Anything else gets a friendly brainstorming scaffold.")
    return "\n".join(lines)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="A joyful assistant that tackles small problems with gusto!",
    )
    parser.add_argument(
        "--prompt",
        action="store_true",
        help="Turn a few words into a fully structured creative prompt for iOS web.",
    )
    parser.add_argument(
        "--medium",
        choices=[*SUPPORTED_MEDIUMS, "auto"],
        default="auto",
        help="Choose the creative medium for prompt mode. Defaults to auto-detect.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the solution as JSON instead of decorated text.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List every capability the solver currently supports.",
    )
    parser.add_argument(
        "--repl",
        action="store_true",
        help="Start an interactive session; type 'quit' to leave.",
    )
    parser.add_argument(
        "problem",
        nargs=argparse.REMAINDER,
        help="Tell me your problem to solve. Quotes are encouraged for multi-word puzzles!",
    )
    return parser


def _solve_text(problem_text: str, args: argparse.Namespace):
    if args.prompt:
        medium_hint = None if args.medium == "auto" else args.medium
        return build_creative_prompt(problem_text, medium_hint=medium_hint)
    return solve_problem(problem_text)


def _emit(solution, as_json: bool) -> None:
    if as_json:
        print(json.dumps(solution.to_dict(), ensure_ascii=False, indent=2))
    else:
        print(solution.format())


def _run_repl(args: argparse.Namespace) -> int:
    print("Tet interactive solver. Type 'quit', 'exit', or 'help'.")
    while True:
        try:
            line = input("tet> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not line:
            continue
        if line.lower() in {"quit", "exit"}:
            return 0
        if line.lower() in {"help", "?", "list"}:
            print(_format_capability_list())
            continue
        try:
            solution = _solve_text(line, args)
            _emit(solution, args.json)
        except ValueError as exc:
            print(f"⚠️  {exc}")


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    if args.list:
        print(_format_capability_list())
        return 0

    if args.repl:
        return _run_repl(args)

    if not args.problem:
        parser.print_help()
        return 0

    problem_text = " ".join(args.problem)
    try:
        solution = _solve_text(problem_text, args)
    except ValueError as exc:
        print(f"⚠️  {exc}", file=sys.stderr)
        return 1
    _emit(solution, args.json)
    return 0
