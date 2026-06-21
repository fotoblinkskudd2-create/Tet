"""A family of small numeric solvers.

Grouped together because they share a theme (number crunching) and each is
only a handful of lines: base conversion, Roman numerals, percentages and
descriptive statistics.
"""

from __future__ import annotations

import re
import statistics as _stats
from typing import List, Optional

from ..core import Solution, Solver

# --------------------------------------------------------------------------- #
# Base conversion
# --------------------------------------------------------------------------- #

_BASE_WORDS = {
    "binary": 2, "bin": 2,
    "octal": 8, "oct": 8,
    "decimal": 10, "dec": 10,
    "hex": 16, "hexadecimal": 16,
}

_BASE_RE = re.compile(
    r"(?:convert\s+)?(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|-?\d+)\s*"
    r"(?:to|in|into|->|as)\s*(\w+)",
    re.IGNORECASE,
)


def _parse_int(token: str) -> Optional[int]:
    try:
        return int(token, 0) if token.lower().startswith(("0x", "0b", "0o")) else int(token)
    except ValueError:
        return None


def render_base(value: int, base: int) -> str:
    if base == 2:
        return bin(value)
    if base == 8:
        return oct(value)
    if base == 16:
        return hex(value)
    return str(value)


class BaseConversionSolver(Solver):
    name = "bases"
    kind = "Bases"
    description = "Convert integers between binary, octal, decimal and hex."

    def solve(self, problem: str) -> Optional[Solution]:
        match = _BASE_RE.search(problem)
        if not match:
            return None
        target_base = _BASE_WORDS.get(match.group(2).lower())
        if target_base is None:
            return None
        value = _parse_int(match.group(1))
        if value is None:
            return None

        rendered = render_base(value, target_base)
        answer = f"{match.group(1)} in {match.group(2).lower()} is {rendered} (decimal {value})."
        details = [
            f"Binary {bin(value)}, octal {oct(value)}, hex {hex(value)}, decimal {value}.",
        ]
        return self.make(answer, details, confidence=0.86)


# --------------------------------------------------------------------------- #
# Roman numerals
# --------------------------------------------------------------------------- #

_ROMAN_TABLE = (
    (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
    (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
    (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
)
_ROMAN_VALUES = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}

_ROMAN_TO_INT_RE = re.compile(r"\b([MDCLXVI]{2,})\b")
_INT_TO_ROMAN_RE = re.compile(r"roman.*?(\d+)|(\d+).*?roman", re.IGNORECASE)


def int_to_roman(value: int) -> str:
    if not 0 < value < 4000:
        raise ValueError("Roman numerals cover 1..3999.")
    parts: List[str] = []
    for amount, symbol in _ROMAN_TABLE:
        count, value = divmod(value, amount)
        parts.append(symbol * count)
    return "".join(parts)


def roman_to_int(text: str) -> int:
    total = 0
    prev = 0
    for char in reversed(text.upper()):
        current = _ROMAN_VALUES[char]
        total += -current if current < prev else current
        prev = max(prev, current)
    return total


class RomanSolver(Solver):
    name = "roman"
    kind = "Roman"
    description = "Convert between integers (1..3999) and Roman numerals."

    def solve(self, problem: str) -> Optional[Solution]:
        if "roman" in problem.lower():
            num = _INT_TO_ROMAN_RE.search(problem)
            if num:
                digits = num.group(1) or num.group(2)
                try:
                    value = int(digits)
                    answer = f"{value} in Roman numerals is {int_to_roman(value)}."
                    return self.make(answer, confidence=0.85)
                except ValueError:
                    return None
        match = _ROMAN_TO_INT_RE.search(problem.upper())
        if match and "roman" in problem.lower():
            try:
                value = roman_to_int(match.group(1))
            except KeyError:
                return None
            if int_to_roman(value) != match.group(1):
                return None  # reject malformed numerals like "IIII"
            answer = f"The Roman numeral {match.group(1)} equals {value}."
            return self.make(answer, confidence=0.85)
        return None


# --------------------------------------------------------------------------- #
# Percentages
# --------------------------------------------------------------------------- #

_PCT_OF_RE = re.compile(r"(-?\d+(?:\.\d+)?)\s*%\s*of\s*(-?\d+(?:\.\d+)?)", re.IGNORECASE)
_PCT_WHAT_RE = re.compile(
    r"what\s+percent.*?(-?\d+(?:\.\d+)?)\s+(?:of|out of)\s+(-?\d+(?:\.\d+)?)",
    re.IGNORECASE,
)
_PCT_CHANGE_RE = re.compile(
    r"(increase|decrease|raise|reduce)\s+(-?\d+(?:\.\d+)?)\s+by\s+(-?\d+(?:\.\d+)?)\s*%",
    re.IGNORECASE,
)


def _num(value: float) -> str:
    return str(int(value)) if value == int(value) else f"{value:.4g}"


class PercentageSolver(Solver):
    name = "percentage"
    kind = "Percent"
    description = "Compute X% of Y, what-percent, and percentage increase/decrease."

    def solve(self, problem: str) -> Optional[Solution]:
        change = _PCT_CHANGE_RE.search(problem)
        if change:
            direction, base, pct = change.group(1).lower(), float(change.group(2)), float(change.group(3))
            sign = -1 if direction in {"decrease", "reduce"} else 1
            result = base * (1 + sign * pct / 100.0)
            answer = f"{direction.capitalize()} {_num(base)} by {_num(pct)}% gives {_num(result)}."
            return self.make(answer, confidence=0.86)

        what = _PCT_WHAT_RE.search(problem)
        if what:
            part, whole = float(what.group(1)), float(what.group(2))
            if whole == 0:
                return None
            answer = f"{_num(part)} is {_num(part / whole * 100)}% of {_num(whole)}."
            return self.make(answer, confidence=0.86)

        of = _PCT_OF_RE.search(problem)
        if of:
            pct, whole = float(of.group(1)), float(of.group(2))
            answer = f"{_num(pct)}% of {_num(whole)} is {_num(pct / 100.0 * whole)}."
            return self.make(answer, confidence=0.86)
        return None


# --------------------------------------------------------------------------- #
# Descriptive statistics
# --------------------------------------------------------------------------- #

_STAT_RE = re.compile(
    r"\b(mean|average|median|mode|sum|min|max|range|stdev|variance)\b(.*)",
    re.IGNORECASE,
)
_NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")


def compute_stat(op: str, numbers: List[float]) -> Optional[float]:
    op = op.lower()
    if op in {"mean", "average"}:
        return _stats.fmean(numbers)
    if op == "median":
        return _stats.median(numbers)
    if op == "mode":
        return _stats.mode(numbers)
    if op == "sum":
        return sum(numbers)
    if op == "min":
        return min(numbers)
    if op == "max":
        return max(numbers)
    if op == "range":
        return max(numbers) - min(numbers)
    if op == "stdev":
        return _stats.pstdev(numbers)
    if op == "variance":
        return _stats.pvariance(numbers)
    return None


class StatisticsSolver(Solver):
    name = "statistics"
    kind = "Statistics"
    description = "Summaries (mean, median, mode, stdev, range, ...) over a list."

    def solve(self, problem: str) -> Optional[Solution]:
        match = _STAT_RE.search(problem)
        if not match:
            return None
        numbers = [float(token) for token in _NUMBER_RE.findall(match.group(2))]
        if len(numbers) < 1:
            return None
        op = match.group(1).lower()
        if op in {"stdev", "variance"} and len(numbers) < 2:
            return None
        try:
            result = compute_stat(op, numbers)
        except _stats.StatisticsError:
            return None
        if result is None:
            return None
        answer = (
            f"The {op} of {', '.join(_num(n) for n in numbers)} is {_num(float(result))}."
        )
        details = [f"Computed over {len(numbers)} value(s) using a population convention."]
        return self.make(answer, details, confidence=0.84)
