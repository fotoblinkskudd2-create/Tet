# Tet Problem Solver

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

## Usage

Run the solver with your problem statement:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.

## Coding prompt pack for Codex and Claude Code

Pack mode ships a massive library of ready-to-paste prompts tuned for two
coding agents: **Codex** (spec-first, direct) and **Claude Code** (plan-first,
tool-driven). There are 20 categories — scaffold, implement, debug, refactor,
test, review, docs, optimize, security, migrate, explain, ci, git, api,
frontend, database, typing, logging, cleanup, and prototype — for 40 prompts in
total.

```bash
# Every category, for both agents (40 prompts):
python app.py --pack

# One agent + one category, with your own topic woven in:
python app.py --pack --agent claude-code --category debug "login endpoint returns 500"
python app.py --pack --agent codex --category refactor "the payment module"

# All categories for a single agent, seeded with a topic:
python app.py --pack --agent codex "add OAuth login"
```

Flags:

- `--agent {codex,claude-code,both}` — target agent (default `both`).
- `--category <name>` — limit to one category (default: all of them).
- A trailing topic string is optional; when given, it is substituted into every
  prompt so the output is immediately usable.
