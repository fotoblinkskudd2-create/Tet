"""Tests for the command-line interface."""

import json

import pytest

from tet import cli


def test_default_solve_prints_friendly_text(capsys):
    assert cli.main(["2 + 3 * 4"]) == 0
    out = capsys.readouterr().out
    assert "Math solution ready" in out
    assert "14" in out


def test_json_flag_emits_valid_json(capsys):
    assert cli.main(["--json", "15% of 200"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["kind"] == "Percent"
    assert payload["source"] == "percentage"


def test_all_flag_lists_ranked_candidates(capsys):
    assert cli.main(["--all", "25% of 80"]) == 0
    out = capsys.readouterr().out
    assert "[1] percentage" in out
    assert "brainstorm" in out


def test_all_flag_json(capsys):
    assert cli.main(["--all", "--json", "25% of 80"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert isinstance(payload, list)
    assert payload[0]["source"] == "percentage"


def test_list_flag(capsys):
    assert cli.main(["--list"]) == 0
    out = capsys.readouterr().out
    assert "arithmetic" in out
    assert "panic_support" in out


def test_prompt_mode(capsys):
    assert cli.main(["--prompt", "--medium", "photo", "sunrise over a pier"]) == 0
    out = capsys.readouterr().out
    assert "Photo prompt" in out
    assert "sunrise over a pier" in out


def test_no_args_prints_help(capsys):
    assert cli.main([]) == 0
    out = capsys.readouterr().out
    assert "usage" in out.lower()


def test_version_exits_zero(capsys):
    with pytest.raises(SystemExit) as excinfo:
        cli.main(["--version"])
    assert excinfo.value.code == 0
    assert "tet" in capsys.readouterr().out
