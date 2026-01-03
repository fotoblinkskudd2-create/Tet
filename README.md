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

## Mobile-friendly creative prompter

Give the tool a few seed words and it will craft crisp prompts for iOS-friendly photos, videos, music, art, and poetry:

```bash
python app.py --prompt "sunset boardwalk neon"
```

The prompter returns a ready-to-use pack with clear directions for each medium (vertical video framing, Retina-ready art guidance, loopable music cues, and a concise poem outline).
