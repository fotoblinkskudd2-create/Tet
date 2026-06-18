import app
import prompt_pack


def test_library_is_massive_and_well_formed():
    assert len(prompt_pack.PROMPT_LIBRARY) >= 30
    ids = [p.id for p in prompt_pack.PROMPT_LIBRARY]
    assert len(ids) == len(set(ids))  # ids are unique
    for prompt in prompt_pack.PROMPT_LIBRARY:
        assert prompt.title and prompt.body and prompt.category
        assert prompt.agents  # every prompt targets at least one agent


def test_every_prompt_targets_a_known_agent():
    known = set(prompt_pack.AGENT_PROFILES)
    for prompt in prompt_pack.PROMPT_LIBRARY:
        assert set(prompt.agents) <= known


def test_resolve_agent_aliases():
    assert prompt_pack.resolve_agent("openai") == "codex"
    assert prompt_pack.resolve_agent("Claude") == "claude-code"
    assert prompt_pack.resolve_agent("CC") == "claude-code"
    assert prompt_pack.resolve_agent("nonsense") is None


def test_render_prompt_includes_agent_framing():
    prompt = prompt_pack.PROMPT_LIBRARY[0]
    rendered = prompt_pack.render_prompt(prompt, "codex")
    assert "Codex" in rendered
    assert "Task:" in rendered
    assert "Working style:" in rendered


def test_iter_prompts_filters_by_agent_and_category():
    codex_only = prompt_pack.iter_prompts(agent="codex")
    assert codex_only
    assert all("codex" in p.agents for p in codex_only)

    category = prompt_pack.categories()[0]
    filtered = prompt_pack.iter_prompts(category=category)
    assert filtered
    assert all(p.category == category for p in filtered)


def test_export_markdown_covers_all_categories():
    md = prompt_pack.export_markdown()
    assert md.startswith("# Massive Prompt Pack")
    for category in prompt_pack.categories():
        assert f"## {category}" in md
    assert "Codex" in md and "Claude Code" in md


def test_cli_pack_outputs_both_agents(capsys):
    exit_code = app.main(["--pack"])
    out = capsys.readouterr().out
    assert exit_code == 0
    assert "[Codex]" in out
    assert "[Claude Code]" in out


def test_cli_pack_filters_to_single_agent(capsys):
    exit_code = app.main(["--pack", "--agent", "codex"])
    out = capsys.readouterr().out
    assert exit_code == 0
    assert "[Codex]" in out
    assert "[Claude Code]" not in out


def test_cli_pack_rejects_unknown_category(capsys):
    exit_code = app.main(["--pack", "--category", "does-not-exist"])
    out = capsys.readouterr().out
    assert exit_code == 1
    assert "Unknown category" in out


def test_cli_list_categories(capsys):
    exit_code = app.main(["--list-categories"])
    out = capsys.readouterr().out
    assert exit_code == 0
    for category in prompt_pack.categories():
        assert category in out
