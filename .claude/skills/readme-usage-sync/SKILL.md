---
name: readme-usage-sync
description: Use after changing app.py's CLI flags or behavior — keeps README.md's "Usage" and "Build creative prompts for iOS web" example commands in sync with the actual argparse interface.
---

# README Usage Sync

`README.md` documents two usage modes that mirror `_build_parser` in `app.py`:
- Plain solver mode: `python app.py "<problem>"`.
- Prompt mode: `python app.py --prompt --medium <medium> "<seed>"`, with medium auto-detection when `--medium` is omitted.

Whenever you add, rename, or remove an argparse argument (`--prompt`, `--medium`, `--wide`, etc.), update the matching README example in the same change. Stale README examples are easy to miss because nothing fails CI for them — there's no doctest running the README snippets, so this has to be done by hand, not assumed correct.
