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

## Generate brutal FB ad hooks (Saisify 2026 style)

Create scroll-stopping Facebook/Instagram Reel ad copy with proven hooks that convert. The generator produces 10 variants using psychology-based triggers (curiosity, rage, greed, fear, forbidden knowledge) with full copy structure:

```bash
python app.py --fb-hooks "AI-prompt pack for OnlyFans managers"
python app.py --fb-hooks "Bergen crypto day-trading bot"
python app.py --fb-hooks "Saisify-klone for norske launches"

# Or use the standalone script:
python fb_ad_hooks.py "YOUR NICHE/PRODUCT"
```

Each variant includes:
- **Opening hook** (1-2 sentences, emoji, caps for punch)
- **Pain point** (why ChatGPT/generic AI fails for this niche)
- **Proof/claim** (reverse-engineered from 1000+ campaigns)
- **Demo result** (time + deliverables)
- **Anti-proof** (no audience, never sold before, still ready)
- **CTA + urgency** (link, scarcity, action-takers only)

All hooks are scored 0-10 on "scroll-stop power" based on 2026 conversion data. Output is in Norwegian with brutal, direct language—no PC stuff, just what works.
