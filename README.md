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

## Orakelet med tre stemmer

A small concept forge with a soul. Give it a seed — a word, a thing, a feeling — and three quarreling voices fight their way to an idea none of them would have found alone:

- **Den Forferdelige** sees the collapse → it gives the concept its *stakes*.
- **Den Kjedelige** sees the spreadsheet → it gives the concept its *frame*.
- **Den Gøyale** sees the play → it gives the concept its *spark*.

A concept worth anything needs all three: something at risk, a form to hold it, and a spark that makes it alive.

```bash
python oracle.py "den siste bussen hjem"
python oracle.py "kaffe"
python oracle.py --kaos "tirsdag"      # same seed, new result every time
python oracle.py --rad 3 "ensomhet"    # three concepts in a row
```

Without `--kaos` the forge is deterministic: the same seed always yields the same concept, so magic stays reproducible and shareable.
