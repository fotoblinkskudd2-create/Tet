"""Tests for Grafset smart ideas and agent-powered creative prompts."""

import app


def test_agent_generates_art_prompt_for_grafset_idea():
    """The agent should produce an art prompt for a design-category seed."""
    solution = app.build_creative_prompt(
        "bold social media banner with neon gradients", medium_hint="art"
    )
    assert solution.kind == "Creative Prompt"
    assert "art prompt" in solution.answer.lower()
    assert "bold social media banner" in solution.answer.lower()


def test_agent_generates_video_prompt_for_marketing_idea():
    """A marketing teaser should produce a video prompt with structure cues."""
    solution = app.build_creative_prompt(
        "15 second vertical product teaser for sneaker launch", medium_hint="video"
    )
    assert solution.kind == "Creative Prompt"
    assert "video prompt" in solution.answer.lower()
    assert any("movement" in d.lower() or "frame" in d.lower() for d in solution.details)


def test_agent_generates_music_prompt_for_soundtrack_idea():
    """A soundtrack loop idea should yield a music prompt with BPM notes."""
    solution = app.build_creative_prompt(
        "upbeat lo-fi hip hop loop for cafe ad", medium_hint="music"
    )
    assert "music prompt" in solution.answer.lower()
    assert any("bpm" in d.lower() for d in solution.details)


def test_agent_generates_poem_prompt_for_branding_card():
    """A brand poem card idea should produce a poem prompt with form cues."""
    solution = app.build_creative_prompt(
        "haiku about morning coffee ritual for specialty brand", medium_hint="poem"
    )
    assert "poem prompt" in solution.answer.lower()
    assert any("form" in d.lower() for d in solution.details)


def test_agent_auto_detects_photo_medium():
    """When a seed mentions 'picture', the agent should auto-detect photo."""
    solution = app.build_creative_prompt("a candid picture of street food market at dusk")
    assert "photo prompt" in solution.answer.lower()


def test_all_creative_prompts_include_mobile_note():
    """Every creative prompt should include the iOS mobile-first note."""
    for medium in ("photo", "video", "music", "art", "poem"):
        solution = app.build_creative_prompt("test seed for medium check", medium_hint=medium)
        assert any("mobile" in d.lower() or "ios" in d.lower() for d in solution.details), (
            f"Missing mobile note for medium={medium}"
        )


def test_creative_prompt_rejects_empty_seed():
    """An empty seed should raise a ValueError."""
    try:
        app.build_creative_prompt("")
        assert False, "Expected ValueError for empty seed"
    except ValueError as exc:
        assert "provide" in str(exc).lower()
