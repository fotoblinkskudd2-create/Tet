"""Tests for the searchable knowledge base."""

import tet
from tet.solvers.knowledge import Entry, KnowledgeSolver, score_entry, search


def test_search_ranks_speed_of_light_first():
    results = search("the speed of light")
    assert results
    top, score = results[0]
    assert top.symbol == "c"
    assert score >= 0.9


def test_solve_returns_exact_constant_value():
    sol = tet.solve_problem("what is the speed of light")
    assert sol.kind == "Knowledge"
    assert "299792458" in sol.answer


def test_solve_si_prefix():
    sol = tet.solve_problem("what is the giga prefix")
    assert sol.kind == "Knowledge"
    assert "1000000000" in sol.answer
    assert any("10^9" in d for d in sol.details)


def test_typo_tolerance_on_constant_name():
    # "boltzman" is missing the final n.
    sol = tet.solve_problem("boltzman constant")
    assert sol.kind == "Knowledge"
    assert "Boltzmann" in sol.answer


def test_does_not_hijack_percentage():
    assert tet.solve_problem("15% of 200").kind == "Percent"


def test_unrelated_query_returns_none():
    assert KnowledgeSolver().solve("organize my sock drawer") is None


def test_unit_conversion_not_hijacked():
    assert tet.solve_problem("convert 5 kg to pounds").kind == "Units"


def test_display_value_integer_and_scientific():
    integer_entry = Entry("c", 299792458.0, "m/s", "c", "constant", "x")
    assert integer_entry.display_value() == "299792458"
    tiny = Entry("h", 6.62607015e-34, "J·s", "h", "constant", "x")
    assert "× 10^-34" in tiny.display_value()


def test_score_entry_is_low_for_irrelevant_text():
    entry = search("planck")[0][0]
    assert score_entry("how do I bake bread", entry) < 0.6
