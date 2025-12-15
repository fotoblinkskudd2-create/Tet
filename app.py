"""
A playful problem-solving CLI application.
"""
from __future__ import annotations

import argparse
import ast
import operator
import re
from dataclasses import dataclass
from typing import Callable, Dict, Iterable, List, Optional, Tuple


@dataclass
class Solution:
    """A lightweight wrapper for solutions returned by the solver."""

    kind: str
    answer: str
    details: Optional[List[str]] = None

    def format(self) -> str:
        """Return a user-friendly representation of the solution."""

        banner = f"✨ {self.kind} solution ready! ✨"
        parts = [banner, self.answer]
        if self.details:
            parts.append("\n".join(f"- {line}" for line in self.details))
        return "\n".join(parts)


def _safe_math_eval(expr: str) -> float:
    """Safely evaluate a math expression using Python's AST.

    Only allows basic numeric operations to keep evaluation safe.
    """

    allowed_bin_ops: Dict[type, Callable[[float, float], float]] = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.FloorDiv: operator.floordiv,
        ast.Mod: operator.mod,
        ast.Pow: operator.pow,
    }
    allowed_unary_ops: Dict[type, Callable[[float], float]] = {
        ast.UAdd: operator.pos,
        ast.USub: operator.neg,
    }

    def _evaluate(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return _evaluate(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.BinOp) and type(node.op) in allowed_bin_ops:
            left = _evaluate(node.left)
            right = _evaluate(node.right)
            return allowed_bin_ops[type(node.op)](left, right)
        if isinstance(node, ast.UnaryOp) and type(node.op) in allowed_unary_ops:
            return allowed_unary_ops[type(node.op)](_evaluate(node.operand))
        raise ValueError("Unsupported expression for safe evaluation.")

    tree = ast.parse(expr, mode="eval")
    return _evaluate(tree)


_ANAGRAM_LIBRARY: Dict[str, Tuple[str, ...]] = {
    "listen": ("silent", "enlist", "tinsel"),
    "evil": ("vile", "veil", "live"),
    "angel": ("glean", "angle"),
    "stressed": ("desserts",),
    "save": ("vase" ,),
}


def _solve_anagram(problem: str) -> Optional[Solution]:
    pattern = re.compile(r"(?:anagram of|unscramble)\s+([A-Za-z]+)")
    match = pattern.search(problem.lower())
    if not match:
        return None

    target = match.group(1)
    canonical = "".join(sorted(target))
    candidates: List[str] = []
    for source, words in _ANAGRAM_LIBRARY.items():
        if canonical == "".join(sorted(source)):
            candidates.extend(words)
    if not candidates:
        answer = f"I could not find a perfect match, but '{canonical}' looks like a fun jumble!"
    else:
        answer = f"Possible anagram buddies for '{target}': {', '.join(candidates)}"
    details = ["Try speaking the options out loud—sometimes the silliest sounds win!"]
    return Solution(kind="Anagram", answer=answer, details=details)


def _solve_math(problem: str) -> Optional[Solution]:
    cleaned = problem.strip()
    if not cleaned:
        return None
    try:
        result = _safe_math_eval(cleaned)
    except Exception:
        return None

    rounded = int(result) if result.is_integer() else round(result, 4)
    answer = f"The numbers danced and the answer is {rounded}!"
    details = [
        "Crunching numbers is my cardio.",
        "Remember: math is just puzzles wearing serious hats.",
    ]
    return Solution(kind="Math", answer=answer, details=details)


def _brainstorm_steps(problem: str) -> Solution:
    steps = [
        "Name the goal in one joyful sentence.",
        "List the facts and doodle a tiny diagram.",
        "Break the challenge into two bite-sized steps.",
        "Pick the easiest step and start there—momentum is magic!",
    ]
    answer = f"I don't have a direct solver for: '{problem}'. But we can still win together!"
    return Solution(kind="Brainstorm", answer=answer, details=steps)


def solve_problem(problem: str) -> Solution:
    """Attempt to solve a problem using available solvers."""

    for solver in (_solve_math, _solve_anagram):
        solution = solver(problem)
        if solution:
            return solution
    return _brainstorm_steps(problem)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="A joyful assistant that tackles small problems with gusto!",
    )
    parser.add_argument(
        "problem",
        nargs=argparse.REMAINDER,
        help="Tell me your problem to solve. Quotes are encouraged for multi-word puzzles!",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    if not args.problem:
        parser.print_help()
        return 0

    problem_text = " ".join(args.problem)
    solution = solve_problem(problem_text)
    print(solution.format())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
