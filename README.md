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

## Biomimetic product factory

Turn the OpenClaw idea list into structured, build-ready prototype briefs. Each
of the 10 ideas couples a biological mechanism to a subsea / arctic engineering
problem, with subsystems, a phased build path, and measurable acceptance
criteria mirrored from the Grovjobb Navigator requirements.

```bash
python app.py --list-ideas                 # scan the 10 concepts
python app.py --prototype IsKlo            # expand one into a build brief
python app.py --prototype                  # expand every idea
```

Lookup is case-insensitive and accepts partial names (e.g. `--prototype mussel`).
The catalog lives in `biomimetic.py`.
