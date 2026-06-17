---
name: medium-synonym-tuning
description: Use when --medium auto-detection picks the wrong creative medium, or when adding aliases (e.g. "picture", "reel", "haiku") so build_creative_prompt routes seed text correctly in app.py.
---

# Medium Synonym Tuning

`_MEDIUM_SYNONYMS` maps each canonical medium (`photo`, `video`, `music`, `art`, `poem`) to a tuple of aliases. Two functions consume it:

- `_normalize_medium_label` — matches an explicit `--medium` value (exact medium name or alias) case-insensitively.
- `_detect_medium_from_text` — scans the raw seed string for the medium name or any alias as a substring; first matching medium in dict iteration order wins.

If a seed is being mis-detected (e.g. "drawing" claimed by the wrong medium), check for an overlapping alias across mediums first — `_detect_medium_from_text` does a `lowered in alias` substring check, not whole-word matching, so short aliases can false-positive inside unrelated words. Prefer adding a more specific alias over removing an existing one.
