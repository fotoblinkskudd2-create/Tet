"""Quantitative solvers: descriptive statistics, percentages, sequences."""
from __future__ import annotations

import re
import statistics
from typing import List, Optional

from .core import Capability, Solution

_NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")


def _extract_numbers(text: str) -> List[float]:
    return [float(token) for token in _NUMBER_RE.findall(text)]


def _fmt(value: float) -> str:
    rounded = round(value, 6)
    return str(int(rounded)) if float(rounded).is_integer() else str(rounded)


# --------------------------------------------------------------------------- #
# Descriptive statistics
# --------------------------------------------------------------------------- #
_STAT_KEYWORDS = (
    "mean", "average", "median", "mode", "sum", "variance",
    "standard deviation", "std", "range", "summarize", "summary",
)


def solve_statistics(problem: str) -> Optional[Solution]:
    lowered = problem.lower()
    if not any(word in lowered for word in _STAT_KEYWORDS):
        return None
    numbers = _extract_numbers(problem)
    if len(numbers) < 2:
        return None

    count = len(numbers)
    total = sum(numbers)
    mean = statistics.fmean(numbers)
    median = statistics.median(numbers)
    spread = max(numbers) - min(numbers)
    details = [
        f"count = {count}",
        f"sum = {_fmt(total)}",
        f"mean = {_fmt(mean)}",
        f"median = {_fmt(median)}",
        f"min = {_fmt(min(numbers))}, max = {_fmt(max(numbers))}, range = {_fmt(spread)}",
    ]
    if count >= 2:
        details.append(f"sample stdev = {_fmt(statistics.stdev(numbers))}")
        details.append(f"population stdev = {_fmt(statistics.pstdev(numbers))}")

    # Pick the headline figure from the explicit request.
    if "median" in lowered:
        headline = f"The median is {_fmt(median)}."
    elif "mode" in lowered:
        try:
            headline = f"The mode is {_fmt(statistics.mode(numbers))}."
        except statistics.StatisticsError:
            headline = "There is no single mode (values are equally common)."
    elif "sum" in lowered:
        headline = f"The sum is {_fmt(total)}."
    elif "variance" in lowered:
        headline = f"The sample variance is {_fmt(statistics.variance(numbers))}."
    elif "std" in lowered or "standard deviation" in lowered:
        headline = f"The sample standard deviation is {_fmt(statistics.stdev(numbers))}."
    elif "range" in lowered:
        headline = f"The range is {_fmt(spread)}."
    else:
        headline = f"The mean is {_fmt(mean)}."

    return Solution(kind="Statistics", answer=headline, details=details, tags=("math", "stats"))


# --------------------------------------------------------------------------- #
# Percentages
# --------------------------------------------------------------------------- #
def solve_percentage(problem: str) -> Optional[Solution]:
    text = problem.lower().replace("percent", "%")

    # "what is 15% of 200"
    m = re.search(r"(-?\d+(?:\.\d+)?)\s*%\s*of\s*(-?\d+(?:\.\d+)?)", text)
    if m:
        pct, whole = float(m.group(1)), float(m.group(2))
        value = pct / 100 * whole
        return Solution(
            kind="Percentage",
            answer=f"{_fmt(pct)}% of {_fmt(whole)} is {_fmt(value)}.",
            details=[f"{_fmt(pct)} / 100 × {_fmt(whole)} = {_fmt(value)}"],
            tags=("math",),
        )

    # "20 is what percent of 80"
    m = re.search(r"(-?\d+(?:\.\d+)?)\s*is\s*what\s*%\s*of\s*(-?\d+(?:\.\d+)?)", text)
    if m:
        part, whole = float(m.group(1)), float(m.group(2))
        if whole != 0:
            value = part / whole * 100
            return Solution(
                kind="Percentage",
                answer=f"{_fmt(part)} is {_fmt(value)}% of {_fmt(whole)}.",
                details=[f"{_fmt(part)} / {_fmt(whole)} × 100 = {_fmt(value)}%"],
                tags=("math",),
            )

    # "increase/decrease 100 by 10%"
    m = re.search(r"(increase|decrease|raise|reduce)\s*(-?\d+(?:\.\d+)?)\s*by\s*(-?\d+(?:\.\d+)?)\s*%", text)
    if m:
        direction, base, pct = m.group(1), float(m.group(2)), float(m.group(3))
        sign = 1 if direction in ("increase", "raise") else -1
        value = base * (1 + sign * pct / 100)
        word = "increased" if sign > 0 else "decreased"
        return Solution(
            kind="Percentage",
            answer=f"{_fmt(base)} {word} by {_fmt(pct)}% is {_fmt(value)}.",
            details=[f"change = {_fmt(sign * pct / 100 * base)}"],
            tags=("math",),
        )
    return None


# --------------------------------------------------------------------------- #
# Sequence continuation (arithmetic / geometric)
# --------------------------------------------------------------------------- #
def solve_sequence(problem: str) -> Optional[Solution]:
    lowered = problem.lower()
    if not re.search(r"\b(next|continue|sequence|series|pattern)\b", lowered):
        return None
    numbers = _extract_numbers(problem)
    if len(numbers) < 3:
        return None

    diffs = [b - a for a, b in zip(numbers, numbers[1:])]
    if all(abs(d - diffs[0]) < 1e-9 for d in diffs):
        step = diffs[0]
        nxt = numbers[-1] + step
        return Solution(
            kind="Sequence",
            answer=f"This is an arithmetic sequence (step {_fmt(step)}); the next term is {_fmt(nxt)}.",
            details=[
                f"common difference = {_fmt(step)}",
                f"following terms: {_fmt(nxt)}, {_fmt(nxt + step)}, {_fmt(nxt + 2 * step)}",
            ],
            tags=("math",),
        )

    if all(n != 0 for n in numbers):
        ratios = [b / a for a, b in zip(numbers, numbers[1:])]
        if all(abs(r - ratios[0]) < 1e-9 for r in ratios):
            ratio = ratios[0]
            nxt = numbers[-1] * ratio
            return Solution(
                kind="Sequence",
                answer=f"This is a geometric sequence (ratio {_fmt(ratio)}); the next term is {_fmt(nxt)}.",
                details=[
                    f"common ratio = {_fmt(ratio)}",
                    f"following terms: {_fmt(nxt)}, {_fmt(nxt * ratio)}",
                ],
                tags=("math",),
            )

    # Second-difference (quadratic) detection.
    second = [b - a for a, b in zip(diffs, diffs[1:])]
    if second and all(abs(d - second[0]) < 1e-9 for d in second):
        next_diff = diffs[-1] + second[0]
        nxt = numbers[-1] + next_diff
        return Solution(
            kind="Sequence",
            answer=f"This looks quadratic (constant second difference {_fmt(second[0])}); the next term is {_fmt(nxt)}.",
            details=[f"first differences: {', '.join(_fmt(d) for d in diffs)}"],
            tags=("math",),
        )
    return None


STATISTICS_CAPABILITY = Capability(
    name="statistics",
    summary="Descriptive statistics over a list of numbers.",
    examples=("mean of 4 8 15 16 23 42", "median of 3 1 2", "summary of 10 20 30"),
    solve=solve_statistics,
    priority=180,
)

PERCENTAGE_CAPABILITY = Capability(
    name="percentage",
    summary="Percentage-of, what-percent, and increase/decrease problems.",
    examples=("what is 15% of 200", "20 is what percent of 80", "increase 100 by 10%"),
    solve=solve_percentage,
    priority=170,
)

SEQUENCE_CAPABILITY = Capability(
    name="sequence",
    summary="Detect arithmetic, geometric and quadratic runs and predict the next term.",
    examples=("next number in 2 4 6 8", "continue 3 6 12 24", "next in 1 4 9 16"),
    solve=solve_sequence,
    priority=160,
)
