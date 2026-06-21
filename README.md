# Tet — Personal System

A single, dependency-free command-line system for capturing and organising
everything you work on: **daily life, AI, inventions, patents, workflow,
music, video, art, images, concepts, eco/economic ideas and stocks.**

Everything is stored as items in one SQLite database (`~/.tet/tet.db` by
default) and grouped by category. No frameworks, no accounts, no network
required — it runs anywhere Python 3.9+ runs, including iOS web shells.

## Quick start

```bash
python -m tet seed         # add starter items across every category
python -m tet list         # see everything, sorted by priority
python -m tet dashboard    # render tet-dashboard.html (open on any device)
```

## Categories

| key | area | key | area |
|-----|------|-----|------|
| `daily` | 📅 everyday tasks & notes | `art` | 🎨 visual art ideas |
| `ai` | 🤖 AI experiments & prompts | `image` | 🖼️ image/photo concepts |
| `invention` | 💡 raw invention ideas | `concept` | 🧩 frameworks & big ideas |
| `patent` | 📜 patent-track inventions | `eco` | 🌱 eco/economic ideas |
| `workflow` | 🔄 repeatable processes | `stock` | 📈 stock watchlist |
| `music` | 🎵 track ideas & lyrics | `video` | 🎬 video concepts |

Run `python -m tet categories` for the full list (English/Norwegian labels).

## Capturing & organising

```bash
# Capture an item (category aliases like "todo", "aksje", "idé" also work)
python -m tet add invention "Self-tensioning bike chain" \
  -b "Passive mechanism keeps tension without a derailleur" \
  -t mechanical -p 4 -m problem="chain slack"

python -m tet list invention        # filter by category
python -m tet list -t mechanical     # filter by tag
python -m tet search "tension"       # full-text search
python -m tet show 3                 # full detail of item #3
python -m tet edit 3 -s in-progress -p 5
python -m tet done 3                 # mark done
python -m tet stats                  # counts and top tags
```

## Scoring ideas (transparent, explainable)

Score and compare ideas with consistent weighted models so the ranking tells
you where to spend attention:

```bash
python -m tet score eco impact=9 feasibility=7 market=8 defensibility=5 timing=8
python -m tet score invention novelty=8 usefulness=9 feasibility=7
python -m tet score stock conviction=8 moat=7 valuation=6 growth=8 risk=7
python -m tet score eco impact=9 feasibility=8 --id 11   # save score onto item #11
```

Models: `eco`, `invention`/`patent`, `stock`. Each factor is 0–10; missing
factors default to a neutral 5 and are flagged.

## Creative briefs

Turn a few words into a structured, mobile-friendly creative prompt:

```bash
python -m tet prompt music "uplifting launch theme"
python -m tet prompt image "hands holding a sprouting seed, soft light" --save
```

## Stock watchlist

```bash
python -m tet stock add NVDA --thesis "AI compute leader" --target 200 --conviction 4
python -m tet stock list
python -m tet stock list --refresh   # best-effort live prices (needs network)
```

Prices are fetched best-effort from Stooq and degrade gracefully when the
environment blocks outbound network access.

## Dashboard

```bash
python -m tet dashboard -o tet-dashboard.html
```

Produces one self-contained HTML file (dark theme, responsive) grouping every
item by category — a shareable snapshot you can open on a phone or commit.

## Data location

The database lives at `~/.tet/tet.db`. Override per-command with `--db PATH`
or globally with the `TET_DB` environment variable.

## Legacy CLI

The original joyful problem-solver still lives in `app.py`:

```bash
python app.py "2 + 3 * 4"
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
```

The Tet system reuses its creative-prompt engine, so there is one source of
truth for prompts.

## Tests

```bash
python -m pytest -q
```
