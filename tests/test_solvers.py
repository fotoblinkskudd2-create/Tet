"""Behavioural and unit tests for individual solvers."""

from datetime import date

import pytest

import tet
from tet.solvers.arithmetic import UnsafeExpression, format_number, safe_eval
from tet.solvers.numeric import (
    compute_stat,
    int_to_roman,
    render_base,
    roman_to_int,
)
from tet.solvers.temporal import TemporalSolver, days_between, describe_until
from tet.solvers.units import convert


# --------------------------------------------------------------------------- #
# Arithmetic
# --------------------------------------------------------------------------- #

def test_safe_eval_basic_and_precedence():
    assert safe_eval("2 + 3 * 4") == 14
    assert safe_eval("(2 + 3) * 4") == 20


def test_safe_eval_functions_and_constants():
    assert round(safe_eval("sqrt(16)"), 6) == 4
    assert safe_eval("factorial(5)") == 120
    assert round(safe_eval("pi"), 5) == 3.14159


def test_safe_eval_rejects_names_and_calls():
    with pytest.raises(UnsafeExpression):
        safe_eval("__import__('os')")
    with pytest.raises(UnsafeExpression):
        safe_eval("foo + 1")


def test_format_number_whole_vs_fraction():
    assert format_number(14.0) == "14"
    assert format_number(1.41421356) == "1.4142"


def test_caret_is_treated_as_power():
    sol = tet.solve_problem("2 ^ 10")
    assert sol.kind == "Math"
    assert "1024" in sol.answer


def test_prose_is_not_arithmetic():
    sol = tet.solve_problem("save the day")
    assert sol.kind != "Math"


# --------------------------------------------------------------------------- #
# Units
# --------------------------------------------------------------------------- #

def test_convert_length_round_trip():
    miles, family = convert(1.0, "mi", "km")
    assert family == "length"
    assert round(miles, 4) == 1.6093


def test_convert_temperature_affine():
    celsius, family = convert(212.0, "f", "c")
    assert family == "temperature"
    assert round(celsius, 4) == 100.0


def test_convert_rejects_cross_family():
    assert convert(1.0, "kg", "m") is None


def test_units_solver_via_engine():
    sol = tet.solve_problem("convert 5 kg to pounds")
    assert sol.kind == "Units"
    assert "11.0231" in sol.answer or "11.023" in sol.answer


# --------------------------------------------------------------------------- #
# Temporal
# --------------------------------------------------------------------------- #

def test_days_between_signed():
    assert days_between(date(2026, 1, 1), date(2026, 1, 11)) == 10
    assert days_between(date(2026, 1, 11), date(2026, 1, 1)) == -10


def test_describe_until_future_past_today():
    today = date(2026, 6, 21)
    assert "until" in describe_until(date(2026, 12, 25), today)
    assert "since" in describe_until(date(2026, 1, 1), today)
    assert "today" in describe_until(today, today)


def test_temporal_solver_weekday_is_deterministic():
    solver = TemporalSolver(today=date(2026, 6, 21))
    sol = solver.solve("what weekday is 2026-06-21")
    assert "Sunday" in sol.answer


def test_temporal_solver_between():
    solver = TemporalSolver(today=date(2026, 6, 21))
    sol = solver.solve("days between 2026-01-01 and 2026-06-21")
    assert "171" in sol.answer


# --------------------------------------------------------------------------- #
# Numeric: bases, roman, percentage, statistics
# --------------------------------------------------------------------------- #

def test_render_base():
    assert render_base(255, 16) == "0xff"
    assert render_base(5, 2) == "0b101"


def test_base_solver_parses_hex_input():
    sol = tet.solve_problem("convert 0xff to decimal")
    assert sol.kind == "Bases"
    assert "255" in sol.answer


def test_roman_round_trip():
    for value in (1, 4, 9, 40, 90, 2026, 3999):
        assert roman_to_int(int_to_roman(value)) == value


def test_roman_out_of_range():
    with pytest.raises(ValueError):
        int_to_roman(4000)


def test_roman_solver_both_directions():
    assert "MMXXVI" in tet.solve_problem("roman numeral for 2026").answer
    assert "2026" in tet.solve_problem("what is the roman numeral MMXXVI worth").answer


def test_percentage_variants():
    assert "30" in tet.solve_problem("15% of 200").answer
    assert "25" in tet.solve_problem("what percent is 30 of 120").answer
    assert "100" in tet.solve_problem("increase 80 by 25%").answer
    assert "60" in tet.solve_problem("decrease 80 by 25%").answer


def test_statistics_operations():
    assert compute_stat("mean", [2, 4, 6, 8]) == 5
    assert compute_stat("median", [1, 3, 5]) == 3
    assert compute_stat("range", [1, 9]) == 8


def test_statistics_solver_via_engine():
    sol = tet.solve_problem("median of 5 3 8 1 9")
    assert sol.kind == "Statistics"
    assert "5" in sol.answer


def test_stdev_needs_two_values():
    # Single value cannot have a meaningful spread -> falls through.
    sol = tet.solve_problem("stdev of 5")
    assert sol.kind != "Statistics"


# --------------------------------------------------------------------------- #
# Anagram (curated path is host-independent)
# --------------------------------------------------------------------------- #

def test_anagram_curated_match():
    sol = tet.solve_problem("find an anagram of listen")
    assert sol.kind == "Anagram"
    assert "silent" in sol.answer


def test_anagram_unknown_word_is_graceful():
    sol = tet.solve_problem("unscramble zzzzq")
    assert sol.kind == "Anagram"
    assert "jumble" in sol.answer.lower()
