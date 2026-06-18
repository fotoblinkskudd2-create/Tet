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

## KUTT24 — Memory-Bound Value Engine

A separate, self-contained subsystem under `src/verdikvern/`. It is a memory-first
value loop, not an agent factory:

```
input → memory → run card → output → judgement → next input
```

Three cells (HENTER → BYGGER → DOMMER), a strict PromotionGate
(`PASS` / `REWORK` / `BLOCK`), a 100-task bank, deterministic mock mode, no
X/Twitter dependency, no blind auto-deploy, and a civil / clean-room drone policy.

```bash
cd src
python -m verdikvern selftest          # verify wiring offline (mock backend)
python -m verdikvern tasks             # list the 100-task bank
python -m verdikvern run-task T001     # run a task through the loop
python -m verdikvern run "Write a 24h operator runbook"
```

Run the tests:

```bash
python -m pytest tests/test_verdikvern.py -q
```

Docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
[`docs/OPERATOR_MANUAL.md`](docs/OPERATOR_MANUAL.md),
[`docs/PROMOTION_GATE.md`](docs/PROMOTION_GATE.md),
[`docs/TASK_BANK_100.md`](docs/TASK_BANK_100.md),
[`docs/CLEAN_ROOM_NOTES.md`](docs/CLEAN_ROOM_NOTES.md),
[`docs/RUNBOOK_24H.md`](docs/RUNBOOK_24H.md). Cell prompts live in `prompts/`.
