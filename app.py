"""
A playful problem-solving CLI application.
"""
from __future__ import annotations

import argparse
import ast
import datetime
import operator
import re
from dataclasses import dataclass
from typing import Callable, Dict, Iterable, List, Optional, Tuple


@dataclass
class Solution:
    """A lightweight wrapper for solutions returned by the solver."""

    kind: str
    answer: str
    details: Optional[List[str]] = None

    def format(self) -> str:
        """Return a user-friendly representation of the solution."""

        banner = f"✨ {self.kind} solution ready! ✨"
        parts = [banner, self.answer]
        if self.details:
            parts.append("\n".join(f"- {line}" for line in self.details))
        return "\n".join(parts)


def _safe_math_eval(expr: str) -> float:
    """Safely evaluate a math expression using Python's AST.

    Only allows basic numeric operations to keep evaluation safe.
    """

    allowed_bin_ops: Dict[type, Callable[[float, float], float]] = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.FloorDiv: operator.floordiv,
        ast.Mod: operator.mod,
        ast.Pow: operator.pow,
    }
    allowed_unary_ops: Dict[type, Callable[[float], float]] = {
        ast.UAdd: operator.pos,
        ast.USub: operator.neg,
    }

    def _evaluate(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return _evaluate(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.BinOp) and type(node.op) in allowed_bin_ops:
            left = _evaluate(node.left)
            right = _evaluate(node.right)
            return allowed_bin_ops[type(node.op)](left, right)
        if isinstance(node, ast.UnaryOp) and type(node.op) in allowed_unary_ops:
            return allowed_unary_ops[type(node.op)](_evaluate(node.operand))
        raise ValueError("Unsupported expression for safe evaluation.")

    tree = ast.parse(expr, mode="eval")
    return _evaluate(tree)


_ANAGRAM_LIBRARY: Dict[str, Tuple[str, ...]] = {
    "listen": ("silent", "enlist", "tinsel"),
    "evil": ("vile", "veil", "live"),
    "angel": ("glean", "angle"),
    "stressed": ("desserts",),
    "save": ("vase" ,),
}


def _solve_anagram(problem: str) -> Optional[Solution]:
    pattern = re.compile(r"(?:anagram of|unscramble)\s+([A-Za-z]+)")
    match = pattern.search(problem.lower())
    if not match:
        return None

    target = match.group(1)
    canonical = "".join(sorted(target))
    candidates: List[str] = []
    for source, words in _ANAGRAM_LIBRARY.items():
        if canonical == "".join(sorted(source)):
            candidates.extend(words)
    if not candidates:
        answer = f"I could not find a perfect match, but '{canonical}' looks like a fun jumble!"
    else:
        answer = f"Possible anagram buddies for '{target}': {', '.join(candidates)}"
    details = ["Try speaking the options out loud—sometimes the silliest sounds win!"]
    return Solution(kind="Anagram", answer=answer, details=details)


def _solve_math(problem: str) -> Optional[Solution]:
    cleaned = problem.strip()
    if not cleaned:
        return None
    try:
        result = _safe_math_eval(cleaned)
    except Exception:
        return None

    rounded = int(result) if result.is_integer() else round(result, 4)
    answer = f"The numbers danced and the answer is {rounded}!"
    details = [
        "Crunching numbers is my cardio.",
        "Remember: math is just puzzles wearing serious hats.",
    ]
    return Solution(kind="Math", answer=answer, details=details)


_MEDIUM_SYNONYMS: Dict[str, Tuple[str, ...]] = {
    "photo": ("picture", "image", "shot"),
    "video": ("film", "clip", "reel"),
    "music": ("song", "track", "audio"),
    "art": ("illustration", "drawing", "painting", "concept art"),
    "poem": ("poetry", "verse", "haiku", "sonnet"),
}

_CREATIVE_RECIPES: Dict[str, Dict[str, object]] = {
    "photo": {
        "title": "Photo prompt",
        "style": "Cinematic but natural; prioritize authentic skin tones and tactile color.",
        "structure": "Subject first, then context, then lighting and framing, plus a camera cue (lens or aperture).",
        "platform": "Keep it in two short sentences so it pastes cleanly into iOS web fields.",
        "delivery": "Ask for vertical orientation, high resolution, and gentle post-processing.",
        "details": [
            "Mention time of day and light direction to control shadows.",
            "Call out focal length or depth of field for focus hierarchy.",
            "Use crisp nouns and verbs—avoid vague mood words unless they shape the shot.",
        ],
    },
    "video": {
        "title": "Video prompt",
        "style": "Story-driven and rhythmic; foreground motion with clear start, middle, and end beats.",
        "structure": "Lead with subject and setting, add camera move, pacing, and audio texture cues.",
        "platform": "Write in three sentences, ready for iOS Safari text areas with no markdown symbols.",
        "delivery": "Request 16:9 landscape unless noted, with clean transitions and legible subtitles.",
        "details": [
            "Specify the opening frame and the closing frame to anchor edits.",
            "Describe one signature movement (dolly in, glide across, or drone reveal).",
            "Note the tone of diegetic sound or soundtrack tempo for timing.",
        ],
    },
    "music": {
        "title": "Music prompt",
        "style": "Concise genre-plus-mood pairing with texture references (analog warmth, glassy synths).",
        "structure": "State tempo and time signature, list 3–4 instruments, and define the hook or motif.",
        "platform": "Compact sentences that stay readable in iOS share sheets; no special characters required.",
        "delivery": "Request a clean intro, a 2-bar motif, and a tail for looping.",
        "details": [
            "Include bpm and rhythm feel (swing, straight, halftime).",
            "Balance one lead voice with supporting harmony and a light percussive bed.",
            "Name a space for the mix (intimate studio, airy hall) to anchor reverb.",
        ],
    },
    "art": {
        "title": "Art prompt",
        "style": "Vivid but controlled; emphasize material choices (ink wash, vector, pastel, 3D render).",
        "structure": "Subject + silhouette, palette direction, and a texture or brushwork note.",
        "platform": "Two or three compact sentences that stay crisp when pasted into mobile web tools.",
        "delivery": "Request balanced negative space and export-ready at print-safe resolution.",
        "details": [
            "Describe lighting or shading style (rim light, chiaroscuro, subsurface glow).",
            "Mention perspective or lens feel for depth (isometric, 35mm, telephoto compression).",
            "State palette constraints (triadic brights, muted earth, monochrome accent).",
        ],
    },
    "poem": {
        "title": "Poem prompt",
        "style": "Clear voice with a single emotional color; choose a form to shape rhythm.",
        "structure": "Name the subject, pick a form (haiku, sonnet, free verse), and specify imagery anchors.",
        "platform": "Keep to a couple of sentences so it reads well in iOS web or chat inputs.",
        "delivery": "Invite musicality through meter hints and one sensory detail per line.",
        "details": [
            "State the form or line count to guide cadence.",
            "Offer two sensory images (sound + sight or touch) to keep it concrete.",
            "Suggest a closing turn or surprise to land the emotion.",
        ],
    },
}


def _normalize_medium_label(label: Optional[str]) -> Optional[str]:
    if not label:
        return None
    lowered = label.lower().strip()
    for medium, aliases in _MEDIUM_SYNONYMS.items():
        if lowered == medium or lowered in aliases:
            return medium
    return None


def _detect_medium_from_text(text: str) -> Optional[str]:
    lowered = text.lower()
    for medium, aliases in _MEDIUM_SYNONYMS.items():
        if medium in lowered or any(alias in lowered for alias in aliases):
            return medium
    return None


def _shape_creative_prompt(seed: str, medium: str) -> Tuple[str, List[str]]:
    profile = _CREATIVE_RECIPES[medium]
    cleaned_seed = seed.strip().rstrip(".")
    answer = (
        f"{profile['title']}: {cleaned_seed}. "
        f"Style: {profile['style']} "
        f"Structure: {profile['structure']} "
        f"Platform fit: {profile['platform']} "
        f"Delivery notes: {profile['delivery']}"
    )
    details = list(profile["details"])  # type: ignore[arg-type]
    details.append("Mobile-first: short sentences, no markdown, ready for iOS web share sheets.")
    return answer, details


def build_creative_prompt(seed: str, medium_hint: Optional[str] = None) -> Solution:
    """Turn a short idea into a structured creative prompt for multiple mediums."""

    if not seed or not seed.strip():
        raise ValueError("Please provide a few words to shape into a prompt.")

    normalized = (
        _normalize_medium_label(medium_hint)
        or _detect_medium_from_text(seed)
        or "art"
    )
    answer, details = _shape_creative_prompt(seed, normalized)
    return Solution(kind="Creative Prompt", answer=answer, details=details)


_WEEKDAY_ORDER: Tuple[str, ...] = (
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
)

_DAY_ALIASES: Dict[str, str] = {
    "monday": "monday", "mandag": "monday", "man": "monday",
    "tuesday": "tuesday", "tirsdag": "tuesday", "tir": "tuesday",
    "wednesday": "wednesday", "onsdag": "wednesday", "ons": "wednesday",
    "thursday": "thursday", "torsdag": "thursday", "tor": "thursday",
    "friday": "friday", "fredag": "friday", "fre": "friday",
    "saturday": "saturday", "lordag": "saturday", "lørdag": "saturday", "lor": "saturday",
    "sunday": "sunday", "sondag": "sunday", "søndag": "sunday", "son": "sunday",
}

# A weekly rotation that gives every discipline one dedicated deep-work day
# plus a short daily research habit, so nothing gets neglected across the cycle.
WEEKLY_WORKFLOW: Dict[str, Dict[str, object]] = {
    "monday": {
        "label": "Mandag - Aksjer og verdiinvestering",
        "deep_work": (
            "2-3 timer dyp researchblokk: gjennomgå porteføljen, screene nye "
            "verdiinvesteringskandidater og oppdater overvåkningslisten."
        ),
        "research": [
            "Sjekk kvartalsrapporter og innsidehandel for selskaper på overvåkningslisten.",
            "Les én årsrapport eller analytikernotat i dybden.",
            "Oppdater verdivurderingen (DCF/multipler) for én kandidat.",
            "Skann makro- og sektornyheter relevante for porteføljen.",
        ],
        "synergy": (
            "Bruk bedriftshistorier og markedsnarrativer som råstoff til "
            "forfatterprosjektet, f.eks. karakterbakgrunn for en finansfortelling."
        ),
    },
    "tuesday": {
        "label": "Tirsdag - Kunst",
        "deep_work": "Atelierøkt: skisser, maleri eller digital kunst i to sammenhengende timer.",
        "research": [
            "Bla gjennom tre kunstplattformer eller gallerier for nye trender.",
            "Lagre fem visuelle referanser i moodboard-mappen.",
            "Studer en kunstners teknikk i dybden i 10-15 minutter.",
            "Noter en idé som kan oversettes til et musikk- eller videoprosjekt.",
        ],
        "synergy": (
            "Dagens fargepalett og moodboard kan style albumcoveret (onsdag) "
            "eller fargegradingen i ukens videoprosjekt (torsdag)."
        ),
    },
    "wednesday": {
        "label": "Onsdag - Musikk",
        "deep_work": "Studiotid: komponering, opptak eller miksing i 2-3 timer.",
        "research": [
            "Lytt aktivt til to nye album eller artister utenfor komfortsonen.",
            "Analyser produksjonsteknikken i en favorittlåt.",
            "Research samples, lyder eller plugins som matcher ukens stemning.",
            "Skriv én melodi- eller tekstidé inspirert av dagens kunst eller skriving.",
        ],
        "synergy": (
            "Bruk tekstutkast fra skrivedagen (fredag) som lyrikk-råstoff, eller "
            "komponer en temalåt for en scene i videoprosjektet."
        ),
    },
    "thursday": {
        "label": "Torsdag - Video",
        "deep_work": "Produksjon eller redigering: filming, klipping eller motion graphics i 2-3 timer.",
        "research": [
            "Se to referansevideoer eller filmer for klipperytme og fargegrading.",
            "Research kamera-, objektiv- eller VFX-trender.",
            "Bygg en shotlist eller storyboard for neste opptak.",
            "Hent en musikksnutt fra onsdagens sesjon til en temp-track.",
        ],
        "synergy": (
            "Den visuelle stilen fra videoprosjektet kan gjenbrukes i kunst-"
            "moodboardet eller som scenebeskrivelse i manuset."
        ),
    },
    "friday": {
        "label": "Fredag - Forfatter og skriving",
        "deep_work": "Skriveøkt: manuskript, dikt eller artikkel i 90-120 minutter sammenhengende.",
        "research": [
            "Les 20-30 sider i en bok innenfor eller utenfor egen genre.",
            "Research et faktaspørsmål eller miljø som dukket opp i manuset.",
            "Følg en forfatter eller et litteraturtidsskrift for samtidsdebatt.",
            "Noter dialog eller observasjoner fra ukens opplevelser som materiale.",
        ],
        "synergy": (
            "Erfaringer fra jaktturen (lørdag) eller markedsanalysen (mandag) gir "
            "autentisk detalj og spenningsdramaturgi til teksten."
        ),
    },
    "saturday": {
        "label": "Lørdag - Jakt",
        "deep_work": (
            "Feltdag eller jaktforberedelse: jakt, viltstellearbeid eller "
            "utstyrsvedlikehold i 3-4 timer (sesongavhengig)."
        ),
        "research": [
            "Sjekk værmelding, vind og månefase for jaktterrenget.",
            "Følg viltrapporter, fellingsstatistikk og forvaltningsnytt i ditt område.",
            "Les om en jaktteknikk, art eller utstyrstest.",
            "Loggfør observasjoner (spor, lyder, lys) som sanselig materiale.",
        ],
        "synergy": (
            "Naturobservasjoner og lyssetting fra jaktterrenget er gull for "
            "landskapskunst, naturlydopptak til musikk og location-research til video."
        ),
    },
    "sunday": {
        "label": "Søndag - Design og ukentlig integrasjon",
        "deep_work": (
            "Designarbeid (UI, grafisk eller produkt) på formiddagen; ukentlig "
            "review og planlegging på ettermiddagen."
        ),
        "research": [
            "Skann designtrender (typografi, produktlanseringer, portfolioer).",
            "Oppsummer ukens fremdrift i alle seks andre disipliner med en kort logg.",
            "Identifiser ukens beste tverrfaglige idé og planlegg hvor den skal brukes.",
            "Sett tre hovedprioriteringer per disiplin for neste uke.",
        ],
        "synergy": (
            "Søndagens review er limet i systemet: her kobles ukens innsikter "
            "(aksjeideer, kunstreferanser, jaktinntrykk) bevisst til konkrete "
            "oppgaver i neste ukes sykluser."
        ),
    },
}

MONTHLY_REVIEW_CHECKLIST: Tuple[str, ...] = (
    "Porteføljegjennomgang: rebalanser, sjekk avkastning mot caset for hver "
    "posisjon, og luk ut investeringer der avhandlingen ikke holder lenger.",
    "Kunstarkiv: samle månedens beste skisser/bilder i en portefølje-mappe og "
    "vurder hva som er utstillingsklart.",
    "Musikk og video: status på pågående spor og klipp, sett en konkret "
    "utgivelsesdato for minst ett verk.",
    "Manusframdrift: tell ord eller sider skrevet, juster neste måneds "
    "skrivemål, og send ut minst én tekst.",
    "Jaktsesong og forvaltning: oppdater feltloggen, sjekk kommende sesonger "
    "og kvoter, og vedlikehold utstyret.",
    "Tverrfaglig idébank: gå gjennom notatene fra ukens 'tverrfaglig kobling' "
    "og velg én eller to idéer å utvikle videre neste måned.",
    "Sett tre fokusmål per disiplin for neste måned, og bekreft at "
    "ukessyklusen fortsatt gir alle felt nok tid.",
)


def _normalize_day(label: Optional[str]) -> str:
    """Resolve a day name (English, Norwegian, or 'today') to a canonical key."""

    if not label or label.lower().strip() in {"today", "i dag", "idag"}:
        return _WEEKDAY_ORDER[datetime.date.today().weekday()]
    lowered = label.lower().strip()
    if lowered in _DAY_ALIASES:
        return _DAY_ALIASES[lowered]
    raise ValueError(f"Unknown day: {label}")


def build_workflow_plan(day_hint: Optional[str] = None) -> Solution:
    """Return the multidisciplinary workflow plan for a given day (default: today)."""

    day_key = _normalize_day(day_hint)
    plan = WEEKLY_WORKFLOW[day_key]
    answer = f"{plan['label']}: {plan['deep_work']}"
    details = list(plan["research"])  # type: ignore[arg-type]
    details.append(f"Tverrfaglig kobling: {plan['synergy']}")
    return Solution(kind="Workflow", answer=answer, details=details)


def build_weekly_overview() -> Solution:
    """Return a one-line-per-day summary of the full weekly rotation."""

    lines = [str(WEEKLY_WORKFLOW[day_key]["label"]) for day_key in _WEEKDAY_ORDER]
    answer = "Ukesoversikt over de syv disiplinene:"
    return Solution(kind="Weekly Overview", answer=answer, details=lines)


def build_monthly_review() -> Solution:
    """Return the monthly synthesis checklist that ties the disciplines together."""

    answer = "Månedlig synteserunde (kjør denne siste helg i hver måned):"
    return Solution(kind="Monthly Review", answer=answer, details=list(MONTHLY_REVIEW_CHECKLIST))


def _brainstorm_steps(problem: str) -> Solution:
    steps = [
        "Name the goal in one joyful sentence.",
        "List the facts and doodle a tiny diagram.",
        "Break the challenge into two bite-sized steps.",
        "Pick the easiest step and start there—momentum is magic!",
    ]
    answer = f"I don't have a direct solver for: '{problem}'. But we can still win together!"
    return Solution(kind="Brainstorm", answer=answer, details=steps)


def _solve_panic_support(problem: str) -> Optional[Solution]:
    """Provide a structured, practical protocol for panic moments."""

    panic_markers = (
        "panic",
        "anxiety attack",
        "panik",
        "angst",
        "heart racing",
        "kan ikke puste",
    )
    lowered = problem.lower()
    if not any(marker in lowered for marker in panic_markers):
        return None

    answer = (
        "Panic protocol activated: you are safe, this is a stress surge, and we handle it "
        "methodically. Start with grounding right now, then slow breathing, then reality "
        "checks."
    )
    details = [
        "Grounding now: use 5-4-3-2-1, cold water on face/wrists for 30s, or describe one object in forensic detail.",
        "Breathing: inhale 4, hold 4, exhale 6, hold 2. Repeat 6-8 rounds. Longer exhales help your body downshift.",
        "Reality checks: 'This feels awful but not dangerous.' 'It always peaks and passes.' 'Adrenaline cannot harm me.'",
        "Body reset: progressive muscle relaxation from feet to face, tense 5 seconds and release 10 seconds.",
        "Engage attention: familiar music, simple rule-based game, or predictable low-stress content (no news/suspense).",
        "If prescribed for panic, take medication exactly as directed—tools are not failure.",
        "Emergency line: seek urgent help for new crushing chest pain, fainting, one-sided weakness, confusion, persistent severe symptoms, or self-harm thoughts.",
        "Aftercare: eat, hydrate, avoid caffeine/alcohol for 24h, protect sleep, do gentle movement, and reduce stress load.",
    ]
    return Solution(kind="Panic Support", answer=answer, details=details)


def solve_problem(problem: str) -> Solution:
    """Attempt to solve a problem using available solvers."""

    for solver in (_solve_math, _solve_anagram, _solve_panic_support):
        solution = solver(problem)
        if solution:
            return solution
    return _brainstorm_steps(problem)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="A joyful assistant that tackles small problems with gusto!",
    )
    parser.add_argument(
        "--prompt",
        action="store_true",
        help="Turn a few words into a fully structured creative prompt for iOS web.",
    )
    parser.add_argument(
        "--medium",
        choices=["photo", "video", "music", "art", "poem", "auto"],
        default="auto",
        help="Choose the creative medium for prompt mode. Defaults to auto-detect.",
    )
    parser.add_argument(
        "--workflow",
        action="store_true",
        help="Show the multidisciplinary workflow plan for a day (default: today).",
    )
    parser.add_argument(
        "--day",
        default=None,
        help="Day to plan for in --workflow mode (English/Norwegian name, or 'today').",
    )
    parser.add_argument(
        "--week",
        action="store_true",
        help="Show the full weekly overview across all seven disciplines.",
    )
    parser.add_argument(
        "--monthly",
        action="store_true",
        help="Show the monthly review checklist that ties the disciplines together.",
    )
    parser.add_argument(
        "problem",
        nargs=argparse.REMAINDER,
        help="Tell me your problem to solve. Quotes are encouraged for multi-word puzzles!",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    if args.week:
        print(build_weekly_overview().format())
        return 0

    if args.monthly:
        print(build_monthly_review().format())
        return 0

    if args.workflow:
        print(build_workflow_plan(args.day).format())
        return 0

    if not args.problem:
        parser.print_help()
        return 0

    problem_text = " ".join(args.problem)

    if args.prompt:
        medium_hint = None if args.medium == "auto" else args.medium
        solution = build_creative_prompt(problem_text, medium_hint=medium_hint)
    else:
        solution = solve_problem(problem_text)
    print(solution.format())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
