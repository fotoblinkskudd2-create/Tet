"""Calendar arithmetic: gaps between dates, weekdays, and date offsets."""
from __future__ import annotations

import re
from datetime import date, timedelta
from typing import List, Optional

from .core import Capability, Solution

_DATE_RE = re.compile(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b")


def _parse_dates(text: str) -> List[date]:
    dates: List[date] = []
    for year, month, day in _DATE_RE.findall(text):
        try:
            dates.append(date(int(year), int(month), int(day)))
        except ValueError:
            continue
    return dates


def solve_datetime(problem: str) -> Optional[Solution]:
    lowered = problem.lower()
    dates = _parse_dates(problem)

    # "days between A and B"
    if "between" in lowered and len(dates) >= 2:
        a, b = dates[0], dates[1]
        delta = abs((b - a).days)
        return Solution(
            kind="Date Math",
            answer=f"There are {delta} days between {a.isoformat()} and {b.isoformat()}.",
            details=[
                f"That's about {round(delta / 7, 2)} weeks or {round(delta / 365.25, 2)} years.",
                f"Earlier date: {min(a, b).isoformat()}; later date: {max(a, b).isoformat()}.",
            ],
            tags=("dates",),
        )

    # "add/subtract N days/weeks to/from DATE"  or  "N days after/before DATE"
    offset = re.search(
        r"(add|subtract|plus|minus)?\s*(\d+)\s*(days|day|weeks|week)\s*(after|before|to|from)?",
        lowered,
    )
    if offset and dates:
        amount = int(offset.group(2))
        unit_days = 7 if "week" in offset.group(3) else 1
        verb = offset.group(1) or offset.group(4) or ""
        sign = -1 if verb in ("subtract", "minus", "before") else 1
        result = dates[0] + timedelta(days=sign * amount * unit_days)
        action = "after" if sign > 0 else "before"
        return Solution(
            kind="Date Math",
            answer=f"{amount} {offset.group(3)} {action} {dates[0].isoformat()} is {result.isoformat()} ({result.strftime('%A')}).",
            details=[f"Resulting date falls on a {result.strftime('%A')}."],
            tags=("dates",),
        )

    # "what day of the week is DATE" / "weekday of DATE"
    if dates and re.search(r"\b(day of the week|weekday|what day)\b", lowered):
        d = dates[0]
        return Solution(
            kind="Date Math",
            answer=f"{d.isoformat()} falls on a {d.strftime('%A')}.",
            details=[
                f"Day {d.timetuple().tm_yday} of {d.year}.",
                f"ISO week {d.isocalendar().week}.",
            ],
            tags=("dates",),
        )
    return None


CAPABILITY = Capability(
    name="dates",
    summary="Days between dates, weekday lookups and date offsets (ISO YYYY-MM-DD).",
    examples=(
        "days between 2024-01-01 and 2024-12-31",
        "what day of the week is 2026-12-25",
        "add 30 days to 2026-06-21",
    ),
    solve=solve_datetime,
    priority=140,
)
