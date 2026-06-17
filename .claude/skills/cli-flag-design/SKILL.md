---
name: cli-flag-design
description: Use when adding a new argparse flag to app.py's _build_parser — keeps new flags consistent with existing conventions (boolean store_true flags, choices-constrained value flags, REMAINDER positional).
---

# CLI Flag Design

`_build_parser` in `app.py` follows two flag shapes:
- Boolean toggles (`--prompt`, `--wide`): `action="store_true"`, default `False`, read in `main` as a plain truthy check.
- Constrained value flags (`--medium`): `choices=[...]` including an `"auto"` default, normalized later by a helper (`_normalize_medium_label`) rather than in argparse itself.

The trailing `problem` argument uses `nargs=argparse.REMAINDER` and is joined with `" ".join(args.problem)` in `main` — this lets users skip quoting multi-word problems after flags, but it means any new flag must be added to `_build_parser` *before* relying on positional capture, since REMAINDER swallows everything after the first unrecognized token.

When a new boolean flag should be "auto-detect unless explicitly forced" (like `--wide`), don't use `store_true` defaulting to `False` and treat that as "not requested" — in `main`, translate `False` to `None` before passing to the underlying function so auto-detection still runs when the user didn't pass the flag.
