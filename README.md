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

## Think clearly with the Decision Oracle

Stuck on a real choice? The Decision Oracle refuses to fake a fortune-cookie
verdict. Instead it does the genuinely useful work: it audits *how you framed
the question*, names the cognitive traps hiding in your own wording, classifies
the choice as a reversible **two-way door** or a permanent **one-way door**, and
walks your options through four mental models the clearest thinkers actually use.

```bash
python app.py --decide "Should I take the new job or stay where I am?"
python app.py "Should I move to Oslo or stay in Bergen?"   # auto-detected
```

What you get back:

- **A trap scan of your phrasing** — the binary trap (you forgot option C), the
  sunk-cost trap (the past is lobbying for the future), false urgency,
  loss-framing, and permission-seeking — each with a one-line fix.
- **Door classification** — one-way (slow down, buy information) vs two-way
  (stop deliberating, run a small experiment). This single heuristic resolves
  more dithering than any pros-and-cons list.
- **Four mental models applied to your options** — regret-minimization (Bezos),
  10/10/10, premortem (Gary Klein), and a weighted-scoring worksheet for the
  stubbornly close calls.

The Oracle's whole philosophy in one line: a decision is a bet on the best
information you have, not a promise about the future — so make it cleanly, write
down *why* in one sentence, and let future-you grade the reasoning, not the luck.
