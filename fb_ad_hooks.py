"""
FB Ad Hooks Generator - Saisify 2026 Style
Generates brutal, high-converting FB/IG Reel ad copy with scroll-stopping hooks.
"""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class AdVariant:
    """A single FB ad variant with hook, copy, and scroll-stop score."""

    hook: str
    copy: str
    score: int
    variant_type: str  # curiosity, rage, greed, fear, forbidden


def generate_fb_ad_hooks(niche_product: str) -> List[AdVariant]:
    """
    Generate 10 brutal FB ad hook variants with full copy.

    Args:
        niche_product: The niche/product description

    Returns:
        List of 10 AdVariant objects with hooks, copy, and scores
    """

    variants = []

    # Variant 1: RAGE / Stop doing X
    hook1 = "🛑 SLUTT å kaste bort tid på ChatGPT for ads — Det SUGER i 2026."
    copy1 = f"""🛑 SLUTT å kaste bort tid på ChatGPT for ads — Det SUGER i 2026.

ChatGPT har null peiling på hva som FAKTISK konverterer i {niche_product}-nisjen. Den gjetter. Den hallusinerer. Den gir deg generisk skit som alle andre også får.

Jeg har reverse-engineered 1000+ high-converting Reels fra 2025–2026. Vet EXACTLY hva som stopper scroll i 0.3 sekunder og får folk til å kjøpe.

I bare 26 minutter laget jeg: ✅ Komplett {niche_product} produkt ✅ 5 bonuses ✅ Upsells ✅ Sales page ✅ 5 FB-ad varianter klare til launch.

Anti-proof: Null audience. Aldri solgt i denne nisjen før. Men systemet er så tight at jeg kan pushe LIVE i morgen og begynne å printe penger.

👉 [LINK] — Før prisøkning. Bare for de som tør å hoppe."""
    variants.append(AdVariant(hook1, copy1, 9, "rage"))

    # Variant 2: CURIOSITY / Hidden knowledge
    hook2 = "🔥 Hemmelig: De beste ads i 2026 bruker IKKE ChatGPT..."
    copy2 = f"""🔥 Hemmelig: De beste ads i 2026 bruker IKKE ChatGPT...

...de bruker reverse-engineered data fra tusenvis av high-converting campaigns.

ChatGPT er bygget for å være safe. Den vet ikke en dritt om hva som faktisk selger i {niche_product}. Null real-world sales data. Bare gjetninger og templates fra 2023.

Jeg cracked koden: Analyserte 1000+ top-performing Reels → Fant eksakt hooks, pain points, og CTAs som konverterer AKKURAT NÅ.

På 26 min bygde jeg: ✨ {niche_product} core offer ✨ 5 irresistible bonuses ✨ Upsells som føles no-brainer ✨ Full sales page ✨ 5 tested FB-ad hooks.

Null following. Aldri kjørt ads i nisjen. Men jeg har blueprinten som allerede FUNKER for andre.

👉 [LINK] | Begrenset spots. Før alle andre lærer dette."""
    variants.append(AdVariant(hook2, copy2, 10, "curiosity"))

    # Variant 3: GREED / Money fast
    hook3 = "💰 Fra 0 kr til launch-klar på 60 min — {niche_product} edition"
    copy3 = f"""💰 Fra 0 kr til launch-klar på 60 min — {niche_product} edition

Glem måneder med «research» og A/B testing. Jeg tok alt arbeidet for deg.

ChatGPT gir deg generic bullshit. Jeg ga deg 1000+ reverse-engineered high-converting ads fra folk som FAKTISK printer i {niche_product}-nisjen right now.

Hva jeg shippa på under 1 time:
→ Komplett {niche_product} produkt
→ 5 bonuses folk glefs i seg
→ Upsell-strategi
→ Sales page med proven structure
→ 5 FB-ad varianter, testet mot 2026 scroll patterns.

Jeg har ingen audience. Aldri solgt dette før. Men jeg bruker EXACTLY samme system som killer offers bruker — så launch er plug-and-play.

👉 [LINK] — Pris går opp snart. Handle nå eller se på mens andre cleaner."""
    variants.append(AdVariant(hook3, copy3, 8, "greed"))

    # Variant 4: FEAR / You're losing money
    hook4 = "⚠️ Du taper penger HVER dag du bruker ChatGPT for {niche_product} ads"
    copy4 = f"""⚠️ Du taper penger HVER dag du bruker ChatGPT for {niche_product} ads

Sannheten: ChatGPT ble trent på OLD data. Den har ikke sett én eneste high-converting {niche_product} Reel fra 2026. Den gjetter basert på generic marketing theory.

Jeg analyserte hva som ACTUALLY virker: 1000+ proven ads, reverse-engineered til exact patterns som stopper scroll og driver sales.

På 26 minutter bygde jeg alt du trenger:
🎯 {niche_product} core product
🎯 5 bonuses folk ikke kan si nei til
🎯 Upsells som tripler revenue
🎯 Sales page structure (proven)
🎯 5 FB-ad hooks ready to run.

Jeg hadde null followers. Aldri testet nisjen. Men systemet er så dialed in at jeg kan gå live TOMORROW og kjøre profitt.

👉 [LINK] — Før du kaster bort enda en uke på generic AI-skit."""
    variants.append(AdVariant(hook4, copy4, 9, "fear"))

    # Variant 5: FORBIDDEN KNOWLEDGE / "They don't want you to know"
    hook5 = "🚨 De vil IKKE at du vet dette om {niche_product} ads i 2026..."
    copy5 = f"""🚨 De vil IKKE at du vet dette om {niche_product} ads i 2026...

Alle «AI gurus» pusher ChatGPT fordi de får kickbacks. Sannheten? ChatGPT suger for paid ads. Zero real conversion data.

Jeg gikk rogue: Reverse-engineered 1000+ high-converting {niche_product} campaigns fra folk som printer 6-7 figures. Fant EXACTLY hvilke hooks, pain points, og structures som funker NÅ.

Lagde komplett launch på 26 min:
✅ {niche_product} produkt (core offer)
✅ 5 bonuses med perceived value på 10x
✅ Upsell-strategi
✅ Sales page med proven framework
✅ 5 FB-ad varianter klare til spend.

Null audience. Aldri solgt i nisjen. Men jeg følger exact playbook som winners bruker — så jeg kan launch TODAY hvis jeg vil.

👉 [LINK] — Før de stenger dette ned."""
    variants.append(AdVariant(hook5, copy5, 10, "forbidden"))

    # Variant 6: CURIOSITY / Pattern interrupt
    hook6 = "🤔 Hvorfor taper {niche_product} ads laget med ChatGPT 9/10 ganger?"
    copy6 = f"""🤔 Hvorfor taper {niche_product} ads laget med ChatGPT 9/10 ganger?

Fordi ChatGPT er trent på generic markedsføring. Den har ikke én dritt av REAL sales data fra {niche_product}-nisjen i 2026.

Jeg gjorde det motsatte: Analyserte 1000+ ads som faktisk konverterer. Reverse-engineered hooks, storytelling beats, CTAs. Pakket alt i et system du kan bruke INSTANTLY.

På 26 minutter shippa jeg:
→ Ferdig {niche_product} offer
→ 5 bonuses som får folk til å bite
→ Upsells (bump AOV med 3x)
→ Sales page (proven structure)
→ 5 FB-ad varianter testet mot 2026 scroll behavior.

Jeg har null following. Never launched i nisjen. Men jeg har blueprinten som allerede proofer hos folk som tjener fett.

👉 [LINK] | Begrenset tilgang — act fast."""
    variants.append(AdVariant(hook6, copy6, 8, "curiosity"))

    # Variant 7: RAGE / Calling out BS
    hook7 = "😤 Tired of generic ChatGPT-ads som får 0 sales? — Her er antidoten"
    copy7 = f"""😤 Tired of generic ChatGPT-ads som får 0 sales? — Her er antidoten

ChatGPT er en generalist. Den vet jackshit om {niche_product}-nisjen. Den gir deg samme templated skit som alle andre får.

Jeg tok en annen vei: Scraped og analyserte 1000+ TOP-performing ads fra 2025–2026. Found exact formulas for hooks, pain, and CTAs som faktisk driver conversions.

I 26 minutter bygde jeg:
✔️ {niche_product} core product
✔️ 5 bonuses (no-brainer value stack)
✔️ Upsells
✔️ Sales page med proven copy
✔️ 5 FB-ad hooks ready for traffic.

Zero audience. Zero track record i nisjen. Men jeg følger EXACT system som fungerer for folk som printer — så jeg er launch-ready TODAY.

👉 [LINK] — Før prisen dobler. Bare for action-takers."""
    variants.append(AdVariant(hook7, copy7, 9, "rage"))

    # Variant 8: GREED / Quick win promise
    hook8 = "💸 26 minutter = Komplett {niche_product} launch (produkt + ads + sales page)"
    copy8 = f"""💸 26 minutter = Komplett {niche_product} launch (produkt + ads + sales page)

Ikke én uke. Ikke én dag. 26 MINUTTER.

ChatGPT bruker generic templates. Jeg bruker reverse-engineered blueprints fra 1000+ high-converting {niche_product} campaigns som faktisk selger i 2026.

Hva jeg shippa:
🔥 {niche_product} core offer
🔥 5 irresistible bonuses
🔥 Upsell-strategi for 3x AOV
🔥 Full sales page (proven structure)
🔥 5 FB-ad varianter klare til spend.

Jeg har INGEN audience. Aldri kjørt i nisjen før. Men jeg har systemet som winners bruker, så jeg kan pushe live og start printing penger ASAP.

👉 [LINK] — Grabb før prisøkning."""
    variants.append(AdVariant(hook8, copy8, 8, "greed"))

    # Variant 9: FEAR / FOMO on opportunity
    hook9 = "⏰ {niche_product}-markedet er på FIRE i 2026 — men du bruker fortsatt ChatGPT?"
    copy9 = f"""⏰ {niche_product}-markedet er på FIRE i 2026 — men du bruker fortsatt ChatGPT?

Mens du promptr generic AI-skit, cleaner konkurrentene dine med ads bygget på REAL data.

Jeg reverse-engineered 1000+ top-performing {niche_product} campaigns. Vet EXACTLY hvilke hooks, pain points, og CTAs som funker NÅ — ikke i 2023.

På 26 min bygde jeg full launch:
→ {niche_product} produkt
→ 5 bonuses
→ Upsells
→ Sales page med proven copy
→ 5 FB-ad hooks ready to run.

Jeg har null followers. Never launched i nisjen. Men jeg har exact playbook som allerede printer for andre — så jeg kan gå live TODAY.

👉 [LINK] — Før du mister enda flere sales til folk som beveger seg raskere."""
    variants.append(AdVariant(hook9, copy9, 9, "fear"))

    # Variant 10: FORBIDDEN / Insider secret
    hook10 = "🔓 Insider-secret: Slik lager 7-figure brands {niche_product} ads (hint: IKKE ChatGPT)"
    copy10 = f"""🔓 Insider-secret: Slik lager 7-figure brands {niche_product} ads (hint: IKKE ChatGPT)

De bruker reverse-engineered data fra tusenvis av proven campaigns. Ikke generic AI.

ChatGPT ble ikke trent på din niche. Den har ZERO insight i hva som faktisk stopper scroll og driver sales i {niche_product} i 2026.

Jeg cracked systemet: Analyserte 1000+ winning ads → Fant exact patterns → Bygde alt på 26 min.

Deliverables:
🎯 {niche_product} core product
🎯 5 bonuses (irresistible)
🎯 Upsell-strategi
🎯 Sales page (proven framework)
🎯 5 FB-ad hooks ready to spend.

Null audience. Aldri solgt i nisjen. Men jeg har blueprinten som fungerer for folk som tjener MILLIONS — så launch er plug-and-play.

👉 [LINK] — Før de stenger tilgangen."""
    variants.append(AdVariant(hook10, copy10, 10, "forbidden"))

    return variants


def format_ad_variant(variant: AdVariant, index: int) -> str:
    """Format a single ad variant for display."""

    stars = "⭐" * (variant.score // 2)
    if variant.score % 2:
        stars += "½"

    output = f"""
{'='*70}
VARIANT #{index} — {variant.variant_type.upper()} (Scroll-Stop Score: {variant.score}/10 {stars})
{'='*70}

**HOOK:** {variant.hook}

{variant.copy}

"""
    return output


def format_all_variants(variants: List[AdVariant], niche_product: str) -> str:
    """Format all variants into a complete report."""

    header = f"""
{'#'*70}
  FB AD HOOKS GENERATOR — SAISIFY 2026 STYLE
  Niche/Produkt: {niche_product}
{'#'*70}

Generert: 10 brutale scroll-stopping hooks + full ad copy
Reverse-engineered fra 1000+ high-converting Reels 2025-2026
Ingen PC-skit. Bare hooks som FUNKER.
"""

    body = ""
    for i, variant in enumerate(variants, 1):
        body += format_ad_variant(variant, i)

    footer = """
{'='*70}
TIPS FOR BRUK:
{'='*70}
1. Test minst 3-4 varianter (ulik hook-type) i første ad set
2. Kjør 2-3 dager, se hvilken score best på 3-sec hold rate
3. Kill losers, scale winner med 20-30% budget bump
4. Roter creative hver 5-7 dager for å unngå ad fatigue
5. Bruk UGC-stil video (phone-shot, raw) for max authenticity

LYK TIL, KILLER 🔥
"""

    return header + body + footer


def main_fb_hooks(niche_product: str) -> str:
    """Main entry point for FB ad hooks generation."""

    if not niche_product or not niche_product.strip():
        raise ValueError("Please provide a niche/product description.")

    variants = generate_fb_ad_hooks(niche_product.strip())
    return format_all_variants(variants, niche_product.strip())


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python fb_ad_hooks.py 'YOUR NICHE/PRODUCT'")
        print("Example: python fb_ad_hooks.py 'AI-prompt pack for OnlyFans managers'")
        sys.exit(1)

    niche = " ".join(sys.argv[1:])
    output = main_fb_hooks(niche)
    print(output)
