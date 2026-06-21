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

The solver also handles quick statistics—ask for the average, mean, or median of a list of numbers:

```bash
python app.py "what is the average of 2, 4, 9?"
```

## Build a focus rhythm

Use rhythm mode to plan a work/break schedule that fits a fixed time window. The plan alternates focus blocks with short breaks (and a longer break every fourth cycle), trims the final block so it never overruns, and always ends on deep work:

```bash
python app.py --rhythm 40                 # 40-minute window, 25/5 default cadence
python app.py --rhythm 90 --work 30 --break 10
```

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.
