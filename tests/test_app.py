import re

import app
import prompt_pack


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


def test_prompt_pack_build_single_prompt_injects_topic():
    prompt = prompt_pack.build_prompt("codex", "refactor", "the payment module")
    assert "the payment module" in prompt
    assert "Refactor" in prompt
    assert "Guidance:" in prompt


def test_prompt_pack_normalizes_agent_aliases():
    assert prompt_pack.normalize_agent("openai") == "codex"
    assert prompt_pack.normalize_agent("Claude Code") == "claude-code"
    assert prompt_pack.normalize_agent("cc") == "claude-code"
    assert prompt_pack.normalize_agent("nope") is None


def test_prompt_pack_both_agents_covers_every_category():
    pack = prompt_pack.build_prompt_pack(agent="both")
    expected = len(prompt_pack.category_keys()) * len(prompt_pack.AGENTS)
    assert len(pack.entries) == expected
    rendered = pack.format()
    assert "Codex" in rendered
    assert "Claude Code" in rendered


def test_prompt_pack_filters_by_category_and_agent():
    pack = prompt_pack.build_prompt_pack(
        agent="claude-code", category="debug", topic="the flaky test"
    )
    assert len(pack.entries) == 1
    agent, category, _title, prompt = pack.entries[0]
    assert agent == "claude-code"
    assert category == "debug"
    assert "the flaky test" in prompt


def test_prompt_pack_rejects_unknown_inputs():
    import pytest

    with pytest.raises(ValueError):
        prompt_pack.build_prompt("ghost-agent", "debug")
    with pytest.raises(ValueError):
        prompt_pack.build_prompt_pack(category="does-not-exist")


def test_prompt_pack_cli_mode_runs(capsys):
    exit_code = app.main(["--pack", "--agent", "codex", "--category", "test"])
    assert exit_code == 0
    out = capsys.readouterr().out
    assert "Prompt pack ready" in out
    assert "Codex" in out
