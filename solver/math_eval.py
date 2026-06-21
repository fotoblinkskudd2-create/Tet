"""A safe, scientific arithmetic evaluator and its solver capability."""
from __future__ import annotations

import ast
import math
import operator
from typing import Callable, Dict, Optional

from .core import Capability, Solution

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

# Constants and functions that are safe to expose to user expressions.  Every
# entry is pure and side-effect free, so even hostile input can do no more than
# compute a number (or raise).
_CONSTANTS: Dict[str, float] = {
    "pi": math.pi,
    "e": math.e,
    "tau": math.tau,
    "inf": math.inf,
}

_FUNCTIONS: Dict[str, Callable[..., float]] = {
    "sqrt": math.sqrt,
    "cbrt": lambda x: math.copysign(abs(x) ** (1 / 3), x),
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "asin": math.asin,
    "acos": math.acos,
    "atan": math.atan,
    "atan2": math.atan2,
    "hypot": math.hypot,
    "exp": math.exp,
    "log": math.log,        # log(x) or log(x, base)
    "log2": math.log2,
    "log10": math.log10,
    "floor": lambda x: float(math.floor(x)),
    "ceil": lambda x: float(math.ceil(x)),
    "trunc": lambda x: float(math.trunc(x)),
    "fabs": math.fabs,
    "abs": abs,
    "round": lambda x, n=0: round(x, int(n)),
    "factorial": lambda x: float(math.factorial(int(x))),
    "gcd": lambda a, b: float(math.gcd(int(a), int(b))),
    "lcm": lambda a, b: float(math.lcm(int(a), int(b))),
    "degrees": math.degrees,
    "radians": math.radians,
    "min": min,
    "max": max,
    "pow": pow,
}


def safe_math_eval(expr: str) -> float:
    """Safely evaluate a math expression using Python's AST.

    Supports the four operations, powers, unary signs, a curated set of
    scientific functions (``sqrt``, ``sin``, ``log`` …) and constants
    (``pi``, ``e``, ``tau``).  Anything outside that allow-list raises
    ``ValueError`` so no arbitrary code can run.
    """

    def _evaluate(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return _evaluate(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.Name):
            if node.id in _CONSTANTS:
                return _CONSTANTS[node.id]
            raise ValueError(f"Unknown name: {node.id}")
        if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
            return _BIN_OPS[type(node.op)](_evaluate(node.left), _evaluate(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
            return _UNARY_OPS[type(node.op)](_evaluate(node.operand))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            func = _FUNCTIONS.get(node.func.id)
            if func is None or node.keywords:
                raise ValueError(f"Unsupported function: {node.func.id}")
            args = [_evaluate(arg) for arg in node.args]
            return float(func(*args))
        raise ValueError("Unsupported expression for safe evaluation.")

    tree = ast.parse(expr, mode="eval")
    return _evaluate(tree)


def _format_number(value: float) -> str:
    """Render a float as an int when it is whole, else with light rounding."""

    if math.isinf(value) or math.isnan(value):
        return str(value)
    rounded = round(value, 6)
    if float(rounded).is_integer():
        return str(int(rounded))
    return str(rounded)


def solve_math(problem: str) -> Optional[Solution]:
    cleaned = problem.strip()
    if not cleaned:
        return None
    try:
        result = safe_math_eval(cleaned)
    except Exception:
        return None

    answer = f"The numbers danced and the answer is {_format_number(result)}!"
    details = [
        "Crunching numbers is my cardio.",
        "Remember: math is just puzzles wearing serious hats.",
    ]
    return Solution(kind="Math", answer=answer, details=details, tags=("math",))


CAPABILITY = Capability(
    name="math",
    summary="Evaluate arithmetic and scientific expressions safely.",
    examples=("2 + 3 * 4", "sqrt(2) * pi", "log(1024, 2)", "factorial(6)"),
    solve=solve_math,
    priority=900,  # greedy on bare numbers, so let specific skills go first
)
