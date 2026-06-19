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

## Optimize a game strategy

Use strategy mode to turn a list of units, resources, or buildings into a maxed-out, ROI-ranked build plan. Every element is simulated to its top level, boosted by a synergy multiplier, and (by default) celebrated with a +50% birthday buff:

```bash
python app.py --strategy "3 archers, gold mine and barracks"
python app.py --strategy --no-birthday "town hall, lumber camp, wall"
```

Separate elements with commas, semicolons, `and`/`og`, `+`, `&`, or new lines. Prefix a count (for example `3 archers` or `3x archers`) to scale that element's value. The output lists each element at its maximum level with its final value and ROI, then recommends the fastest-payoff build order.
