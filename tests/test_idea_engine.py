"""Tests for the idea generation engine."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from idea_engine import IdeaGenerator, IdeaRanker, ConceptDatabase, CONCEPTS


# ------------------------------------------------------------------ #
#  ConceptDatabase tests
# ------------------------------------------------------------------ #

class TestConceptDatabase:
    def setup_method(self):
        self.db = ConceptDatabase()

    def test_has_enough_concepts(self):
        assert len(self.db.all()) >= 40

    def test_multiple_domains(self):
        assert len(self.db.domains) >= 6

    def test_by_domain_returns_concepts(self):
        tech = self.db.by_domain("technology")
        assert len(tech) >= 3
        assert all(c.domain == "technology" for c in tech)

    def test_by_tag_works(self):
        results = self.db.by_tag("network")
        assert len(results) >= 1

    def test_related_to_excludes_self(self):
        concept = self.db.all()[0]
        related = self.db.related_to(concept, n=5)
        assert concept not in related

    def test_random_concepts_no_repeats(self):
        import random
        rng = random.Random(99)
        picked = self.db.random_concepts(10, rng)
        names = [c.name for c in picked]
        assert len(names) == len(set(names))


# ------------------------------------------------------------------ #
#  IdeaRanker tests
# ------------------------------------------------------------------ #

class TestIdeaRanker:
    def setup_method(self):
        self.ranker = IdeaRanker()

    def test_score_in_range(self):
        score = self.ranker.score("Test Idea", ["network", "distributed"], ["network"], 0.5, "bisociation")
        assert 0.0 <= score.originality <= 1.0
        assert 0.0 <= score.viability <= 1.0
        assert 0.0 <= score.surprise <= 1.0
        assert 0.0 <= score.relevance <= 1.0
        assert 0.0 <= score.combined <= 1.0

    def test_repeated_tags_penalized(self):
        tags = ["network", "distributed", "organic", "hidden"]
        s1 = self.ranker.score("Idea A", tags, ["network"], 0.5, "bisociation")
        s2 = self.ranker.score("Idea B", tags, ["network"], 0.5, "bisociation")
        # Second use of same tag combination should score lower on originality
        assert s2.originality <= s1.originality

    def test_rank_sorts_descending(self):
        from idea_engine.generator import IdeaGenerator
        gen = IdeaGenerator(seed=7)
        ideas = gen.generate("design", n=5)
        scores = [i.score.combined for i in ideas]
        assert scores == sorted(scores, reverse=True)

    def test_deduplicate_removes_near_copies(self):
        from idea_engine.generator import Idea
        from idea_engine.ranker import IdeaScore
        dummy_score = IdeaScore(0.5, 0.5, 0.5, 0.5, 0.5)
        shared_tags = ["network", "distributed", "organic", "hidden"]
        a = Idea("Idea A", "desc", "logic", "use", shared_tags[:], "bisociation", dummy_score)
        b = Idea("Idea B", "desc", "logic", "use", shared_tags[:], "bisociation", dummy_score)
        c = Idea("Idea C", "desc", "logic", "use", ["art", "improvisation", "flow"], "scamper", dummy_score)
        result = self.ranker.deduplicate([a, b, c])
        assert len(result) == 2  # b is a near-duplicate of a


# ------------------------------------------------------------------ #
#  IdeaGenerator tests
# ------------------------------------------------------------------ #

class TestIdeaGenerator:
    def setup_method(self):
        self.gen = IdeaGenerator(seed=123)

    def test_generates_minimum_ideas(self):
        ideas = self.gen.generate("technology", n=5)
        assert len(ideas) >= 5

    def test_all_required_fields_present(self):
        ideas = self.gen.generate("art", n=5)
        for idea in ideas:
            assert idea.title, "title must be non-empty"
            assert idea.description, "description must be non-empty"
            assert idea.logic, "logic must be non-empty"
            assert idea.use_case, "use_case must be non-empty"
            assert isinstance(idea.tags, list)
            assert len(idea.tags) >= 1
            assert idea.score is not None
            assert idea.strategy

    def test_ideas_have_valid_scores(self):
        ideas = self.gen.generate("business", n=5)
        for idea in ideas:
            assert 0.0 <= idea.score.combined <= 1.0
            assert 0.0 <= idea.score.originality <= 1.0
            assert 0.0 <= idea.score.viability <= 1.0

    def test_output_is_not_repetitive(self):
        """Ideas should not all share the same title or description."""
        ideas = self.gen.generate("education", n=8)
        titles = [i.title for i in ideas]
        assert len(set(titles)) == len(titles), "Titles must be unique"

    def test_constraint_injected_in_content(self):
        """Constraint-based generation uses constraint_inversion strategy at least sometimes."""
        # Run multiple times to ensure constraint strategy fires
        found = False
        for seed in range(10):
            gen = IdeaGenerator(seed=seed)
            ideas = gen.generate("healthcare", constraints=["no app required"], n=8)
            strategies = [i.strategy for i in ideas]
            all_text = " ".join(i.description + i.use_case + i.logic for i in ideas).lower()
            if ("no app" in all_text or "constraint" in all_text
                    or "inversion" in all_text or "constraint_inversion" in strategies):
                found = True
                break
        assert found, "Constraint injection should appear across multiple seeds"

    def test_trend_injection_works(self):
        custom_trends = ["quantum cooking", "reverse aging"]
        ideas = self.gen.generate("food", trends=custom_trends, n=8)
        all_text = " ".join(i.title + i.description for i in ideas).lower()
        assert any(t.lower() in all_text for t in custom_trends)

    def test_different_themes_produce_different_ideas(self):
        gen1 = IdeaGenerator(seed=42)
        gen2 = IdeaGenerator(seed=42)
        ideas_tech = gen1.generate("technology", n=5)
        ideas_art = gen2.generate("art", n=5)
        titles_tech = {i.title for i in ideas_tech}
        titles_art = {i.title for i in ideas_art}
        # They must not be identical sets
        assert titles_tech != titles_art

    def test_domain_filter_works(self):
        ideas = self.gen.generate("nature", domain="nature", n=5)
        assert len(ideas) >= 3

    def test_ideas_are_thought_provoking(self):
        """Ideas should be more than one sentence in description."""
        ideas = self.gen.generate("design", n=5)
        for idea in ideas:
            assert len(idea.description) > 80, f"Description too short: {idea.description}"

    def test_n_parameter_respected(self):
        ideas = self.gen.generate("science", n=3)
        assert len(ideas) <= 3

    def test_reproducible_with_same_seed(self):
        gen_a = IdeaGenerator(seed=555)
        gen_b = IdeaGenerator(seed=555)
        ideas_a = gen_a.generate("psychology", n=5)
        ideas_b = gen_b.generate("psychology", n=5)
        assert [i.title for i in ideas_a] == [i.title for i in ideas_b]


# ------------------------------------------------------------------ #
#  Integration smoke test
# ------------------------------------------------------------------ #

def test_end_to_end_pipeline():
    gen = IdeaGenerator(seed=0)
    ideas = gen.generate(
        theme="future of work",
        constraints=["remote first", "async"],
        trends=["ambient AI", "de-growth"],
        n=6,
    )
    assert len(ideas) >= 4
    ranked_scores = [i.score.combined for i in ideas]
    assert ranked_scores == sorted(ranked_scores, reverse=True)
    for idea in ideas:
        assert 0 <= idea.score.combined <= 1
