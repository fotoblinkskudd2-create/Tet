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


def test_vibe_code_prompt_structures_a_rough_idea():
    solution = app.build_vibe_code_prompt("a todo list app with drag and drop")
    assert solution.kind == "Vibe Code Prompt"
    assert "todo list app" in solution.answer.lower()
    assert any("scope" in d.lower() for d in solution.details)
    assert any("testing" in d.lower() for d in solution.details)


def test_vibe_code_prompt_detects_web_domain():
    solution = app.build_vibe_code_prompt("a react dashboard for tracking expenses")
    assert solution.kind == "Vibe Code Prompt"
    assert any("web" in d.lower() for d in solution.details)


def test_vibe_code_prompt_detects_cli_domain():
    solution = app.build_vibe_code_prompt("command line tool that renames files in bulk")
    assert solution.kind == "Vibe Code Prompt"
    assert any("cli" in d.lower() for d in solution.details)


def test_vibe_code_prompt_rejects_empty_input():
    try:
        app.build_vibe_code_prompt("")
        assert False, "Expected ValueError"
    except ValueError:
        pass


def test_creative_prompt_handles_code_medium():
    solution = app.build_creative_prompt("a REST API for bookmarks", medium_hint="code")
    assert solution.kind == "Creative Prompt"
    assert "vibe code prompt" in solution.answer.lower()


def test_vibe_flag_via_main(capsys):
    app.main(["--vibe", "a snake game in python"])
    captured = capsys.readouterr()
    assert "vibe code prompt" in captured.out.lower()
    assert "snake game" in captured.out.lower()
