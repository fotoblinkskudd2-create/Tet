import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

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


def test_prompt_pack_covers_modalities():
    prompt_pack = app.build_prompt_pack("enchanted forest sunrise")
    assert prompt_pack.kind == "Prompt Pack"
    assert "enchanted forest sunrise" in prompt_pack.answer

    detail_blob = "\n".join(prompt_pack.details or [])
    for label in ("Photo", "Video", "Music", "Art", "Poem"):
        assert label.lower() in detail_blob.lower()
