import re

import app
import biomimetic


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


def test_biomimetic_catalog_has_ten_ideas():
    ideas = biomimetic.list_ideas()
    assert len(ideas) == 10
    assert {idea.name for idea in ideas} >= {"IsKlo", "MusselSeal", "SealSpine"}


def test_get_idea_supports_case_insensitive_and_partial_match():
    assert biomimetic.get_idea("isklo").name == "IsKlo"
    assert biomimetic.get_idea("Kavitasjons").name == "KavitasjonsSkjold"
    assert biomimetic.get_idea("nonexistent") is None


def test_build_prototype_produces_phased_testable_brief():
    idea = biomimetic.get_idea("MusselSeal")
    spec = biomimetic.build_prototype(idea)
    assert spec.phases, "prototype should define build phases"
    assert spec.bill_of_materials == idea.subsystems
    # Target specs are carried through into acceptance criteria.
    assert all(target in spec.acceptance_criteria for target in idea.target_specs)
    rendered = spec.format()
    assert "MusselSeal" in rendered
    assert "Acceptance criteria:" in rendered


def test_build_all_prototypes_covers_every_idea():
    specs = biomimetic.build_all_prototypes()
    assert len(specs) == len(biomimetic.list_ideas())


def test_cli_prototype_mode_renders_named_brief():
    assert app.main(["--prototype", "IsKlo"]) == 0


def test_cli_list_ideas_mode_runs():
    assert app.main(["--list-ideas"]) == 0
