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


_STRATEGY_MAX_LEVEL = 10
_STRATEGY_BASE_VALUE = 100
_STRATEGY_BIRTHDAY_BUFF = 1.5
_STRATEGY_SPLIT_PATTERN = re.compile(r"\s*(?:,|;|/|&|\+|\n|\band\b|\bog\b)\s*", re.IGNORECASE)
_STRATEGY_QUANTITY_PATTERN = re.compile(r"^(\d+)\s*[xX]?\s+(.+)$")


@dataclass
class StrategyElement:
    """A single maximized game element in an optimization plan."""

    name: str
    quantity: int
    max_level: int
    final_value: float
    roi: float


def _format_number(value: float) -> str:
    """Render a value as a clean, thousands-separated integer."""

    return f"{int(round(value)):,}"


def _parse_strategy_elements(text: str) -> List[Tuple[str, int]]:
    """Split free-form input into (name, quantity) pairs."""

    parsed: List[Tuple[str, int]] = []
    for chunk in _STRATEGY_SPLIT_PATTERN.split(text):
        token = chunk.strip()
        if not token:
            continue
        match = _STRATEGY_QUANTITY_PATTERN.match(token)
        if match:
            quantity = max(int(match.group(1)), 1)
            name = match.group(2).strip()
        else:
            quantity = 1
            name = token
        if name:
            parsed.append((name, quantity))
    return parsed


def build_strategy_plan(text: str, birthday: bool = True) -> Solution:
    """Maximize every element in the input and rank them by ROI.

    Each element is simulated up to the maximum level, then boosted by a
    synergy multiplier (more elements reinforce each other) and an optional
    birthday buff. The result is an ROI-ordered build plan.
    """

    if not text or not text.strip():
        raise ValueError("Please list the units, resources, or buildings to optimize.")

    parsed = _parse_strategy_elements(text)
    if not parsed:
        raise ValueError("Please list the units, resources, or buildings to optimize.")

    synergy = 1 + 0.1 * (len(parsed) - 1)
    birthday_buff = _STRATEGY_BIRTHDAY_BUFF if birthday else 1.0

    elements: List[StrategyElement] = []
    for name, quantity in parsed:
        base_value = _STRATEGY_BASE_VALUE * quantity
        maxed_value = base_value * _STRATEGY_MAX_LEVEL
        final_value = maxed_value * synergy * birthday_buff
        upgrade_cost = base_value * (_STRATEGY_MAX_LEVEL - 1)
        roi = final_value / upgrade_cost if upgrade_cost else final_value
        elements.append(
            StrategyElement(
                name=name,
                quantity=quantity,
                max_level=_STRATEGY_MAX_LEVEL,
                final_value=final_value,
                roi=roi,
            )
        )

    elements.sort(key=lambda element: element.final_value, reverse=True)
    total_value = sum(element.final_value for element in elements)

    answer_bits = [
        f"Maxed {len(elements)} element(s) to level {_STRATEGY_MAX_LEVEL} "
        f"for a total portfolio value of {_format_number(total_value)}."
    ]
    if birthday:
        answer_bits.append("Birthday buff active: +50% on every maxed value. 🎂")
    answer = " ".join(answer_bits)

    details: List[str] = []
    for rank, element in enumerate(elements, start=1):
        qty_label = f"x{element.quantity} " if element.quantity > 1 else ""
        details.append(
            f"#{rank} {qty_label}{element.name}: Lv.{element.max_level} -> "
            f"value {_format_number(element.final_value)} (ROI {element.roi:.1f}x)"
        )
    details.append(
        f"Build order follows ROI: start with '{elements[0].name}' for the fastest "
        "payoff, then work down the list to compound the synergy bonus."
    )
    return Solution(kind="Strategy", answer=answer, details=details)


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
        "--strategy",
        action="store_true",
        help="Optimize a list of game elements to max level and rank them by ROI.",
    )
    parser.add_argument(
        "--no-birthday",
        action="store_true",
        help="Disable the +50%% birthday buff in strategy mode.",
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

    if args.prompt:
        medium_hint = None if args.medium == "auto" else args.medium
        solution = build_creative_prompt(problem_text, medium_hint=medium_hint)
    elif args.strategy:
        solution = build_strategy_plan(problem_text, birthday=not args.no_birthday)
    else:
        solution = solve_problem(problem_text)
    print(solution.format())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
