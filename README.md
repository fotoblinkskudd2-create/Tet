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

## OpenClaw multi-agent workflows

The `openclaw/` package holds Scout → Processor → Finalizer agent pipelines for engineering, biomechanical, acoustic, and creative side projects (AbyssLatch, SeneDrakt, DR-2, VORTEX-LOCK, LYTTEPOST, Sonic Visualization, DYPLADER, and the Norwegian AI prompt suite).

```bash
python openclaw/openclaw_extensions.py       # Run the AbyssLatch scout/processor/finalizer example
python openclaw/claude_code_integration.py   # Run the default integration workflow
python openclaw/concrete_tasks.py            # Run all 7 quick engineering/creative calculations
```

Each workflow function can also be imported directly, e.g. `from openclaw.concrete_tasks import task_1_abysslatch_gasket_seating`. See `tests/test_openclaw.py` for examples covering every agent pipeline and task.
