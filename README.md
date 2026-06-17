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

## Multidisciplinary workflow planner

Use workflow mode to run a recurring daily/weekly/monthly cycle across seven
disciplines (stocks/value investing, art, music, video, writing, hunting,
design), so every field gets dedicated focus without being neglected:

```bash
python app.py --workflow                 # today's plan, auto-detected
python app.py --workflow --day mandag    # plan for a specific day (NO or EN names)
python app.py --week                     # full weekly overview
python app.py --monthly                  # monthly cross-discipline review checklist
```

See [WORKFLOW_SYSTEM.md](WORKFLOW_SYSTEM.md) for the full strategy: the
calendar structure, the per-discipline research routines, and how the
disciplines are designed to cross-pollinate each other.
