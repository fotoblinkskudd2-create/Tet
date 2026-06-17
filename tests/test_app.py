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


def test_creative_prompt_detects_wide_from_text():
    solution = app.build_creative_prompt(
        "wide panorama of a mountain range at sunset", medium_hint="photo"
    )
    assert "21:9" in solution.answer or "16:9" in solution.answer
    assert "vertical" not in solution.answer.lower()
    assert any("horizontal sweep" in detail.lower() for detail in solution.details)


def test_creative_prompt_wide_flag_forces_wide_framing():
    solution = app.build_creative_prompt("a curious cat", medium_hint="photo", wide=True)
    assert "panoramic" in solution.answer.lower() or "16:9" in solution.answer
    assert "vertical" not in solution.answer.lower()


def test_creative_prompt_defaults_to_vertical_without_wide_cues():
    solution = app.build_creative_prompt("a curious cat napping", medium_hint="photo")
    assert "vertical orientation" in solution.answer.lower()


def test_panic_support_protocol_is_returned_for_panic_prompt():
    solution = app.solve_problem("I think I am having a panic attack and my heart is racing")
    assert solution.kind == "Panic Support"
    assert "you are safe" in solution.answer.lower()
    assert any("4, hold 4, exhale 6" in detail for detail in solution.details)
    assert any("emergency" in detail.lower() for detail in solution.details)
