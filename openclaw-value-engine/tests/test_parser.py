import pytest

from src.parser import IdeaParseError, parse_ideas_text

VALID_IDEA = """
## Idea: Eksempelidé
Kategori: vannlekkasje
Problem: Et tydelig problem.
Hvem betaler: En kommune
Første salgbare leveranse: En rapport
Teknisk vanskelighet: 5
Markedsverdi: 7
Byggbarhet: 6
Dokumentasjonsverdi: 6
Risiko: 4
"""


def test_parses_valid_idea():
    ideas = parse_ideas_text(VALID_IDEA)
    assert len(ideas) == 1
    idea = ideas[0]
    assert idea["name"] == "Eksempelidé"
    assert idea["category"] == "vannlekkasje"
    assert idea["market_value"] == 7
    assert isinstance(idea["market_value"], int)


def test_missing_who_pays_raises():
    broken = VALID_IDEA.replace("Hvem betaler: En kommune\n", "")
    with pytest.raises(IdeaParseError) as exc_info:
        parse_ideas_text(broken)
    assert "who_pays" in str(exc_info.value)


def test_missing_first_deliverable_raises():
    broken = VALID_IDEA.replace("Første salgbare leveranse: En rapport\n", "")
    with pytest.raises(IdeaParseError) as exc_info:
        parse_ideas_text(broken)
    assert "first_deliverable" in str(exc_info.value)


def test_out_of_range_score_raises():
    broken = VALID_IDEA.replace("Markedsverdi: 7", "Markedsverdi: 99")
    with pytest.raises(IdeaParseError):
        parse_ideas_text(broken)


def test_parses_multiple_ideas():
    text = VALID_IDEA + "\n" + VALID_IDEA.replace("Eksempelidé", "Andre idé")
    ideas = parse_ideas_text(text)
    assert len(ideas) == 2
    assert {idea["name"] for idea in ideas} == {"Eksempelidé", "Andre idé"}


def test_sample_ideas_file_is_valid():
    from src.parser import parse_ideas_file
    import os

    path = os.path.join(os.path.dirname(__file__), "..", "inputs", "sample_ideas.md")
    ideas = parse_ideas_file(path)
    assert len(ideas) >= 25
    categories = {idea["category"] for idea in ideas}
    assert len(categories) >= 10
    for idea in ideas:
        assert idea["who_pays"].strip()
        assert idea["first_deliverable"].strip()
