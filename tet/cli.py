"""Command-line interface for Tet.

Backwards compatible with the original ``app.py`` flags (``--prompt`` and
``--medium``) and extended with JSON output, a candidate inspector, a solver
listing and an interactive REPL.
"""

from __future__ import annotations

import argparse
import json
from typing import Iterable, List, Optional

from . import __version__, candidate_solutions, solve_problem
from .solvers import all_solvers, build_creative_prompt


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="tet",
        description="A joyful assistant that tackles small problems with gusto!",
    )
    parser.add_argument(
        "--prompt",
        action="store_true",
        help="Turn a few words into a fully structured creative prompt for iOS web.",
    )
    parser.add_argument(
        "--medium",
        choices=["photo", "video", "music", "art", "poem", "auto"],
        default="auto",
        help="Choose the creative medium for prompt mode. Defaults to auto-detect.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the solution as JSON instead of friendly text.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Show every solver's ranked candidate, not just the winner.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List the available solvers and exit.",
    )
    parser.add_argument(
        "--repl",
        action="store_true",
        help="Start an interactive prompt loop.",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"tet {__version__}",
    )
    parser.add_argument(
        "problem",
        nargs=argparse.REMAINDER,
        help="Tell me your problem to solve. Quotes are encouraged for multi-word puzzles!",
    )
    return parser


def _print_solver_list() -> None:
    print("Available solvers:\n")
    for solver in all_solvers():
        print(f"  {solver.name:<14} {solver.description}")


def _emit(text_or_solution, as_json: bool) -> None:
    if as_json:
        print(json.dumps(text_or_solution.to_dict(), ensure_ascii=False, indent=2))
    else:
        print(text_or_solution.format())


def _run_all(problem: str, as_json: bool) -> None:
    candidates = candidate_solutions(problem)
    if as_json:
        print(json.dumps([c.to_dict() for c in candidates], ensure_ascii=False, indent=2))
        return
    for rank, solution in enumerate(candidates, start=1):
        confidence = f"{solution.confidence:.2f}"
        print(f"[{rank}] {solution.source} (confidence {confidence})")
        print(solution.format())
        print()


def _repl() -> int:
    print("Tet REPL — type a problem, or 'quit' to leave.")
    while True:
        try:
            line = input("tet> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if line.lower() in {"quit", "exit", ":q"}:
            return 0
        if not line:
            continue
        print(solve_problem(line).format())
        print()


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    if args.list:
        _print_solver_list()
        return 0

    if args.repl:
        return _repl()

    if not args.problem:
        parser.print_help()
        return 0

    problem_text = " ".join(args.problem)

    if args.prompt:
        medium_hint = None if args.medium == "auto" else args.medium
        solution = build_creative_prompt(problem_text, medium_hint=medium_hint)
        _emit(solution, args.json)
        return 0

    if args.all:
        _run_all(problem_text, args.json)
        return 0

    solution = solve_problem(problem_text)
    _emit(solution, args.json)
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
