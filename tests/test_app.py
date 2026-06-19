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


def test_strategy_plan_maxes_and_ranks_elements():
    solution = app.build_strategy_plan("3 archers, gold mine and barracks")
    assert solution.kind == "Strategy"
    assert "Lv.10" in "\n".join(solution.details)
    # Highest-quantity element should rank first by value.
    assert solution.details[0].startswith("#1 x3 archers")
    assert "ROI" in solution.details[0]
    assert any("Build order follows ROI" in detail for detail in solution.details)


def test_strategy_plan_applies_birthday_buff_by_default():
    buffed = app.build_strategy_plan("castle")
    plain = app.build_strategy_plan("castle", birthday=False)
    assert "Birthday buff active" in buffed.answer
    assert "Birthday buff active" not in plain.answer
    # The buff lifts the maxed value by 50%.
    buffed_value = buffed.details[0]
    plain_value = plain.details[0]
    assert buffed_value != plain_value


def test_strategy_plan_rejects_empty_input():
    try:
        app.build_strategy_plan("   ")
    except ValueError as error:
        assert "optimize" in str(error).lower()
    else:
        raise AssertionError("Expected ValueError for empty strategy input")
