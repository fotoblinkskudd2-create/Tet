---
name: panic-support-protocol
description: Use when editing _solve_panic_support in app.py — the grounding/breathing/reality-check protocol triggered by panic-related keywords. Treat changes here carefully since the content is safety-relevant.
---

# Panic Support Protocol

`_solve_panic_support` fires on `panic_markers` (English + Norwegian: "panic", "anxiety attack", "panik", "angst", "heart racing", "kan ikke puste") and returns a fixed, ordered protocol: grounding → breathing → reality checks → body reset → engage attention → medication note → emergency line → aftercare.

Rules when editing this solver:
- Keep the emergency-line detail (`"Emergency line: seek urgent help for..."`) — `tests/test_app.py::test_panic_support_protocol_is_returned_for_panic_prompt` asserts an "emergency" mention exists, and it's the safety-critical escape hatch in the response.
- Keep the exact breathing cadence string (`"4, hold 4, exhale 6"`) or update the matching test assertion in lockstep — the test checks for that literal substring.
- This solver runs before `_solve_anagram`/`_solve_math` order in `solve_problem`'s tuple but after `_solve_math` — check `solve_problem`'s solver tuple if you reorder, since an earlier solver matching first would suppress this one entirely.
- Don't add markers so broad they false-positive on unrelated math/anagram queries (e.g. avoid single common words).
