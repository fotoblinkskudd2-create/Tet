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

## Panic and anxiety support

When a prompt mentions panic or an anxiety attack (in English or Norwegian, e.g. "panic", "anxiety attack", "panikk", "angst", "kan ikke puste"), the solver switches to a calm, structured protocol instead of brainstorming:

```bash
python app.py "I think I am having a panic attack and my heart is racing"
python app.py "Jeg får panikk og kan ikke puste"
```

The response walks through grounding, paced breathing (inhale 4, hold 4, exhale 6, hold 2), reality checks, a body reset, and aftercare. It also lists the warning signs that mean you should seek urgent help. This is supportive self-care guidance, not a substitute for professional or emergency care.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.
