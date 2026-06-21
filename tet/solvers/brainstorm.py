"""The always-available fallback.

When no specialised solver recognises a problem, Tet still refuses to shrug.
This solver matches everything at a deliberately tiny confidence, so it only
wins when nothing better exists -- and then it offers momentum instead of an
error.
"""

from __future__ import annotations

from typing import Optional

from ..core import Solution, Solver


class BrainstormSolver(Solver):
    name = "brainstorm"
    kind = "Brainstorm"
    description = "Encouraging, structured starting steps for any open problem."

    def solve(self, problem: str) -> Optional[Solution]:
        steps = [
            "Name the goal in one joyful sentence.",
            "List the facts and doodle a tiny diagram.",
            "Break the challenge into two bite-sized steps.",
            "Pick the easiest step and start there—momentum is magic!",
        ]
        answer = (
            f"I don't have a direct solver for: '{problem}'. "
            "But we can still win together!"
        )
        return self.make(answer, steps, confidence=0.02)
