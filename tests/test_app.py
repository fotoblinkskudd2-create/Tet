import re

import pytest

import app
from app import Solution, _safe_math_eval, build_creative_prompt, solve_problem


# ---------------------------------------------------------------------------
# Solution formatting
# ---------------------------------------------------------------------------

class TestSolutionFormat:
    def test_format_without_details(self):
        s = Solution(kind="Test", answer="hello")
        formatted = s.format()
        assert "Test solution ready" in formatted
        assert "hello" in formatted

    def test_format_with_details(self):
        s = Solution(kind="X", answer="y", details=["a", "b"])
        formatted = s.format()
        assert "- a" in formatted
        assert "- b" in formatted


# ---------------------------------------------------------------------------
# Math solver
# ---------------------------------------------------------------------------

class TestMathSolver:
    def test_basic_expression(self):
        solution = solve_problem("2 + 3 * 4")
        assert solution.kind == "Math"
        assert "14" in solution.answer

    def test_negative_result(self):
        solution = solve_problem("3 - 10")
        assert solution.kind == "Math"
        assert "-7" in solution.answer

    def test_division(self):
        result = _safe_math_eval("10 / 4")
        assert result == 2.5

    def test_floor_division(self):
        result = _safe_math_eval("10 // 3")
        assert result == 3.0

    def test_modulo(self):
        result = _safe_math_eval("17 % 5")
        assert result == 2.0

    def test_unary_negation(self):
        result = _safe_math_eval("-42")
        assert result == -42.0

    def test_pow_within_limit(self):
        result = _safe_math_eval("2 ** 10")
        assert result == 1024.0

    def test_pow_exceeding_exponent_limit_raises(self):
        with pytest.raises(ValueError, match="Exponent too large"):
            _safe_math_eval("2 ** 9999")

    def test_expression_too_long_raises(self):
        expr = "1 + " * 200 + "1"
        with pytest.raises(ValueError, match="too long"):
            _safe_math_eval(expr)

    def test_expression_too_complex_raises(self):
        expr = "(" * 40 + "1" + " + 1)" * 40
        with pytest.raises(ValueError, match="too complex"):
            _safe_math_eval(expr)

    def test_unsupported_node_raises(self):
        with pytest.raises(ValueError, match="Unsupported"):
            _safe_math_eval("__import__('os')")

    def test_empty_string_returns_none(self):
        assert solve_problem("   ").kind == "Brainstorm"


# ---------------------------------------------------------------------------
# Anagram solver
# ---------------------------------------------------------------------------

class TestAnagramSolver:
    def test_finds_known_match(self):
        solution = solve_problem("Please find an anagram of listen")
        assert solution.kind == "Anagram"
        assert "silent" in solution.answer

    def test_unknown_word_falls_back(self):
        solution = solve_problem("anagram of xyzzy")
        assert solution.kind == "Anagram"
        assert "could not find" in solution.answer.lower()

    def test_unscramble_keyword(self):
        solution = solve_problem("unscramble evil")
        assert solution.kind == "Anagram"
        assert "vile" in solution.answer

    def test_case_insensitive(self):
        solution = solve_problem("Anagram of LISTEN")
        assert solution.kind == "Anagram"
        assert "silent" in solution.answer


# ---------------------------------------------------------------------------
# Panic support
# ---------------------------------------------------------------------------

class TestPanicSupport:
    def test_panic_keyword_triggers(self):
        solution = solve_problem("I think I am having a panic attack and my heart is racing")
        assert solution.kind == "Panic Support"
        assert "you are safe" in solution.answer.lower()
        assert any("4, hold 4, exhale 6" in d for d in solution.details)
        assert any("emergency" in d.lower() for d in solution.details)

    def test_heart_racing_triggers(self):
        solution = solve_problem("my heart racing so fast right now")
        assert solution.kind == "Panic Support"

    def test_non_panic_does_not_trigger(self):
        solution = solve_problem("I need help baking a cake")
        assert solution.kind != "Panic Support"


# ---------------------------------------------------------------------------
# Brainstorm fallback
# ---------------------------------------------------------------------------

class TestBrainstormFallback:
    def test_is_upbeat(self):
        solution = solve_problem("How do I organize my sock drawer?")
        assert solution.kind == "Brainstorm"
        assert re.search(r"win together", solution.answer)
        assert any("joyful" in step for step in solution.details)


# ---------------------------------------------------------------------------
# Creative prompt builder
# ---------------------------------------------------------------------------

class TestCreativePromptBuilder:
    def test_photo_medium(self):
        solution = build_creative_prompt("sunrise over a wooden pier", medium_hint="photo")
        assert solution.kind == "Creative Prompt"
        assert "photo prompt" in solution.answer.lower()
        assert "sunrise over a wooden pier" in solution.answer.lower()
        assert any("light" in d.lower() for d in solution.details)

    def test_auto_detects_poem(self):
        solution = build_creative_prompt("poem about autumn rain and neon reflections")
        assert "poem prompt" in solution.answer.lower()
        assert any("form" in d.lower() for d in solution.details)

    def test_auto_detects_video(self):
        solution = build_creative_prompt("a cinematic film of city at dusk")
        assert "video prompt" in solution.answer.lower()

    def test_auto_detects_music(self):
        solution = build_creative_prompt("lo-fi song for studying")
        assert "music prompt" in solution.answer.lower()

    def test_defaults_to_art(self):
        solution = build_creative_prompt("abstract shapes in warm tones")
        assert "art prompt" in solution.answer.lower()

    def test_empty_seed_raises(self):
        with pytest.raises(ValueError, match="provide a few words"):
            build_creative_prompt("")

    def test_whitespace_only_seed_raises(self):
        with pytest.raises(ValueError, match="provide a few words"):
            build_creative_prompt("   ")

    def test_mobile_first_detail_present(self):
        solution = build_creative_prompt("neon forest", medium_hint="art")
        assert any("mobile" in d.lower() for d in solution.details)

    def test_medium_synonym_normalization(self):
        solution = build_creative_prompt("portrait of a cat", medium_hint="picture")
        assert "photo prompt" in solution.answer.lower()


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------

class TestCLI:
    def test_main_no_args_returns_zero(self):
        assert app.main([]) == 0

    def test_main_math(self, capsys):
        app.main(["5 + 5"])
        captured = capsys.readouterr()
        assert "10" in captured.out

    def test_main_prompt_mode(self, capsys):
        app.main(["--prompt", "--medium", "photo", "sunset beach"])
        captured = capsys.readouterr()
        assert "photo prompt" in captured.out.lower()
