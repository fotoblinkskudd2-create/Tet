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


def test_commitment_post_combines_core_mechanisms():
    solution = app.build_commitment_post(
        "ryddedugnad i parken",
        kind="dugnad",
        when="lørdag kl 10",
        referee="@Kari",
        stake="200 kr til veldedighet",
    )
    assert solution.kind == "Commitment Contract"
    assert "ryddedugnad i parken" in solution.answer
    assert "lørdag kl 10" in solution.answer
    assert "@Kari" in solution.answer
    assert "200 kr til veldedighet" in solution.answer
    assert "sosial kontrakt" in solution.answer.lower()
    assert "Hvis" in solution.answer and "så" in solution.answer
    assert any("referee" in detail.lower() for detail in solution.details)


def test_commitment_post_uses_placeholders_when_optional_fields_missing():
    solution = app.build_commitment_post("kveldstur")
    assert "[dato + klokkeslett]" in solution.answer
    assert "[tagg en venn]" in solution.answer
    assert "offentlig unnskyldning" in solution.answer


def test_commitment_post_requires_activity():
    try:
        app.build_commitment_post("   ")
    except ValueError:
        pass
    else:
        raise AssertionError("Expected ValueError for empty activity")


def test_panic_support_protocol_is_returned_for_panic_prompt():
    solution = app.solve_problem("I think I am having a panic attack and my heart is racing")
    assert solution.kind == "Panic Support"
    assert "you are safe" in solution.answer.lower()
    assert any("4, hold 4, exhale 6" in detail for detail in solution.details)
    assert any("emergency" in detail.lower() for detail in solution.details)
