---
name: ios-mobile-prompt-fit
description: Use when tuning the "platform" or "delivery" copy inside _CREATIVE_RECIPES in app.py — these recipes are explicitly written to paste cleanly into iOS web/Safari text fields.
---

# iOS Mobile Prompt Fit

Every recipe in `_CREATIVE_RECIPES` has a `"platform"` field constraining sentence count and formatting (e.g. "Keep it in two short sentences so it pastes cleanly into iOS web fields", "no markdown symbols"). `_shape_creative_prompt` also appends a fixed closing detail: `"Mobile-first: short sentences, no markdown, ready for iOS web share sheets."`

When editing or adding recipe copy:
- Never introduce markdown syntax (`**bold**`, `# headers`, bullet dashes) inside `style`/`structure`/`platform`/`delivery` strings — they're meant to be pasted as plain text into a mobile input field, not rendered.
- Keep sentence counts close to what each medium's `"platform"` field promises; the field's own wording is the spec, not a suggestion.
- The closing "Mobile-first" detail in `_shape_creative_prompt` is shared across all mediums — change it once, not per-recipe.
