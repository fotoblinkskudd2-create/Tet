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


# ---------------------------------------------------------------------------
# Decision Oracle
#
# Most "decision helpers" pretend to know what you should do with your life.
# This one is more honest and far more useful: it audits *how you framed the
# question*, names the cognitive traps hiding in your own wording, classifies
# the choice as a reversible "two-way door" or a permanent "one-way door", and
# walks the options through four mental models the clearest thinkers actually
# use. You leave with a sharper question and a concrete next move, not a
# fortune-cookie verdict.
# ---------------------------------------------------------------------------

_DECISION_MARKERS: Tuple[str, ...] = (
    "should i",
    "shall i",
    "skal jeg",
    "bør jeg",
    "burde jeg",
    "can't decide",
    "cant decide",
    "kan ikke bestemme",
    "klarer ikke bestemme",
    "torn between",
    "decide between",
    "velge mellom",
    " vs ",
    " versus ",
)

# Each trap: (label, detector keywords, the insight, the witty fix).
_DECISION_TRAPS: Tuple[Tuple[str, Tuple[str, ...], str, str], ...] = (
    (
        "Binary trap",
        ("either", " or ", " vs ", " versus ", "eller"),
        "You framed this as 'this OR that'. Research on real decisions shows "
        "roughly 1 in 3 'whether-or-not' choices has a hidden third option you "
        "never listed.",
        "Spend 60 seconds inventing an option C (often 'do both, smaller' or "
        "'neither, yet'). The Oracle has never regretted that minute.",
    ),
    (
        "Sunk-cost trap",
        ("already", "invested", "wasted", "so far", "this far", "spent so much",
         "kastet bort", "brukt så mye", "kommet så langt"),
        "You're weighing what you've already spent. That money, time and pride "
        "are gone whatever you choose — the universe will not refund them.",
        "Ask the cleaner question: 'Knowing what I know now, would I START this "
        "today?' If no, the past is just lobbying for the future.",
    ),
    (
        "Should-pressure trap",
        ("supposed to", "expected to", "everyone says", "everyone thinks",
         "people think", "my parents want", "my boss wants", "forventer",
         "alle sier", "alle mener", "burde egentlig"),
        "The phrasing leans on what others expect — 'should' words usually "
        "smuggle in someone else's values wearing your voice.",
        "Re-read the question with 'want to' instead of 'should'. If it stops "
        "making sense, you've found whose decision this really is.",
    ),
    (
        "False-urgency trap",
        ("now", "right away", "immediately", "asap", "today", "tonight",
         "med en gang", "nå", "i dag", "i kveld"),
        "Urgency is the natural enemy of judgement, and most urgency is "
        "manufactured by whoever benefits from your haste.",
        "Name the thing that ACTUALLY breaks if you decide in 48 hours. If you "
        "can't, you just bought yourself 48 hours of better thinking.",
    ),
    (
        "Fear-framing trap",
        ("afraid", "scared", "risk losing", "what if i lose", "don't want to lose",
         "redd", "tør ikke", "frykter", "miste"),
        "You framed this around what you might lose. Humans feel losses about "
        "twice as hard as equivalent gains, so this lens quietly tilts the scale.",
        "Re-describe each option by what you stand to GAIN. Then decide which "
        "framing is the lie — usually neither, but now you can see both.",
    ),
    (
        "Permission-seeking trap",
        ("right?", "isn't it", "ikke sant", "just need to know", "tell me it's ok",
         "am i crazy"),
        "The phrasing reads like you want permission, not analysis. That's "
        "fine — but it's a different errand.",
        "If you already know the answer and just want a witness: consider this "
        "your witness. Now go.",
    ),
)

# Words that smell like an irreversible, costly-to-undo "one-way door".
_ONE_WAY_MARKERS: Tuple[str, ...] = (
    "quit", "resign", "drop out", "move", "relocate", "emigrate", "sell",
    "marry", "divorce", "break up", "tattoo", "delete", "burn", "have a kid",
    "have kids", "get pregnant", "amputate", "si opp", "flytte", "skilsmisse",
    "selge", "slette", "få barn",
)


def _clean_option(text: str) -> str:
    cleaned = text.strip().strip("?.!,; ").strip()
    for lead in ("to ", "i ", "should i ", "just "):
        if cleaned.lower().startswith(lead):
            cleaned = cleaned[len(lead):]
            break
    return cleaned[:1].upper() + cleaned[1:] if cleaned else cleaned


def _extract_options(question: str) -> List[str]:
    text = question.strip().rstrip("?.! ").strip()
    lowered = text.lower()
    for lead in (
        "should i ", "shall i ", "do i ", "skal jeg ", "bør jeg ",
        "burde jeg ", "i can't decide whether to ", "i can't decide if i should ",
        "can't decide whether to ", "torn between ",
    ):
        if lowered.startswith(lead):
            text = text[len(lead):]
            break

    patterns = (
        r"\bbetween\s+(.+?)\s+and\s+(.+)$",
        r"^(.+?)\s+(?:vs\.?|versus)\s+(.+)$",
        r"^(.+?)\s+or\s+(.+)$",
        r"^(.+?)\s+eller\s+(.+)$",
    )
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            options = [_clean_option(match.group(1)), _clean_option(match.group(2))]
            return [opt for opt in options if opt]
    cleaned = _clean_option(text)
    return [cleaned] if cleaned else []


def _detect_decision_traps(question: str) -> List[str]:
    lowered = f" {question.lower()} "
    findings: List[str] = []
    for label, keywords, insight, fix in _DECISION_TRAPS:
        if any(keyword in lowered for keyword in keywords):
            findings.append(f"{label} detected — {insight} Fix: {fix}")
    return findings


def _door_type(question: str) -> str:
    lowered = question.lower()
    return "one-way" if any(m in lowered for m in _ONE_WAY_MARKERS) else "two-way"


def _decision_verdict(door: str, traps_found: bool) -> str:
    if door == "one-way":
        base = (
            "This smells like a ONE-WAY DOOR — expensive or impossible to undo. "
            "The Oracle's ruling: slow down and buy information. Sleep on it twice, "
            "run the premortem below, and find the cheapest way to 'try before you "
            "buy' (a trial, a conversation, a tiny pilot)."
        )
    else:
        base = (
            "This looks like a TWO-WAY DOOR — cheap to reverse. The Oracle's ruling: "
            "stop deliberating and run a small experiment this week. With reversible "
            "choices, the cost of deciding slowly is almost always higher than the "
            "cost of deciding wrong."
        )
    if traps_found:
        base += " But first, clear the traps below — your question is arguing with itself."
    return base


def build_decision_oracle(question: str) -> Solution:
    """Audit a decision's framing and walk it through real mental models."""

    if not question or not question.strip():
        raise ValueError("Tell the Oracle the decision you're chewing on.")

    options = _extract_options(question)
    traps = _detect_decision_traps(question)
    door = _door_type(question)

    answer = _decision_verdict(door, bool(traps))

    details: List[str] = []

    if len(options) >= 2:
        details.append(
            f"The choice as posed: «{options[0]}»  vs  «{options[1]}». "
            "Hold these loosely — the best move is often a third option neither "
            "of them mentions."
        )
    elif options:
        details.append(
            f"The decision in focus: «{options[0]}». Name the real alternatives "
            "out loud; a choice with only one visible option isn't a choice, it's a fear."
        )

    details.extend(traps)

    # Four mental models, applied to whatever options we have.
    a = options[0] if options else "the choice"
    b = options[1] if len(options) >= 2 else "the alternative"

    details.append(
        "Regret-minimization (Bezos): picture yourself at 80, calm and honest. "
        f"Which do you regret NOT trying — {a.lower()} or {b.lower()}? Regret of "
        "omission outlasts regret of action almost every time."
    )
    details.append(
        "10/10/10: how will each option feel 10 minutes from now, 10 months from "
        "now, and 10 years from now? Decisions that look scary at 10 minutes and "
        "great at 10 years are usually the ones worth the flinch."
    )
    details.append(
        "Premortem (Gary Klein): fast-forward a year — your choice FAILED badly. "
        "Write the one-line headline explaining why. Then ask whether you can "
        "defuse that exact cause today. If you can, the fear was a to-do list in disguise."
    )
    details.append(
        "Weighted scoring (for the stubbornly close calls): list your top 3 "
        "criteria, weight them 1–5 by how much you truly care, score each option "
        "1–5 per criterion, multiply and sum. Watch your gut flinch at the winner "
        "— that flinch is data too."
    )
    details.append(
        "Reminder from the Oracle: a decision is a bet on the best information you "
        "have, not a promise about the future. Make it cleanly, write down WHY in "
        "one sentence, and let future-you grade the reasoning, not just the luck."
    )

    return Solution(kind="Decision Oracle", answer=answer, details=details)


def _solve_decision(problem: str) -> Optional[Solution]:
    """Route clearly decision-shaped questions to the Decision Oracle."""

    lowered = f" {problem.lower()} "
    if not any(marker in lowered for marker in _DECISION_MARKERS):
        return None
    return build_decision_oracle(problem)


def solve_problem(problem: str) -> Solution:
    """Attempt to solve a problem using available solvers."""

    for solver in (_solve_math, _solve_anagram, _solve_panic_support, _solve_decision):
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
        "--decide",
        action="store_true",
        help="Run a decision through the Decision Oracle: trap-scan, door-type, and four mental models.",
    )
    parser.add_argument(
        "--medium",
        choices=["photo", "video", "music", "art", "poem", "auto"],
        default="auto",
        help="Choose the creative medium for prompt mode. Defaults to auto-detect.",
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

    if args.decide:
        solution = build_decision_oracle(problem_text)
    elif args.prompt:
        medium_hint = None if args.medium == "auto" else args.medium
        solution = build_creative_prompt(problem_text, medium_hint=medium_hint)
    else:
        solution = solve_problem(problem_text)
    print(solution.format())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
