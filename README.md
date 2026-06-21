# Tet Problem Solver

A tiny, joyful command-line helper that solves a surprising range of everyday
problems — arithmetic, conversions, number theory, statistics, dates, word play
and more — and, when it can't solve something directly, offers upbeat
brainstorming steps to keep the momentum going.

Pure Python standard library, no third-party dependencies, and an extensible
*capability registry* so new skills slot in without touching the engine.

## Quick start

```bash
python app.py "2 + 3 * 4"
python app.py "convert 10 km to miles"
python app.py "is 97 prime"
python app.py --list          # see everything Tet can do
python app.py --repl          # interactive session
```

Each response includes a playful banner, a concise answer, and supporting
bullet points. Add `--json` for machine-readable output.

## Capabilities

| Skill | What it does | Example |
| --- | --- | --- |
| **math** | Safe arithmetic + scientific functions (`sqrt`, `sin`, `log`, `factorial`) and constants (`pi`, `e`, `tau`) | `python app.py "log(1024, 2)"` |
| **units** | Length, mass, volume, time, speed, data and temperature | `python app.py "100 c to f"` |
| **base-conversion** | Binary / octal / decimal / hex, with `0x` `0b` `0o` prefixes | `python app.py "convert 0xff to decimal"` |
| **roman-numerals** | Numbers ↔ Roman numerals | `python app.py "roman numeral for 2024"` |
| **number-theory** | Primality, prime factorisation, gcd, lcm | `python app.py "factorize 360"` |
| **statistics** | Mean, median, mode, sum, range, variance, stdev | `python app.py "mean of 4 8 15 16 23 42"` |
| **percentage** | "% of", "what percent", increase/decrease | `python app.py "what is 15% of 200"` |
| **sequence** | Next term in arithmetic, geometric and quadratic runs | `python app.py "continue 3 6 12 24"` |
| **dates** | Days between dates, weekday lookups, date offsets (ISO `YYYY-MM-DD`) | `python app.py "days between 2024-01-01 and 2024-12-31"` |
| **text** | Reverse, palindrome check, word/char/vowel counts, case | `python app.py "is racecar a palindrome"` |
| **anagram** | Anagrams from a curated word library | `python app.py "anagram of listen"` |
| **panic-support** | A calm, structured grounding/breathing protocol for acute stress | `python app.py "I think I'm having a panic attack"` |

Anything the solver doesn't recognise gets a friendly brainstorming scaffold so
you're never left stuck.

> The panic-support protocol offers grounding, breathing and reality-check
> guidance and always surfaces emergency criteria. It is a helper, **not** a
> substitute for professional or emergency care.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video,
music, art, or poetry. The builder keeps instructions short and mobile-friendly:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise
delivery notes for camera, composition, pacing, instrumentation, or poetic form.

## Output modes

```bash
python app.py --json "2 + 2"   # structured: kind, answer, details, confidence, tags
python app.py --list           # capability index with examples
python app.py --repl           # interactive loop; type 'help' or 'quit'
```

## Architecture

```
solver/
  core.py            # Solution, Capability, Registry
  math_eval.py       # safe scientific expression evaluator
  numbers.py         # base conversion, Roman numerals, number theory
  quant.py           # statistics, percentages, sequences
  units.py           # unit conversion
  datetime_tools.py  # calendar arithmetic
  text_tools.py      # anagrams + text utilities
  creative.py        # creative-prompt builder
  wellbeing.py       # panic-support protocol
  cli.py             # argparse front-end (text / JSON / list / REPL)
app.py               # thin, backwards-compatible facade
```

Each capability is a function `(problem: str) -> Optional[Solution]` registered
with a priority. `solve_problem` tries them in order and returns the first match.
To add a skill: write the function, wrap it in a `Capability`, and register it in
`solver/__init__.py`.

## Tests

```bash
python -m pytest -q
```
