"""Tests for the registry, ranking and the Solution data type."""

import tet
from tet.core import Registry, Solution, Solver


class _Fixed(Solver):
    """A trivial solver that always returns a fixed-confidence solution."""

    def __init__(self, name, confidence, matches=True):
        self.name = name
        self.kind = name.title()
        self._confidence = confidence
        self._matches = matches

    def solve(self, problem):
        if not self._matches:
            return None
        return self.make(f"{self.name}:{problem}", confidence=self._confidence)


class _Boom(Solver):
    name = "boom"

    def solve(self, problem):
        raise RuntimeError("solver exploded")


def test_solution_to_dict_is_json_ready():
    sol = Solution(kind="Math", answer="42", details=["a", "b"], confidence=0.9, source="x")
    data = sol.to_dict()
    assert data == {
        "kind": "Math",
        "answer": "42",
        "details": ["a", "b"],
        "confidence": 0.9,
        "source": "x",
    }


def test_solution_format_includes_banner_and_bullets():
    text = Solution(kind="Units", answer="ok", details=["one"]).format()
    assert "Units solution ready" in text
    assert "- one" in text


def test_registry_ranks_by_confidence():
    reg = Registry()
    reg.register(_Fixed("low", 0.1))
    reg.register(_Fixed("high", 0.9))
    best = reg.best("hi")
    assert best.source == "high"
    ranked = reg.candidates("hi")
    assert [s.source for s in ranked] == ["high", "low"]


def test_registry_tie_breaks_on_registration_order():
    reg = Registry()
    reg.register(_Fixed("first", 0.5))
    reg.register(_Fixed("second", 0.5))
    assert reg.best("x").source == "first"


def test_registry_skips_non_matching_solvers():
    reg = Registry()
    reg.register(_Fixed("nope", 0.9, matches=False))
    assert reg.best("x") is None


def test_registry_isolates_failing_solver():
    reg = Registry()
    reg.register(_Boom())
    reg.register(_Fixed("safe", 0.3))
    # The exploding solver must not sink the query.
    assert reg.best("x").source == "safe"


def test_solve_problem_always_returns_a_solution():
    sol = tet.solve_problem("a thoroughly unmatchable string of whimsy")
    assert sol.kind == "Brainstorm"


def test_candidate_solutions_exposes_ranking():
    candidates = tet.candidate_solutions("25% of 80")
    sources = [c.source for c in candidates]
    assert sources[0] == "percentage"
    assert "brainstorm" in sources
