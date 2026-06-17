import re

import pytest

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


def test_weekly_plan_covers_all_seven_days():
    solution = app.build_weekly_plan()
    assert solution.kind == "Weekly Plan"
    assert len(solution.details) == 7
    assert any("Monday" in line and "Investing" in line for line in solution.details)
    assert any("Sunday" in line for line in solution.details)


def test_daily_plan_for_weekday_includes_research_sweep_and_focus():
    solution = app.build_daily_plan("tuesday")
    assert solution.kind == "Daily Plan"
    assert "design" in solution.answer.lower() or "art" in solution.answer.lower()
    assert any("Research Sweep" in line for line in solution.details)


def test_daily_plan_for_sunday_is_a_review_template():
    solution = app.build_daily_plan("sunday")
    assert "review" in solution.answer.lower()
    assert any("Rebalance" in line for line in solution.details)


def test_daily_plan_rejects_unknown_day():
    with pytest.raises(ValueError):
        app.build_daily_plan("funday")


def test_research_routine_defaults_to_cross_domain_sweep():
    solution = app.build_research_routine()
    assert solution.kind == "Research Routine"
    assert any("[Investing" in line for line in solution.details)
    assert any("[Hunting" in line for line in solution.details)


def test_research_routine_for_single_discipline_includes_tools():
    solution = app.build_research_routine("writing")
    assert "writing" in solution.answer.lower()
    assert any(line.startswith("Tools:") for line in solution.details)


def test_synergy_brief_links_disciplines():
    solution = app.build_synergy_brief("hunting")
    assert solution.kind == "Synergy Brief"
    assert any("Hunting ->" in line for line in solution.details)
