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


def test_stats_solver_reports_mean_and_median():
    solution = app.solve_problem("what is the average of 2, 4, 9?")
    assert solution.kind == "Stats"
    assert "mean is 5" in solution.answer
    assert "median is 4" in solution.answer


def test_focus_rhythm_fits_window_and_ends_on_work():
    solution = app.build_focus_rhythm(60, work_minutes=25, break_minutes=5)
    assert solution.kind == "Focus Rhythm"
    # Two 25-min focus blocks plus a 5-min break = 55 min, ending on work.
    work_blocks = [d for d in solution.details if "Focus block" in d]
    assert len(work_blocks) == 2
    assert solution.details[-2].startswith("0:30–0:55  Focus block 2")


def test_focus_rhythm_never_exceeds_total_minutes():
    solution = app.build_focus_rhythm(40, work_minutes=25, break_minutes=5)
    # 25 work + 5 break + 10 trimmed work = 40 min exactly.
    assert "0:40 focus rhythm" in solution.answer
    assert any("0:30–0:40  Focus block 2 — deep work (10 min)" in d for d in solution.details)


def test_focus_rhythm_rejects_non_positive_window():
    import pytest

    with pytest.raises(ValueError):
        app.build_focus_rhythm(0)


def test_panic_support_protocol_is_returned_for_panic_prompt():
    solution = app.solve_problem("I think I am having a panic attack and my heart is racing")
    assert solution.kind == "Panic Support"
    assert "you are safe" in solution.answer.lower()
    assert any("4, hold 4, exhale 6" in detail for detail in solution.details)
    assert any("emergency" in detail.lower() for detail in solution.details)
