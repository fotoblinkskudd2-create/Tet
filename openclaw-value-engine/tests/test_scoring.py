from src.scorer import score_idea, score_ideas


def make_idea(**overrides):
    idea = {
        "name": "Test idé",
        "category": "vannlekkasje",
        "problem": "Et problem",
        "who_pays": "En kunde",
        "first_deliverable": "En rapport",
        "technical_difficulty": 5,
        "market_value": 5,
        "buildability": 5,
        "documentation_value": 5,
        "risk": 5,
    }
    idea.update(overrides)
    return idea


def test_score_is_within_bounds():
    scored = score_idea(make_idea())
    assert 0 <= scored["total_score"] <= 100


def test_best_case_scores_near_100():
    idea = make_idea(
        market_value=10, buildability=10, documentation_value=10,
        technical_difficulty=1, risk=1,
    )
    scored = score_idea(idea)
    assert scored["total_score"] >= 95
    assert scored["recommendation"] == "PASS"


def test_worst_case_scores_near_0():
    idea = make_idea(
        market_value=1, buildability=1, documentation_value=1,
        technical_difficulty=10, risk=10,
    )
    scored = score_idea(idea)
    # Inputs are scored 1-10 (never 0), so the theoretical floor is 10, not 0.
    assert scored["total_score"] <= 10
    assert scored["recommendation"] == "BLOCK"


def test_recommendation_thresholds():
    pass_idea = score_idea(make_idea(market_value=9, buildability=9, documentation_value=8,
                                      technical_difficulty=2, risk=2))
    rework_idea = score_idea(make_idea(market_value=5, buildability=5, documentation_value=5,
                                        technical_difficulty=5, risk=5))
    block_idea = score_idea(make_idea(market_value=2, buildability=2, documentation_value=2,
                                       technical_difficulty=9, risk=9))
    assert pass_idea["recommendation"] == "PASS"
    assert rework_idea["recommendation"] == "REWORK"
    assert block_idea["recommendation"] == "BLOCK"


def test_explanation_mentions_total_score():
    scored = score_idea(make_idea())
    assert str(scored["total_score"]) in scored["explanation"]
    assert scored["recommendation"] in scored["explanation"]


def test_next_action_references_payer_and_deliverable():
    scored = score_idea(make_idea(who_pays="Kommunen", first_deliverable="En pitch"))
    assert "Kommunen" in scored["next_action"]
    assert "En pitch" in scored["next_action"]


def test_score_ideas_sorts_descending():
    weak = make_idea(name="Svak", market_value=1, buildability=1, documentation_value=1,
                      technical_difficulty=10, risk=10)
    strong = make_idea(name="Sterk", market_value=10, buildability=10, documentation_value=10,
                        technical_difficulty=1, risk=1)
    scored = score_ideas([weak, strong])
    assert scored[0]["name"] == "Sterk"
    assert scored[0]["total_score"] >= scored[1]["total_score"]
