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

import theme_tracker


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


def solve_problem(problem: str) -> Solution:
    """Attempt to solve a problem using available solvers."""

    for solver in (_solve_math, _solve_anagram):
        solution = solver(problem)
        if solution:
            return solution
    return _brainstorm_steps(problem)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="A joyful assistant that tackles small problems with gusto!",
    )
    sub = parser.add_subparsers(dest="command")

    # Default solve mode (no subcommand required for backwards compat)
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
        "problem",
        nargs=argparse.REMAINDER,
        help="Tell me your problem to solve. Quotes are encouraged for multi-word puzzles!",
    )

    # --- theme subcommands ---
    theme_parser = sub.add_parser("theme", help="Set your one-word theme for the year.")
    theme_parser.add_argument("word", help="Your one-word theme (e.g. Focus, Momentum, Clarity).")
    theme_parser.add_argument("--year", type=int, default=2026, help="Year for the theme.")

    sub.add_parser("dashboard", help="Show your theme year dashboard.")

    exp_parser = sub.add_parser("experiment", help="Add a new experiment (max 3 active).")
    exp_parser.add_argument("name", help="Short name for the experiment.")
    exp_parser.add_argument("description", help="What you will test.")

    cp_parser = sub.add_parser("checkpoint", help="Record a checkpoint review for an experiment.")
    cp_parser.add_argument("experiment_index", type=int, help="Experiment number (1-based).")
    cp_parser.add_argument("label", choices=["30-day", "60-day", "90-day"])
    cp_parser.add_argument("result", help="What happened? Keep it honest.")

    ph_parser = sub.add_parser("powerhour", help="Log a Power Hour session.")
    ph_parser.add_argument("task", help="The needle-moving task you focused on.")
    ph_parser.add_argument("--outcome", default="", help="What you achieved.")

    reset_parser = sub.add_parser("reset", help="Log a weekly reset ritual.")
    reset_parser.add_argument("--wins", nargs="*", default=[], help="This week's wins.")
    reset_parser.add_argument("--losses", nargs="*", default=[], help="This week's losses.")
    reset_parser.add_argument("--priorities", nargs="*", default=[], help="Next week's top priorities.")
    reset_parser.add_argument("--notes", default="", help="Additional reflection notes.")

    energy_parser = sub.add_parser("energy", help="Log your energy level for the day.")
    energy_parser.add_argument("level", type=int, help="Energy 1-10.")
    energy_parser.add_argument("--givers", nargs="*", default=[], help="What gave you energy.")
    energy_parser.add_argument("--drains", nargs="*", default=[], help="What drained you.")
    energy_parser.add_argument("--sleep", type=float, default=0.0, help="Hours of sleep.")
    energy_parser.add_argument("--cold", action="store_true", help="Did cold exposure today.")
    energy_parser.add_argument("--movement", default="", help="Movement/exercise done.")

    goal_parser = sub.add_parser("goal", help="Add a core area goal.")
    goal_parser.add_argument(
        "area",
        choices=list(theme_tracker.CORE_AREAS),
        help="Which core area.",
    )
    goal_parser.add_argument("goal_text", help="The goal.")
    goal_parser.add_argument("--measurable", default="", help="How you will measure it.")

    sub.add_parser("trends", help="Show energy trends and insights.")

    return parser


def _handle_theme_commands(args: argparse.Namespace) -> int:
    """Dispatch theme-related subcommands. Returns exit code."""

    if args.command == "theme":
        ty = theme_tracker.create_theme(args.word, year=args.year)
        theme_tracker.save_theme(ty)
        print(f"Theme set: {ty.theme.upper()} for {ty.year}!")
        print(f"Now add up to 3 experiments with: python app.py experiment <name> <description>")
        return 0

    # All other commands need an existing theme
    ty = theme_tracker.load_theme()
    if ty is None:
        print("No theme set yet. Start with: python app.py theme <your-word>")
        return 1

    if args.command == "dashboard":
        print(theme_tracker.dashboard(ty))
        return 0

    if args.command == "experiment":
        exp = theme_tracker.add_experiment(ty, args.name, args.description)
        theme_tracker.save_theme(ty)
        active = [e for e in ty.experiments if e.status == "active"]
        print(f"Experiment added: {exp.name}")
        print(f"Active experiments: {len(active)}/3")
        return 0

    if args.command == "checkpoint":
        idx = args.experiment_index - 1
        if idx < 0 or idx >= len(ty.experiments):
            print(f"No experiment #{args.experiment_index}. You have {len(ty.experiments)} experiments.")
            return 1
        exp = ty.experiments[idx]
        exp.record_checkpoint(args.label, args.result)
        theme_tracker.save_theme(ty)
        print(f"Checkpoint '{args.label}' recorded for '{exp.name}'.")
        print(theme_tracker.experiment_report(exp))
        return 0

    if args.command == "powerhour":
        entry = theme_tracker.log_power_hour(ty, args.task, outcome=args.outcome)
        theme_tracker.save_theme(ty)
        print(f"Power Hour #{len(ty.power_hours)} logged: {entry.focus_task}")
        return 0

    if args.command == "reset":
        reset = theme_tracker.log_weekly_reset(
            ty, wins=args.wins, losses=args.losses,
            priorities=args.priorities, notes=args.notes,
        )
        theme_tracker.save_theme(ty)
        print(f"Weekly reset #{len(ty.weekly_resets)} recorded for week of {reset.week_of}.")
        return 0

    if args.command == "energy":
        entry = theme_tracker.log_energy(
            ty, level=args.level, givers=args.givers, drains=args.drains,
            sleep_hours=args.sleep, cold_exposure=args.cold, movement=args.movement,
        )
        theme_tracker.save_theme(ty)
        print(f"Energy logged: {entry.level}/10 on {entry.date}")
        return 0

    if args.command == "goal":
        cg = theme_tracker.add_core_goal(ty, args.area, args.goal_text, measurable=args.measurable)
        theme_tracker.save_theme(ty)
        print(f"Goal added to {cg.area}: {cg.goal}")
        return 0

    if args.command == "trends":
        print(theme_tracker.energy_trends(ty))
        return 0

    return 1


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    # Theme subcommands
    if args.command in (
        "theme", "dashboard", "experiment", "checkpoint",
        "powerhour", "reset", "energy", "goal", "trends",
    ):
        return _handle_theme_commands(args)

    # Original solve/prompt mode
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
