"""Date and time questions over ISO-8601 dates.

Pure helpers take an explicit ``today`` so the logic is deterministic and
unit-testable; the solver itself falls back to the real clock.
"""

from __future__ import annotations

import re
from datetime import date
from typing import List, Optional

from ..core import Solution, Solver

_ISO = r"(\d{4}-\d{2}-\d{2})"
_BETWEEN_RE = re.compile(rf"between\s+{_ISO}\s+and\s+{_ISO}", re.IGNORECASE)
_UNTIL_RE = re.compile(rf"(?:days?\s+)?(?:until|till|to|since|from)\s+{_ISO}", re.IGNORECASE)
_WEEKDAY_RE = re.compile(rf"(?:weekday|day of week|what day).*?{_ISO}", re.IGNORECASE)

_WEEKDAYS = (
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
)


def _parse(value: str) -> Optional[date]:
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def days_between(start: date, end: date) -> int:
    """Signed day count from ``start`` to ``end``."""

    return (end - start).days


def describe_until(target: date, today: date) -> str:
    delta = days_between(today, target)
    if delta > 0:
        return f"{delta} day(s) until {target.isoformat()} ({_WEEKDAYS[target.weekday()]})."
    if delta < 0:
        return f"{abs(delta)} day(s) since {target.isoformat()} ({_WEEKDAYS[target.weekday()]})."
    return f"{target.isoformat()} is today—savor it!"


class TemporalSolver(Solver):
    name = "temporal"
    kind = "Date"
    description = "Count days until/since/between ISO dates and name weekdays."

    def __init__(self, today: Optional[date] = None) -> None:
        self._today = today

    def _now(self) -> date:
        return self._today or date.today()

    def solve(self, problem: str) -> Optional[Solution]:
        between = _BETWEEN_RE.search(problem)
        if between:
            start, end = _parse(between.group(1)), _parse(between.group(2))
            if start and end:
                count = abs(days_between(start, end))
                answer = (
                    f"There are {count} day(s) between {start.isoformat()} "
                    f"and {end.isoformat()}."
                )
                return self.make(answer, self._details(), confidence=0.9)

        weekday = _WEEKDAY_RE.search(problem)
        if weekday:
            target = _parse(weekday.group(1))
            if target:
                answer = (
                    f"{target.isoformat()} falls on a {_WEEKDAYS[target.weekday()]}."
                )
                return self.make(answer, self._details(), confidence=0.9)

        until = _UNTIL_RE.search(problem)
        if until:
            target = _parse(until.group(1))
            if target:
                answer = describe_until(target, self._now())
                return self.make(answer, self._details(), confidence=0.88)

        return None

    @staticmethod
    def _details() -> List[str]:
        return [
            "Dates use ISO-8601 (YYYY-MM-DD) so there is never a day/month mix-up.",
            "Counts are whole calendar days, leap years included automatically.",
        ]
