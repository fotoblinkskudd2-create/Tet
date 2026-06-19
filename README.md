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

## Build a Facebook commitment post (beat the flaking)

Commitment mode turns proven behavioral psychology into a ready-to-paste "social contract" post that makes people far more likely to actually show up. It combines a public written commitment, an if-then plan (implementation intention), an accountability referee, a stake (loss aversion), identity framing, and social proof:

```bash
python app.py --commit --kind dugnad --when "lørdag kl 10" --referee "@Kari" \
  --stake "200 kr til veldedighet" "ryddedugnad i parken"
```

- `--kind` sets the tone: `event` (default), `dugnad`, `fest`, or `aksjon`.
- `--when`, `--referee`, and `--stake` are optional—missing fields become clearly marked placeholders to fill in.

The answer is the copy-paste post; the bullet points explain why each mechanism works so you can tune it for your group.
