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

## Multidisciplinary workflow system

Use workflow mode to manage a recurring loop across investing, design/art, music/video, hunting, and writing:

```bash
python app.py --workflow plan                                  # weekly rotation across all disciplines
python app.py --workflow daily --day tuesday                   # hour-by-hour template for a weekday
python app.py --workflow research                               # daily cross-domain research sweep
python app.py --workflow research --discipline investing        # one discipline's full research routine
python app.py --workflow synergy --discipline art                # cross-discipline inspiration links
```

The weekly plan gives one discipline the spotlight each weekday (Investing, Design & Art, Music & Video, Writing, Hunting), keeps Saturday as an open flex/synthesis studio, and closes the loop with a Sunday review. Every weekday starts with the same ~75-90 minute research sweep across all five domains before the day's deep-work block. Use `--discipline` (`investing`, `art`, `music_video`, `hunting`, `writing`, or `all`) to drill into one area's research routine, tools, or synergy links with the others.
