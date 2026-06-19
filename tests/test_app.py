import re

import app


def test_math_solver_handles_basic_expression():
    solution = app.solve_problem("2 + 3 * 4")
    assert solution.kind == "Math"
    assert "14" in solution.answer


def test_anagram_solver_finds_known_match():
    solution = app.solve_problem("Please find an anagram of listen")
    assert solution.kind == "Anagram"
    assert "silent" in solution.answer


def test_brainstorm_fallback_is_upbeat():
    solution = app.solve_problem("How do I organize my sock drawer?")
    assert solution.kind == "Brainstorm"
    assert re.search(r"win together", solution.answer)
    assert any("joyful" in step for step in solution.details)


def test_creative_prompt_handles_photo_medium():
    solution = app.build_creative_prompt("sunrise over a wooden pier", medium_hint="photo")
    assert solution.kind == "Creative Prompt"
    assert "photo prompt" in solution.answer.lower()
    assert "sunrise over a wooden pier" in solution.answer.lower()
    assert any("light" in detail.lower() for detail in solution.details)


def test_creative_prompt_auto_detects_poem():
    solution = app.build_creative_prompt("poem about autumn rain and neon reflections")
    assert "poem prompt" in solution.answer.lower()
    assert any("form" in detail.lower() for detail in solution.details)


def test_panic_support_protocol_is_returned_for_panic_prompt():
    solution = app.solve_problem("I think I am having a panic attack and my heart is racing")
    assert solution.kind == "Panic Support"
    assert "you are safe" in solution.answer.lower()
    assert any("4, hold 4, exhale 6" in detail for detail in solution.details)
    assert any("emergency" in detail.lower() for detail in solution.details)


def test_decision_oracle_extracts_both_options():
    solution = app.build_decision_oracle("Should I take the new job or stay where I am?")
    assert solution.kind == "Decision Oracle"
    joined = " ".join(solution.details).lower()
    assert "take the new job" in joined
    assert "stay where i am" in joined


def test_decision_oracle_applies_mental_models():
    solution = app.build_decision_oracle("Should I learn Spanish or learn French?")
    joined = " ".join(solution.details).lower()
    assert "regret" in joined
    assert "premortem" in joined
    assert "10/10/10" in " ".join(solution.details)


def test_decision_oracle_flags_sunk_cost_trap():
    solution = app.build_decision_oracle(
        "Should I keep going with this degree or quit? I've already invested three years."
    )
    assert any("sunk-cost trap" in detail.lower() for detail in solution.details)


def test_decision_oracle_detects_one_way_door():
    solution = app.build_decision_oracle("Should I quit my job or stay another year?")
    assert "one-way door" in solution.answer.lower()
    assert "buy information" in solution.answer.lower()


def test_decision_oracle_detects_two_way_door():
    solution = app.build_decision_oracle("Should I try the new coffee blend or the usual?")
    assert "two-way door" in solution.answer.lower()


def test_solve_problem_routes_decision_questions():
    solution = app.solve_problem("Should I move to Oslo or stay in Bergen?")
    assert solution.kind == "Decision Oracle"


def test_decision_oracle_requires_input():
    import pytest

    with pytest.raises(ValueError):
        app.build_decision_oracle("   ")
