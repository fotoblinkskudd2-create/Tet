"""Safe arithmetic evaluation.

The evaluator walks Python's own AST and only honours an explicit allow-list
of operators, function calls and named constants. There is no ``eval`` of
untrusted strings, no attribute access, and no name resolution beyond the
constants we hand out -- so ``__import__`` and friends are unreachable.
"""

from __future__ import annotations

import ast
import math
import operator
from typing import Callable, Dict, Optional

from ..core import Solution, Solver

_BIN_OPS: Dict[type, Callable[[float, float], float]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

_UNARY_OPS: Dict[type, Callable[[float], float]] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

# Functions and constants the evaluator is willing to expose. Everything here
# is a pure, side-effect-free numeric primitive.
_FUNCS: Dict[str, Callable[..., float]] = {
    "sqrt": math.sqrt,
    "abs": abs,
    "round": round,
    "floor": math.floor,
    "ceil": math.ceil,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "asin": math.asin,
    "acos": math.acos,
    "atan": math.atan,
    "log": math.log,
    "log2": math.log2,
    "log10": math.log10,
    "exp": math.exp,
    "factorial": lambda n: float(math.factorial(int(n))),
    "gcd": lambda a, b: float(math.gcd(int(a), int(b))),
    "min": min,
    "max": max,
    "hypot": math.hypot,
    "degrees": math.degrees,
    "radians": math.radians,
}

_CONSTS: Dict[str, float] = {
    "pi": math.pi,
    "e": math.e,
    "tau": math.tau,
}


class UnsafeExpression(ValueError):
    """Raised when an expression contains a node we refuse to evaluate."""


def safe_eval(expr: str) -> float:
    """Evaluate a numeric expression, raising on anything unexpected."""

    def _eval(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.Name):
            if node.id in _CONSTS:
                return _CONSTS[node.id]
            raise UnsafeExpression(f"Unknown name: {node.id}")
        if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
            return _BIN_OPS[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
            return _UNARY_OPS[type(node.op)](_eval(node.operand))
        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name) or node.func.id not in _FUNCS:
                raise UnsafeExpression("Unsupported function call.")
            if node.keywords:
                raise UnsafeExpression("Keyword arguments are not supported.")
            args = [_eval(arg) for arg in node.args]
            return float(_FUNCS[node.func.id](*args))
        raise UnsafeExpression("Unsupported expression for safe evaluation.")

    tree = ast.parse(expr, mode="eval")
    return _eval(tree)


def _looks_like_arithmetic(text: str) -> bool:
    """Cheap pre-filter so plain prose never reaches the parser."""

    has_digit = any(ch.isdigit() for ch in text)
    has_const = any(name in text for name in _CONSTS)
    return (has_digit or has_const) and any(ch in text for ch in "+-*/%^()") or (
        # A bare expression like "sqrt(2)" or "factorial(5)".
        any(fn + "(" in text.replace(" ", "") for fn in _FUNCS)
    )


def format_number(value: float) -> str:
    """Render a float as an int when whole, otherwise rounded to 4 dp."""

    if value == int(value):
        return str(int(value))
    return str(round(value, 4))


class ArithmeticSolver(Solver):
    name = "arithmetic"
    kind = "Math"
    description = "Evaluate arithmetic, with functions like sqrt, log and sin."

    def solve(self, problem: str) -> Optional[Solution]:
        cleaned = problem.strip()
        if not cleaned:
            return None
        # ``^`` reads as exponent to most humans; Python spells it ``**``.
        normalized = cleaned.replace("^", "**")
        if not _looks_like_arithmetic(normalized):
            return None
        try:
            result = safe_eval(normalized)
        except Exception:
            return None
        if not math.isfinite(result):
            return None

        rendered = format_number(result)
        answer = f"The numbers danced and the answer is {rendered}!"
        details = [
            "Crunching numbers is my cardio.",
            "Remember: math is just puzzles wearing serious hats.",
        ]
        return self.make(answer, details, confidence=0.92)
