---
name: changelog-draft
description: Use when the user asks for a changelog entry or summary of recent app.py changes — this repo has no CHANGELOG.md, so draft entries inline in the PR/commit description instead of creating a new file.
---

# Changelog Draft

This repo doesn't maintain a `CHANGELOG.md`. When asked to summarize changes for a release or PR:

- Group by user-visible behavior, not by file: "Added wide/panoramic photo and art prompts" rather than "Modified app.py".
- Mention new CLI flags explicitly (e.g. `--wide`) since those are the part users interact with directly.
- Don't create a new `CHANGELOG.md` file unless the user explicitly asks for one — this project's history lives in `git log` and PR descriptions.
