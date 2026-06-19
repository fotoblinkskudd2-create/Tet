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


_COMMITMENT_FLAVORS: Dict[str, Dict[str, str]] = {
    "event": {
        "label": "arrangementet",
        "headline": "Dette er ikke et vanlig arrangement. Dette er en sosial kontrakt.",
        "default_trigger": "kvelden før kl 20",
        "default_action": "pakker det jeg trenger og legger ut en kort story",
    },
    "dugnad": {
        "label": "dugnaden",
        "headline": "Dette er ikke en vanlig dugnad. Dette er en sosial kontrakt.",
        "default_trigger": "kvelden før",
        "default_action": "legger frem klær og verktøy og setter alarm",
    },
    "fest": {
        "label": "festen",
        "headline": "Dette er ikke en vanlig fest. Dette er en sosial kontrakt.",
        "default_trigger": "to timer før",
        "default_action": "begynner å gjøre meg klar og sier ifra i tråden",
    },
    "aksjon": {
        "label": "aksjonen",
        "headline": "Dette er ikke en vanlig aksjon. Dette er en sosial kontrakt.",
        "default_trigger": "morgenen samme dag",
        "default_action": "møter opp på avtalt sted og melder meg klar",
    },
}

_DEFAULT_COMMITMENT_FLAVOR = "event"


def _resolve_commitment_flavor(kind: Optional[str]) -> Tuple[str, Dict[str, str]]:
    key = (kind or _DEFAULT_COMMITMENT_FLAVOR).lower().strip()
    if key not in _COMMITMENT_FLAVORS:
        key = _DEFAULT_COMMITMENT_FLAVOR
    return key, _COMMITMENT_FLAVORS[key]


def build_commitment_post(
    activity: str,
    *,
    kind: Optional[str] = None,
    when: Optional[str] = None,
    referee: Optional[str] = None,
    stake: Optional[str] = None,
) -> Solution:
    """Build a ready-to-paste Facebook "social contract" post.

    Combines proven behavioral-psychology mechanisms—public commitment,
    implementation intentions (if-then), an accountability referee, a stake
    (loss aversion), identity framing and social proof—so people are far more
    likely to actually show up instead of flaking.
    """

    if not activity or not activity.strip():
        raise ValueError("Please describe the activity people are committing to.")

    _, flavor = _resolve_commitment_flavor(kind)
    activity_text = activity.strip().rstrip(".")
    when_text = (when or "[dato + klokkeslett]").strip()
    referee_text = (referee or "[tagg en venn]").strip()
    stake_text = (
        stake.strip()
        if stake and stake.strip()
        else "en offentlig unnskyldning i denne tråden"
    )

    post_lines = [
        flavor["headline"],
        "Kun de som committer seg 100 % er velkomne. Kommenter med denne malen:",
        "",
        f'"Jeg committer meg 100 % til {activity_text} ({when_text}).',
        f'Hvis {flavor["default_trigger"]}, så {flavor["default_action"]}.',
        f"Min referee er {referee_text}, som kaller meg ut offentlig hvis jeg flaker.",
        "Jeg er en som holder det jeg lover.",
        f'Flaker jeg, poster jeg {stake_text}."',
        "",
        f"De andre planlegger rundt deg fordi de stoler på at du kommer. "
        f"Allerede flere committed med referee—oppdater Committed-listen under.",
    ]
    answer = "\n".join(post_lines)

    details = [
        "Offentlig commitment (Cialdini): det folk skriver offentlig, lever de opp til for å være konsistente.",
        "If-then-plan (implementation intentions): en konkret trigger+handling dobler sjansen for oppmøte.",
        "Referee: en navngitt ansvarlig-venn gir sosialt press og øker suksess kraftig.",
        "Stake (loss aversion): en liten konsekvens svir mer enn en gevinst frister.",
        "Identitet: 'Jeg er en som holder det jeg lover' kobler oppmøtet til selvbildet.",
        "Sosial proof: vis en levende Committed-liste og snitt-oppmøte for å sette normen.",
        "Vær ærlig om mekanismene, hold tonen lett, og tell lovet vs. møtte opp til neste gang.",
    ]
    return Solution(kind="Commitment Contract", answer=answer, details=details)


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
        "--commit",
        action="store_true",
        help="Build a copy-paste Facebook 'social contract' post that boosts real attendance.",
    )
    parser.add_argument(
        "--kind",
        choices=["event", "dugnad", "fest", "aksjon"],
        default="event",
        help="Tone of the commitment post. Defaults to event.",
    )
    parser.add_argument(
        "--when",
        help="When the activity happens, e.g. 'lørdag 21. juni kl 10'.",
    )
    parser.add_argument(
        "--referee",
        help="Name/handle of the accountability referee who calls out flaking.",
    )
    parser.add_argument(
        "--stake",
        help="Consequence for flaking, e.g. '200 kr til veldedighet + offentlig unnskyldning'.",
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

    if not args.problem:
        parser.print_help()
        return 0

    problem_text = " ".join(args.problem)

    if args.commit:
        solution = build_commitment_post(
            problem_text,
            kind=args.kind,
            when=args.when,
            referee=args.referee,
            stake=args.stake,
        )
    elif args.prompt:
        medium_hint = None if args.medium == "auto" else args.medium
        solution = build_creative_prompt(problem_text, medium_hint=medium_hint)
    else:
        solution = solve_problem(problem_text)
    print(solution.format())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
