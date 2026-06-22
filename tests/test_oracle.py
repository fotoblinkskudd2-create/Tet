import pytest

import oracle


def test_forge_concept_is_deterministic_without_chaos():
    first = oracle.forge_concept("kaffe")
    second = oracle.forge_concept("kaffe")
    assert first.pitch == second.pitch
    assert first.title == second.title


def test_forge_concept_uses_the_seed():
    concept = oracle.forge_concept("den siste bussen hjem")
    assert "den siste bussen hjem" in concept.pitch.lower()
    assert "den siste bussen hjem" in concept.title.lower()


def test_forge_concept_blends_all_three_voices():
    concept = oracle.forge_concept("ensomhet")
    assert len(concept.voices) == len(oracle.VOICES)
    names = " ".join(concept.voices)
    for voice in oracle.VOICES:
        assert voice.name in names


def test_forge_concept_rejects_empty_seed():
    with pytest.raises(ValueError):
        oracle.forge_concept("   ")


def test_chaos_can_diverge_from_the_deterministic_pitch():
    base = oracle.forge_concept("tirsdag")
    # Med kaos er resultatet tilfeldig; over mange forsøk skal minst ett avvike.
    assert any(
        oracle.forge_concept("tirsdag", chaos=True).pitch != base.pitch
        for _ in range(40)
    )


def test_render_contains_title_and_chorus():
    rendered = oracle.forge_concept("regn").render()
    assert "KORET" in rendered.upper()
    assert "REGN" in rendered.upper()
