"""Comprehensive tests for the extended solver capabilities."""
import math

import pytest

import app
from solver import REGISTRY, solve_problem
from solver.math_eval import safe_math_eval


# --------------------------------------------------------------------------- #
# Scientific math evaluator
# --------------------------------------------------------------------------- #
def test_safe_eval_supports_functions_and_constants():
    assert safe_math_eval("sqrt(16)") == 4.0
    assert math.isclose(safe_math_eval("log(1024, 2)"), 10.0)
    assert math.isclose(safe_math_eval("pi"), math.pi)
    assert safe_math_eval("factorial(5)") == 120.0


def test_safe_eval_rejects_arbitrary_code():
    with pytest.raises((ValueError, SyntaxError)):
        safe_math_eval("__import__('os').system('echo hi')")
    with pytest.raises(ValueError):
        safe_math_eval("open('x')")


def test_math_solution_formats_integers_cleanly():
    solution = solve_problem("10 / 4")
    assert solution.kind == "Math"
    assert "2.5" in solution.answer


# --------------------------------------------------------------------------- #
# Unit conversion
# --------------------------------------------------------------------------- #
@pytest.mark.parametrize(
    "problem, needle",
    [
        ("convert 10 km to miles", "6.213712"),
        ("5 kg in lb", "11.023"),
        ("100 c to f", "212"),
        ("0 c to k", "273.15"),
        ("1 gb in mib", "953.674316"),
    ],
)
def test_unit_conversion(problem, needle):
    solution = solve_problem(problem)
    assert solution.kind == "Unit Conversion"
    assert needle in solution.answer


def test_unit_conversion_rejects_mismatched_categories():
    solution = solve_problem("convert 10 km to kg")
    assert solution.kind == "Unit Conversion"
    assert "can't convert" in solution.answer.lower()


# --------------------------------------------------------------------------- #
# Base conversion & Roman numerals
# --------------------------------------------------------------------------- #
def test_base_conversion_to_binary():
    solution = solve_problem("255 in binary")
    assert solution.kind == "Base Conversion"
    assert "0b11111111" in solution.answer


def test_base_conversion_from_hex_prefix():
    solution = solve_problem("convert 0xff to decimal")
    assert "255" in solution.answer


def test_roman_round_trip():
    forward = solve_problem("roman numeral for 2024")
    assert "MMXXIV" in forward.answer
    backward = solve_problem("what is MMXXIV")
    assert "2024" in backward.answer


def test_roman_does_not_fire_on_pronoun_or_words():
    assert solve_problem("I am tired").kind == "Brainstorm"
    assert solve_problem("mix the batter well").kind == "Brainstorm"


# --------------------------------------------------------------------------- #
# Number theory
# --------------------------------------------------------------------------- #
def test_primality():
    assert "is prime" in solve_problem("is 97 prime").answer
    assert "is not prime" in solve_problem("is 100 prime").answer


def test_factorisation_and_gcd_lcm():
    assert "2^3" in solve_problem("factorize 360").answer
    assert "12" in solve_problem("gcd of 48 and 60").answer
    assert "12" in solve_problem("lcm of 4 and 6").answer


# --------------------------------------------------------------------------- #
# Statistics, percentages, sequences
# --------------------------------------------------------------------------- #
def test_statistics_headlines():
    assert "mean is 18" in solve_problem("mean of 4 8 15 16 23 42").answer.lower()
    assert "median is 2" in solve_problem("median of 3 1 2").answer.lower()


def test_percentages():
    assert "is 30" in solve_problem("what is 15% of 200").answer
    assert "25%" in solve_problem("20 is what percent of 80").answer
    assert "110" in solve_problem("increase 100 by 10%").answer


@pytest.mark.parametrize(
    "problem, nxt",
    [
        ("next number in 2 4 6 8", "10"),
        ("continue 3 6 12 24", "48"),
        ("next in 1 4 9 16", "25"),
    ],
)
def test_sequences(problem, nxt):
    solution = solve_problem(problem)
    assert solution.kind == "Sequence"
    assert nxt in solution.answer


# --------------------------------------------------------------------------- #
# Date math
# --------------------------------------------------------------------------- #
def test_days_between():
    solution = solve_problem("days between 2024-01-01 and 2024-12-31")
    assert "365 days" in solution.answer


def test_weekday_lookup():
    solution = solve_problem("what day of the week is 2026-12-25")
    assert "Friday" in solution.answer


def test_date_offset():
    solution = solve_problem("add 30 days to 2026-06-21")
    assert "2026-07-21" in solution.answer


# --------------------------------------------------------------------------- #
# Text utilities
# --------------------------------------------------------------------------- #
def test_reverse_and_palindrome():
    assert "dlrow olleh" in solve_problem("reverse hello world").answer
    assert "is a palindrome" in solve_problem("is racecar a palindrome").answer
    assert "is not a palindrome" in solve_problem("is python a palindrome").answer


def test_word_count():
    solution = solve_problem("count words in the quick brown fox")
    assert "4 words" in solution.answer


# --------------------------------------------------------------------------- #
# Engine-level behaviour
# --------------------------------------------------------------------------- #
def test_registry_is_priority_sorted():
    priorities = [c.priority for c in REGISTRY.ordered()]
    assert priorities == sorted(priorities)
    # Panic support must outrank everything for safety.
    assert REGISTRY.ordered()[0].name == "panic-support"


def test_panic_still_wins_over_numbers():
    solution = solve_problem("panic attack started after I drank 3 coffees, heart racing")
    assert solution.kind == "Panic Support"


def test_solution_to_dict_is_json_friendly():
    solution = solve_problem("2 + 2")
    payload = solution.to_dict()
    assert payload["kind"] == "Math"
    assert set(payload) == {"kind", "answer", "details", "confidence", "tags"}


def test_cli_json_mode(capsys):
    rc = app.main(["--json", "2 + 2"])
    assert rc == 0
    out = capsys.readouterr().out
    assert '"kind": "Math"' in out


def test_cli_list_mode(capsys):
    rc = app.main(["--list"])
    assert rc == 0
    out = capsys.readouterr().out
    assert "panic-support" in out
    assert "units" in out
