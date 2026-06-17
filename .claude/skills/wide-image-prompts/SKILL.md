---
name: wide-image-prompts
description: Use when a user wants a wide, panoramic, or widescreen photo/art prompt instead of the default vertical/mobile framing — covers the --wide flag and _detect_wide_orientation in app.py's creative prompt builder.
---

# Wide Image Prompts

`build_creative_prompt(seed, medium_hint=None, wide=None)` decides orientation in this order:
1. Explicit `wide=True/False` argument (CLI `--wide` flag sets this to `True`).
2. Otherwise, `_detect_wide_orientation(seed)` scans the seed text for keywords in `_WIDE_KEYWORDS` (English + Norwegian: "wide", "panorama", "widescreen", "ultrawide", "bred", "vidvinkel", ...).
3. Default is vertical/mobile framing — unchanged from the original behavior.

Only the `photo` and `art` recipes in `_CREATIVE_RECIPES` carry a `delivery_wide` variant; `video` is already 16:9 by default and `music`/`poem` have no spatial orientation, so passing `wide=True` for those mediums is a harmless no-op.

When asked to make an image prompt "wide", "panoramic", or "cinematic landscape": either mention one of the wide keywords in the seed text, or pass `wide=True` / the `--wide` CLI flag explicitly — don't hand-edit the rendered string.
