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

## Spark ideas when you're stuck

Completely out of ideas? Idea mode takes any topic and breaks the block with concrete angles drawn from proven brainstorming lenses (simplify, combine, automate, teach, flip, niche, productize, constrain). Each idea comes with a first step so you can start immediately:

```bash
python app.py --ideas "a weekend side project"
python app.py --ideas --count 8 "ways to make my photography stand out"
```

Use `--count` to ask for more angles; once the lenses are exhausted they cycle so you always get exactly as many ideas as you request.

## Simulate savings growth

See how money grows over time with monthly deposits and compound interest (compounded monthly). Handy for planning, e.g. setting aside what you earn from photography:

```bash
python app.py --simulate --start 1000 --monthly 500 --rate 4 --years 10
```

| Flag | Meaning |
|------|---------|
| `--start` | Starting amount (kr) |
| `--monthly` | Amount you add each month (kr) |
| `--rate` | Annual interest rate in percent |
| `--years` | How many years to project |

The output shows a year-by-year balance plus how much of it is interest working for you.
