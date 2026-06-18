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

## Coding prompt pack for Codex & Claude Code

A massive, curated pack of engineering prompts is built in. Each base prompt is
tuned twice: a surgical, diff-first framing for **Codex** and a plan-first,
verify-with-tools framing for **Claude Code**. Replace the `{{PLACEHOLDERS}}`
with your specifics before pasting into an agent.

```bash
python app.py --list-categories              # see all categories
python app.py --pack                          # every prompt, both agents
python app.py --pack --agent codex            # Codex framing only
python app.py --pack --agent claude-code --category debugging
```

The full pack is also rendered to [`PROMPT_PACK.md`](PROMPT_PACK.md), generated
from the same single source of truth (`prompt_pack.py`):

```bash
python -c "import prompt_pack; open('PROMPT_PACK.md','w').write(prompt_pack.export_markdown())"
```
