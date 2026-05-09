from __future__ import annotations

import ast
import operator
from typing import Callable, Dict

from agents.base_agent import BaseAgent
from core.queue import Task

_BIN_OPS: Dict[type, Callable] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}
_UNARY_OPS: Dict[type, Callable] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _safe_eval(node: ast.AST) -> float:
    if isinstance(node, ast.Expression):
        return _safe_eval(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
        return _BIN_OPS[type(node.op)](_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return _UNARY_OPS[type(node.op)](_safe_eval(node.operand))
    raise ValueError(f"Unsupported AST node: {type(node).__name__}")


class MathAgent(BaseAgent):
    @property
    def task_type(self) -> str:
        return "math"

    def process_task(self, task: Task) -> dict:
        expr = task.payload.get("expression", "").strip()
        if not expr:
            raise ValueError("Empty expression")
        tree = ast.parse(expr, mode="eval")
        value = _safe_eval(tree)
        result = int(value) if isinstance(value, float) and value.is_integer() else round(value, 8)
        return {"expression": expr, "result": result}
