# Tet — a joyful, extensible problem solver

Tet turns small everyday questions into clear, upbeat answers. Ask it to do
arithmetic, convert units, count days, crunch statistics, find anagrams, or
build a creative brief — and when it doesn't have a direct solver, it still
hands you a structured way to start.

Under the hood Tet is a tiny **solver engine**: every capability is a small,
self-contained solver, and a registry ranks their answers by *confidence* so
the most relevant solver wins — not merely the first one that matched.

* **Zero dependencies.** Pure Python standard library; runs anywhere.
* **Safe by construction.** The math evaluator walks the AST against an
  allow-list — no `eval`, no attribute access, no surprise imports.
* **Extensible.** Add a capability by writing one small class and registering
  it. No giant `if/elif` ladder to edit.

## Quick start

```bash
python app.py "2 + 3 * 4"                 # → 14
python app.py "sqrt(2) + 1"               # functions: sqrt, log, sin, factorial, …
python app.py "convert 10 km to miles"    # unit conversion
python app.py "100 f to c"                # temperature
python app.py "days until 2026-12-25"     # date math
python app.py "median of 5 3 8 1 9"       # statistics
python app.py "15% of 200"                # percentages
python app.py "convert 255 to hex"        # number bases
python app.py "roman numeral for 2026"    # roman numerals
python app.py "find an anagram of listen" # anagrams
python app.py "what is the speed of light"  # searchable knowledge base
python app.py "search avogadro constant"    # physical constants & SI prefixes
```

### Searchable knowledge & intelligent recovery

Tet ships a small, accurate, **searchable** knowledge base — physical constants
(CODATA 2022), SI prefixes (through quetta/quecto), and defined values like the
astronomical unit. Ask in plain language and Tet ranks its entries against your
words, with typo tolerance:

```text
$ tet "what is the planck constant"
✨ Knowledge solution ready! ✨
Planck constant (h) = 6.62607 × 10^-34 J·s
- Exact by SI definition. Category: constant.
- Related: reduced Planck constant = 1.05457 × 10^-34 J·s
```

And when nothing matches, Tet infers what you *probably* meant and offers a
ready-to-run example instead of a dead end:

```text
$ tet "could you covert kilometers somehow"
✨ Brainstorm solution ready! ✨
…
- Did you mean a unit conversion? Try: convert 10 km to miles
```

Installed as a package, the same lives under the `tet` command:

```bash
pip install -e .
tet "what weekday is 2026-06-21"
```

## CLI options

| Flag | What it does |
| --- | --- |
| `--json` | Emit the solution as JSON instead of friendly text. |
| `--all` | Show every solver's ranked candidate with its confidence. |
| `--list` | List the available solvers and exit. |
| `--repl` | Start an interactive loop. |
| `--prompt [--medium photo\|video\|music\|art\|poem]` | Build a structured, mobile-friendly creative brief. |
| `--version` | Print the version. |

The `--all` view is the clearest window into the engine:

```text
$ tet --all "what is 50% of 80"
[1] percentage (confidence 0.86)
✨ Percent solution ready! ✨
50% of 80 is 40.

[2] brainstorm (confidence 0.02)
…
```

## Build creative prompts for iOS web

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The builder keeps instructions short and mobile-friendly and adds concise
delivery notes for camera, composition, pacing, instrumentation, or poetic form.

## Library use

```python
from tet import solve_problem, candidate_solutions, build_creative_prompt

print(solve_problem("convert 5 kg to pounds").format())

for candidate in candidate_solutions("25% of 80"):
    print(candidate.source, candidate.confidence)
```

## Development

```bash
pip install -e ".[dev]"
pytest
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the design and a guide to
adding your own solver.
