"""Tests for OpenClaw promotion workflow via the creative prompt builder."""

import app


def test_openclaw_promo_art_entry():
    """Simulates promoting an art idea through the agent."""
    solution = app.build_creative_prompt(
        "minimalist logo concept for eco-friendly startup", medium_hint="art"
    )
    assert solution.kind == "Creative Prompt"
    assert "minimalist logo concept" in solution.answer.lower()
    assert any("palette" in d.lower() or "material" in d.lower() for d in solution.details)


def test_openclaw_promo_photo_entry():
    """Simulates promoting a photo idea through the agent."""
    solution = app.build_creative_prompt(
        "overhead flat-lay of artisan bread on wooden board", medium_hint="photo"
    )
    assert "photo prompt" in solution.answer.lower()
    assert any("light" in d.lower() or "lens" in d.lower() for d in solution.details)


def test_openclaw_promo_preserves_seed_in_output():
    """The agent output should always include the original seed text."""
    seed = "retro synthwave poster for music festival"
    solution = app.build_creative_prompt(seed, medium_hint="art")
    assert seed.lower() in solution.answer.lower()


def test_openclaw_promo_format_is_readable():
    """The formatted output should include the banner and details."""
    solution = app.build_creative_prompt(
        "dreamy watercolor sunset over coastal village", medium_hint="art"
    )
    formatted = solution.format()
    assert "creative prompt" in formatted.lower()
    assert "solution ready" in formatted.lower()
    assert "-" in formatted  # bullet points present
