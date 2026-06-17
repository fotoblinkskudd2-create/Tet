---
name: git-commit-style
description: Use when preparing a commit for this repo — clarifies the expected commit message style (why over what, no scope creep) before running git commit.
---

# Git Commit Style

This repo has no `CONTRIBUTING.md` or commit lint config, so follow the general convention: a short imperative subject line describing *why* the change exists, not a restatement of the diff. Example: "Add wide-orientation detection for photo/art prompts" rather than "Update app.py".

Before committing:
- Run the `run-tests` skill's pytest command and confirm it passes.
- Keep unrelated changes (formatting-only edits, unrelated refactors) out of the same commit — this repo is small enough that a mixed commit makes `git log` hard to scan later.
- Only stage the files actually touched for the requested change; avoid `git add -A` in a repo this size where stray local files are easy to accidentally include.
