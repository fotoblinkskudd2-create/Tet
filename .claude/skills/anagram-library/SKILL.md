---
name: anagram-library
description: Use when adding new word entries to the anagram solver in app.py (_ANAGRAM_LIBRARY) or debugging why _solve_anagram fails to match a known word.
---

# Anagram Library

`_ANAGRAM_LIBRARY` in `app.py` maps a source word to a tuple of its known anagram buddies. `_solve_anagram` matches by sorted-letter signature (`canonical`), not by exact source word, so a query like "anagram of enlist" still finds the "listen" entry.

To add a word:
1. Add `"source": ("buddy1", "buddy2"),` to `_ANAGRAM_LIBRARY`.
2. Keep entries lowercase — matching is done on `.lower()` input but the dict keys are compared as-is via `sorted()`, so a mixed-case key would never match.
3. Add a test asserting `app.solve_problem("unscramble an anagram of <word>")` returns the expected buddy.

If a query isn't matching, check the regex in `_solve_anagram`: it only fires on `anagram of <word>` or `unscramble <word>` phrasing.
