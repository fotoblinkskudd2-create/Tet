import datetime
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


def test_workflow_plan_resolves_norwegian_day_name():
    solution = app.build_workflow_plan("mandag")
    assert solution.kind == "Workflow"
    assert "aksjer" in solution.answer.lower()
    assert any("tverrfaglig kobling" in detail.lower() for detail in solution.details)


def test_workflow_plan_resolves_english_day_name():
    solution = app.build_workflow_plan("saturday")
    assert "jakt" in solution.answer.lower()


def test_workflow_plan_defaults_to_today():
    today_key = app._WEEKDAY_ORDER[datetime.date.today().weekday()]
    expected_label = app.WEEKLY_WORKFLOW[today_key]["label"]
    solution = app.build_workflow_plan()
    assert solution.answer.startswith(expected_label)


def test_workflow_plan_rejects_unknown_day():
    with pytest.raises(ValueError):
        app.build_workflow_plan("blursday")


def test_weekly_overview_lists_all_seven_disciplines():
    solution = app.build_weekly_overview()
    assert solution.kind == "Weekly Overview"
    assert len(solution.details) == 7
    assert any("musikk" in line.lower() for line in solution.details)


def test_monthly_review_includes_cross_discipline_idea_bank():
    solution = app.build_monthly_review()
    assert solution.kind == "Monthly Review"
    assert any("tverrfaglig idébank" in item.lower() for item in solution.details)
