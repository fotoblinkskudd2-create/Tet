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

## Bergen Dream Orchestrator

Run a full, weather-aware creative day for Bergen in one command. Unlike a
hand-typed run, every item is actually generated — no "the rest are
variations" placeholders. Output is seeded from the date, so the same day is
reproducible while a different `--seed` forks an alternate version.

```bash
python app.py --bergen                       # full run: 50 video + 60 image prompts, poems, inventions
python app.py --bergen --summary             # compact, mobile-friendly overview
python app.py --bergen --section video       # only the video prompts
python app.py --bergen --weather osregn      # force a weather archetype
python app.py --bergen --seed myday-2 --videos 80 --images 90
```

Each run includes:

- A weather archetype (regnbyger, osregn, take, opphold, sol, vind) and the mood it invites.
- A time-blocked creative day plan that adapts to the weather.
- Fully unique, combinatorially generated video and image prompts (Midjourney/Flux-ready).
- A batch of Norwegian Bergen poems with varied composition.
- Concrete inventions, each with a benefit and a next step.

Sections: `all`, `plan`, `dreams`, `video`, `image`, `poems`, `inventions`.
