"""
A playful problem-solving CLI application.
"""
from __future__ import annotations

import argparse
import ast
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


_WEEKLY_FOCUS: Tuple[Tuple[str, str, str], ...] = (
    ("monday", "Investing & Markets", "investing"),
    ("tuesday", "Design & Visual Art", "art"),
    ("wednesday", "Music & Video Production", "music_video"),
    ("thursday", "Writing & Manuscript", "writing"),
    ("friday", "Hunting & Field Craft", "hunting"),
    ("saturday", "Cross-Discipline Studio (flex/synthesis day)", None),
    ("sunday", "Review, Rebalance & Plan Next Loop", None),
)

_DAY_LOOKUP: Dict[str, Tuple[str, Optional[str]]] = {
    day: (label, discipline) for day, label, discipline in _WEEKLY_FOCUS
}

_DISCIPLINES: Dict[str, Dict[str, object]] = {
    "investing": {
        "label": "Investing & Markets (aksjer + verdiinvestering)",
        "daily_scan": [
            "Check pre-market headlines and macro calendar (rates, CPI, earnings due today).",
            "Scan watchlist for price/volume alerts and news triggers.",
        ],
        "deep_routine": [
            "Weekly: read one 10-K/10-Q or annual report in full; update the valuation model (DCF + margin of safety).",
            "Weekly: run a value screener (low P/E, low debt, durable moat) and add 1-2 names to the watchlist.",
            "Monthly: rebalance the portfolio against thesis drift; revisit the Graham/Munger checklist.",
            "Monthly: write a one-page investment journal entry per active position (thesis still true? what changed?).",
        ],
        "tools": ["Stock screener (Finviz/Stockopedia)", "Company filings (10-K/10-Q)", "Portfolio tracker", "Investment journal"],
    },
    "art": {
        "label": "Design & Visual Art",
        "daily_scan": [
            "Scroll one curated feed (Behance, ArtStation, Are.na) for 10-15 minutes.",
            "Save 2-3 references to a tagged moodboard (palette, technique, mood).",
        ],
        "deep_routine": [
            "Weekly: study one master or technique in depth; do a 30-60 minute study/sketch from it.",
            "Weekly: review your own portfolio against the moodboard for drift or new direction.",
            "Monthly: scan open calls, exhibitions, and submission deadlines relevant to your work.",
            "Monthly: archive and tag finished pieces; retire references that no longer inspire.",
        ],
        "tools": ["Are.na/Pinterest moodboards", "Behance/ArtStation", "Sketchbook", "Submission tracker"],
    },
    "music_video": {
        "label": "Music & Video",
        "daily_scan": [
            "Actively listen to one new track or reference scene; note one arrangement/edit technique.",
            "Skim a gear/plugin or editing-technique newsletter for 10 minutes.",
        ],
        "deep_routine": [
            "Weekly: produce or edit applying the one technique you logged that week.",
            "Weekly: review rough cuts/mixes against the reference folder for tone consistency.",
            "Monthly: publish/release one piece and review analytics from the prior release.",
            "Monthly: clean and tag the sample/footage library.",
        ],
        "tools": ["Spotify/Bandcamp release radar", "Reference track/footage folder", "DAW/NLE project templates", "Release analytics"],
    },
    "hunting": {
        "label": "Hunting & Field Craft",
        "daily_scan": [
            "Check weather, solunar/game-movement tables, and season/regulation status for 5-10 minutes.",
            "Log gear condition or maintenance needs.",
        ],
        "deep_routine": [
            "Weekly: study a map of the hunting area or plan/run a scouting trip.",
            "Weekly: check ballistics/zero, gear, and license/tag status.",
            "Monthly: review the harvest/sighting journal and update season planning.",
            "Monthly: renew licenses and audit gear inventory before the next outing.",
        ],
        "tools": ["Regulation & season calendar", "Weather/solunar app", "Topo/land maps", "Harvest journal"],
    },
    "writing": {
        "label": "Writing & Manuscript",
        "daily_scan": [
            "Morning pages: 10-15 minutes of free writing or journaling.",
            "Read 10-15 minutes of contemporary work; note one craft observation.",
        ],
        "deep_routine": [
            "Weekly: dedicated drafting/revision block on the current manuscript.",
            "Weekly: update the submission/query tracker and send at least one piece out.",
            "Monthly: full manuscript review against the outline or theme.",
            "Monthly: audit submissions for responses and follow-ups.",
        ],
        "tools": ["Notes app / commonplace book", "Reading log", "Submission tracker", "Manuscript outline"],
    },
}

_SYNERGY_MAP: Dict[str, Tuple[str, ...]] = {
    "investing": (
        "Investing -> Design: financial-report clarity and data visualization inform clean, minimalist layouts.",
        "Investing -> Writing: 'margin of safety' thinking becomes a useful revision filter — what's the weakest claim?",
    ),
    "art": (
        "Art -> Music/Video: a moodboard's palette and mood can seed a video's color grade or a track's tone.",
        "Art -> Writing: a visual reference can unlock the central image of a poem or scene.",
    ),
    "music_video": (
        "Music/Video -> Art: rhythm and pacing from editing can suggest composition and motion in a still piece.",
        "Music/Video -> Writing: a song's narrative arc can structure a chapter or short story.",
    ),
    "hunting": (
        "Hunting -> Art/Writing: terrain, light, and animal behavior in the field are direct sketch and essay material.",
        "Hunting -> Investing: patience and probabilistic thinking (reading sign, weighing odds) mirror value-investing discipline.",
    ),
    "writing": (
        "Writing -> Music/Video: lyrics or narration drafts can become a song's hook or a video's voiceover.",
        "Writing -> Investing: the discipline of a clear investment thesis improves the discipline of a clear logline.",
    ),
}


def build_weekly_plan() -> Solution:
    """Return the weekly rotation across all disciplines."""

    answer = "Six-day rotation, one discipline owns the spotlight each day, Sunday closes the loop."
    details = [f"{day.capitalize()}: {label}" for day, label, _ in _WEEKLY_FOCUS]
    return Solution(kind="Weekly Plan", answer=answer, details=details)


def build_daily_plan(day: Optional[str] = None) -> Solution:
    """Return an hour-by-hour template for a given weekday."""

    key = (day or "monday").strip().lower()
    if key not in _DAY_LOOKUP:
        raise ValueError(f"Unknown day '{day}'. Use a full weekday name like 'monday'.")
    label, discipline = _DAY_LOOKUP[key]

    if key == "sunday":
        blocks = [
            "09:00-10:00: Review the week — what shipped, what stalled, what surprised you.",
            "10:00-11:00: Portfolio/journal/manuscript admin catch-up across all five domains.",
            "11:00-12:00: Rebalance next week's loop — pick Saturday's flex focus and any deadlines.",
            "Afternoon: rest, light reading, no scheduled deep work.",
        ]
    elif key == "saturday":
        blocks = [
            "Morning: Daily Research Sweep (all five domains, 15 minutes each).",
            "Late morning-afternoon: open studio time — follow whichever discipline is pulling hardest this week.",
            "Evening: log one cross-discipline connection noticed during the open block.",
        ]
    else:
        primary = _DISCIPLINES[discipline]["label"] if discipline else label
        blocks = [
            "06:30-07:45: Daily Research Sweep across all five domains (15 min each).",
            "07:45-08:15: Journaling — capture overnight ideas, set 1-3 priorities for today.",
            f"09:00-12:00: Deep Work Block 1 — {primary} (today's primary focus).",
            "12:00-13:00: Break and movement.",
            f"13:00-15:00: Deep Work Block 2 — {primary} production/admin or a secondary discipline.",
            "15:00-15:30: Synergy break — write down one cross-discipline connection noticed today.",
            "15:30-17:00: Maintenance and admin (orders, gear log, submissions, correspondence).",
            "17:00-18:00: Physical reset or field time.",
            "19:00-20:30: Evening creative session (optional, passion-driven).",
        ]

    answer = f"{key.capitalize()} focus: {label}."
    return Solution(kind="Daily Plan", answer=answer, details=blocks)


def build_research_routine(discipline: Optional[str] = None) -> Solution:
    """Return the research routine for one discipline, or the daily cross-domain sweep if none given."""

    if discipline is None or discipline == "all":
        answer = "Daily cross-domain research sweep (~75-90 minutes, run every morning before deep work)."
        details = []
        for key, info in _DISCIPLINES.items():
            label = info["label"]
            for line in info["daily_scan"]:  # type: ignore[index]
                details.append(f"[{label}] {line}")
        return Solution(kind="Research Routine", answer=answer, details=details)

    if discipline not in _DISCIPLINES:
        raise ValueError(f"Unknown discipline '{discipline}'. Choose one of: {', '.join(_DISCIPLINES)}.")

    info = _DISCIPLINES[discipline]
    answer = f"Research routine for {info['label']}."
    details = list(info["daily_scan"]) + list(info["deep_routine"])  # type: ignore[arg-type]
    details.append(f"Tools: {', '.join(info['tools'])}.")  # type: ignore[arg-type]
    return Solution(kind="Research Routine", answer=answer, details=details)


def build_synergy_brief(discipline: Optional[str] = None) -> Solution:
    """Return cross-discipline inspiration links, optionally filtered to one discipline as the source."""

    if discipline is None or discipline == "all":
        answer = "Cross-discipline synergy map — how each field feeds the others."
        details = [line for lines in _SYNERGY_MAP.values() for line in lines]
        return Solution(kind="Synergy Brief", answer=answer, details=details)

    if discipline not in _SYNERGY_MAP:
        raise ValueError(f"Unknown discipline '{discipline}'. Choose one of: {', '.join(_SYNERGY_MAP)}.")

    answer = f"Synergies flowing out of {_DISCIPLINES[discipline]['label']}."
    details = list(_SYNERGY_MAP[discipline])
    return Solution(kind="Synergy Brief", answer=answer, details=details)


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
        choices=["plan", "daily", "research", "synergy"],
        default=None,
        help=(
            "Multidisciplinary workflow system: 'plan' for the weekly rotation, "
            "'daily' for an hour-by-hour template (use --day), "
            "'research' for the cross-domain sweep or one discipline's routine (use --discipline), "
            "'synergy' for cross-discipline inspiration links (use --discipline)."
        ),
    )
    parser.add_argument(
        "--day",
        choices=[day for day, _, _ in _WEEKLY_FOCUS],
        default=None,
        help="Weekday to use with --workflow daily. Defaults to monday.",
    )
    parser.add_argument(
        "--discipline",
        choices=list(_DISCIPLINES) + ["all"],
        default=None,
        help="Discipline to use with --workflow research/synergy. Defaults to all.",
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

    if args.workflow == "plan":
        solution = build_weekly_plan()
    elif args.workflow == "daily":
        solution = build_daily_plan(args.day)
    elif args.workflow == "research":
        solution = build_research_routine(args.discipline)
    elif args.workflow == "synergy":
        solution = build_synergy_brief(args.discipline)
    elif not args.problem:
        parser.print_help()
        return 0
    else:
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
