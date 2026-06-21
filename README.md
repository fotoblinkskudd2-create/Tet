# Tet

## 🎮 TET — Neon Stacker (the game)

A complete, self-contained Tetris in a single file. **No build step, no dependencies** — just open it in any browser (desktop or mobile).

```bash
# macOS
open index.html
# Linux
xdg-open index.html
# or serve it
python3 -m http.server 8000   # then visit http://localhost:8000
```

**Features**
- SRS rotation with full wall-kick tables (incl. I-piece kicks)
- 7-bag randomizer, hold piece, ghost piece, 5-deep next queue
- T-spin detection (mini / single / double / triple), combos, back-to-back bonuses
- Lock delay with move resets, DAS/ARR tuned movement, soft & hard drop
- Speed curve across 20 levels, particle juice on line clears, WebAudio synth (no sound assets)
- Neon glassmorphism UI, local best-score, and touch controls (swipe + on-screen buttons)

Controls: **← →** move · **↓** soft drop · **Space** hard drop · **↑/X** rotate CW · **Z** rotate CCW · **C** hold · **P** pause.

---

## Tet Problem Solver (CLI)

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
