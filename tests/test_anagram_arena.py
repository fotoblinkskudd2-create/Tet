import random

import anagram_arena as arena


def test_canonical_groups_anagrams():
    assert arena.canonical("listen") == arena.canonical("silent")
    assert arena.canonical("Angel") == arena.canonical("glean")


def test_can_form_from_pot_respects_letter_counts():
    assert arena.can_form_from_pot("tea", "lateen")
    # only one 'e' available, but the word needs two
    assert not arena.can_form_from_pot("tee", "late")
    assert not arena.can_form_from_pot("zoo", "late")


def test_score_word_is_length_squared():
    assert arena.score_word("cat") == 9
    assert arena.score_word("plane") == 25
    assert arena.score_word("kitchen") == 49


def test_make_pot_is_deterministic_and_real():
    words = arena._load_words()
    rng = random.Random(42)
    pot = arena.make_pot(words, 5, rng=rng)
    assert len(pot) == 5
    # the pot is built from a real word, so its signature is a known word's signature
    signatures = {arena.canonical(w) for w in words if len(w) == 5}
    assert arena.canonical(pot) in signatures


def test_evaluate_guess_accepts_valid_word():
    words = {"tea", "eat", "ate"}
    accepted, reason = arena.evaluate_guess("eat", "aet", words, set())
    assert accepted
    assert reason == "valid"


def test_evaluate_guess_rejects_short_and_duplicate_and_unknown():
    words = {"tea", "eat"}
    too_short, _ = arena.evaluate_guess("at", "aet", words, set())
    duplicate, _ = arena.evaluate_guess("eat", "aet", words, {"eat"})
    not_a_word, _ = arena.evaluate_guess("ttt", "ttt", words, set())
    not_in_pot, _ = arena.evaluate_guess("tea", "xyz", words, set())
    assert not too_short
    assert not duplicate
    assert not not_a_word
    assert not not_in_pot


def test_highscore_round_trip(tmp_path):
    path = tmp_path / "score.json"
    assert arena.load_highscore(path) == 0
    arena.save_highscore(123, path)
    assert arena.load_highscore(path) == 123
