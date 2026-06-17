---
name: creative-prompt-builder
description: Use when working with the --prompt CLI mode in app.py, i.e. build_creative_prompt / _shape_creative_prompt / _CREATIVE_RECIPES — turning a short seed idea into a structured photo/video/music/art/poem prompt.
---

# Creative Prompt Builder

Entry point: `build_creative_prompt(seed, medium_hint=None, wide=None)` in `app.py`.

Flow:
1. `_normalize_medium_label` resolves an explicit `--medium` flag (including synonyms in `_MEDIUM_SYNONYMS`).
2. If no explicit medium, `_detect_medium_from_text` scans the seed for medium keywords; falls back to `"art"`.
3. `_shape_creative_prompt` looks up the medium's recipe in `_CREATIVE_RECIPES` (title/style/structure/platform/delivery/details) and renders the final string.

To add a new medium (e.g. "recipe" or "logo"): add an entry to `_MEDIUM_SYNONYMS` and a matching dict in `_CREATIVE_RECIPES` with the same five keys (`title`, `style`, `structure`, `platform`, `delivery`, `details`) used by every other medium — `_shape_creative_prompt` assumes all keys exist and will `KeyError` otherwise.

See the `wide-image-prompts` skill for the orientation (`wide`/vertical) logic layered on top of the photo and art recipes.
