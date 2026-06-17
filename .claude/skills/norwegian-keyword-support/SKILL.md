---
name: norwegian-keyword-support
description: Use when adding or auditing Norwegian-language keyword detection in app.py (e.g. panic markers "panik"/"angst"/"kan ikke puste", or wide-orientation keywords "bred"/"vidvinkel") since the solver matches mix English and Norwegian terms.
---

# Norwegian Keyword Support

This codebase mixes English and Norwegian keyword lists in a few places — `_solve_panic_support`'s `panic_markers` already includes `"panik"`, `"angst"`, `"kan ikke puste"` alongside the English terms, and the wide-orientation detector follows the same pattern with `"bred"`/`"vidvinkel"`.

When adding Norwegian terms to any keyword tuple:
- Match on lowercase substrings the same way the existing English terms do — don't introduce a separate language-detection branch; the existing pattern is "one flat tuple of markers across both languages," which is what `solve_problem` and the orientation detector both expect.
- Be careful with short Norwegian words that are common substrings of unrelated words (e.g. avoid a bare 2-3 letter marker) — the matching is substring-based, not whole-word, so over-short markers cause false positives the same way English ones would.
- Add a regression test with the Norwegian phrasing specifically, not just the English equivalent — the two code paths are literally different string comparisons and one passing doesn't guarantee the other does.
