"""Tests for the intelligent did-you-mean dispatch."""

import tet
from tet.intelligence import rank_intents, suggestions


def test_suggestions_recover_from_typo():
    lines = suggestions("covert kilometers please")
    assert any("convert 10 km to miles" in line for line in lines)


def test_rank_intents_detects_statistics():
    ranked = rank_intents("please compute the median value")
    assert ranked
    assert ranked[0][0].solver == "statistics"


def test_rank_intents_detects_arithmetic_words():
    ranked = rank_intents("multiply these two numbers")
    assert any(s.solver == "arithmetic" for s, _ in ranked)


def test_empty_input_has_no_suggestions():
    assert suggestions("") == []


def test_unmatched_query_keeps_brainstorm_but_adds_hint():
    # No solver matches, but the intent (a constant lookup) is inferable.
    sol = tet.solve_problem("could you covert kilometers somehow")
    assert sol.kind == "Brainstorm"
    assert any("Did you mean" in d for d in sol.details)
    # The joyful guidance must still be present.
    assert any("joyful" in d for d in sol.details)


def test_truly_unmatchable_stays_clean():
    sol = tet.solve_problem("How do I organize my sock drawer?")
    assert sol.kind == "Brainstorm"
    assert not any("Did you mean" in d for d in sol.details)
