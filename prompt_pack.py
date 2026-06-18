"""A massive, ready-to-paste prompt pack for coding agents.

This module curates high-quality, copy-paste prompts tailored for two coding
agents:

* ``codex``       — OpenAI Codex / Codex CLI style: direct, spec-first prompts.
* ``claude-code`` — Claude Code style: plan-first prompts that lean on tools,
  file context, and verification.

The goal is breadth: dozens of categories, each with an agent-tailored
template, so a user can fill in one short topic and walk away with a polished
prompt (or a whole pack of them).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# --- Agent metadata --------------------------------------------------------

AGENTS: Tuple[str, ...] = ("codex", "claude-code")

_AGENT_ALIASES: Dict[str, str] = {
    "codex": "codex",
    "openai": "codex",
    "openai-codex": "codex",
    "gpt": "codex",
    "claude": "claude-code",
    "claude-code": "claude-code",
    "claudecode": "claude-code",
    "cc": "claude-code",
    "anthropic": "claude-code",
}

_AGENT_LABELS: Dict[str, str] = {
    "codex": "Codex",
    "claude-code": "Claude Code",
}

# A short "preamble" that reflects how each agent likes to be steered.
_AGENT_STYLE: Dict[str, str] = {
    "codex": (
        "Be precise and spec-first. State the exact files, signatures, and "
        "acceptance criteria. Prefer minimal, self-contained diffs and show the "
        "final code."
    ),
    "claude-code": (
        "Plan before editing. Explore the relevant files first, propose a short "
        "step list, then make the change and verify it by running tests or the "
        "app. Keep edits surgical and match the surrounding style."
    ),
}


# --- Prompt categories -----------------------------------------------------

@dataclass
class PromptRecipe:
    """One category of prompt with an agent-tailored body."""

    key: str
    title: str
    summary: str
    # Body templates keyed by agent. ``{topic}`` is substituted with the
    # user's seed (or a sensible placeholder).
    bodies: Dict[str, str] = field(default_factory=dict)
    tags: Tuple[str, ...] = ()


_PLACEHOLDER = "<describe the target here>"


def _recipes() -> Tuple[PromptRecipe, ...]:
    return (
        PromptRecipe(
            key="scaffold",
            title="Scaffold a new project or feature",
            summary="Stand up a fresh project or feature skeleton.",
            tags=("setup", "greenfield"),
            bodies={
                "codex": (
                    "Scaffold {topic}. Specify the directory layout, key files, "
                    "and entry point. Use idiomatic conventions for the stack, add "
                    "a minimal runnable example, and list the commands to install "
                    "and run it. Output the full file tree and the contents of "
                    "each new file."
                ),
                "claude-code": (
                    "I want to scaffold {topic}. First explore the repo to match "
                    "existing conventions, then propose a file tree and a short "
                    "step plan. After I confirm, create the files, wire up the "
                    "entry point, and run the project (or its tests) to prove it "
                    "boots."
                ),
            },
        ),
        PromptRecipe(
            key="implement",
            title="Implement a feature",
            summary="Add a new capability end to end.",
            tags=("feature", "build"),
            bodies={
                "codex": (
                    "Implement {topic}. List the functions/classes you will add "
                    "or change with their signatures, then provide the complete "
                    "diff. Include input validation and edge-case handling, and "
                    "note any new dependencies."
                ),
                "claude-code": (
                    "Implement {topic}. Start by reading the files this touches "
                    "and summarizing the current behavior. Lay out a plan, then "
                    "make the change incrementally, keeping each edit small. Add "
                    "or update tests and run them before you call it done."
                ),
            },
        ),
        PromptRecipe(
            key="debug",
            title="Debug a failure",
            summary="Find and fix the root cause of a bug.",
            tags=("bug", "fix"),
            bodies={
                "codex": (
                    "Debug {topic}. Reproduce the failure, identify the root "
                    "cause, and explain why it happens. Provide the minimal fix "
                    "as a diff and a regression test that fails before and passes "
                    "after."
                ),
                "claude-code": (
                    "Debug {topic}. Reproduce it first (run the failing command "
                    "and capture the output), then trace the root cause through "
                    "the code. Propose the fix, apply it, and re-run to confirm "
                    "green. Add a regression test that locks in the behavior."
                ),
            },
        ),
        PromptRecipe(
            key="refactor",
            title="Refactor without behavior change",
            summary="Improve structure while preserving behavior.",
            tags=("cleanup", "quality"),
            bodies={
                "codex": (
                    "Refactor {topic} without changing behavior. Describe the "
                    "code smells you see, then provide the refactored code as a "
                    "diff. Keep the public API stable and ensure all existing "
                    "tests still pass."
                ),
                "claude-code": (
                    "Refactor {topic} with no behavior change. Read the code and "
                    "the tests that cover it first. Make the refactor in small, "
                    "verifiable steps, running the test suite after each step so "
                    "we never drift from green."
                ),
            },
        ),
        PromptRecipe(
            key="test",
            title="Write tests",
            summary="Add focused, meaningful test coverage.",
            tags=("tests", "quality"),
            bodies={
                "codex": (
                    "Write tests for {topic}. Cover the happy path, boundary "
                    "conditions, and error cases. Use the project's existing test "
                    "framework and style, and output the complete test file."
                ),
                "claude-code": (
                    "Add tests for {topic}. Find the existing test files and "
                    "mirror their framework and conventions. Write happy-path, "
                    "edge-case, and failure tests, then run the suite and report "
                    "the results."
                ),
            },
        ),
        PromptRecipe(
            key="review",
            title="Review code",
            summary="Critique a change for bugs and quality.",
            tags=("review", "quality"),
            bodies={
                "codex": (
                    "Review {topic}. Flag correctness bugs, security issues, and "
                    "maintainability problems in priority order. For each, cite "
                    "the location and suggest a concrete fix."
                ),
                "claude-code": (
                    "Review {topic}. Read the diff and the surrounding code for "
                    "context. Report correctness bugs first, then quality and "
                    "simplification opportunities, with file:line references and "
                    "a suggested fix for each."
                ),
            },
        ),
        PromptRecipe(
            key="docs",
            title="Write documentation",
            summary="Document code, APIs, or usage.",
            tags=("docs", "writing"),
            bodies={
                "codex": (
                    "Document {topic}. Produce clear, accurate docs with a short "
                    "overview, usage examples, and parameter/return descriptions. "
                    "Match the project's existing documentation format."
                ),
                "claude-code": (
                    "Document {topic}. Read the code so the docs are accurate, "
                    "then write an overview, runnable usage examples, and "
                    "reference details. Update the README or docs files in place "
                    "and keep the tone consistent with what is already there."
                ),
            },
        ),
        PromptRecipe(
            key="optimize",
            title="Optimize performance",
            summary="Make code measurably faster or leaner.",
            tags=("performance",),
            bodies={
                "codex": (
                    "Optimize the performance of {topic}. Identify the bottleneck "
                    "with reasoning (or a benchmark), apply the optimization as a "
                    "diff, and state the expected complexity or speed improvement. "
                    "Do not change observable behavior."
                ),
                "claude-code": (
                    "Optimize {topic}. Measure first: run a benchmark or profile "
                    "to find the real hotspot. Apply the change, then re-measure "
                    "to prove the win and confirm tests still pass. Report before "
                    "and after numbers."
                ),
            },
        ),
        PromptRecipe(
            key="security",
            title="Security hardening",
            summary="Find and fix security weaknesses.",
            tags=("security",),
            bodies={
                "codex": (
                    "Audit {topic} for security issues (injection, authn/authz, "
                    "secrets, unsafe deserialization, input validation). List "
                    "findings by severity and provide patches as diffs."
                ),
                "claude-code": (
                    "Security-review {topic}. Read the relevant code paths, "
                    "enumerate concrete vulnerabilities with severity, and patch "
                    "the high-severity ones. Add tests that demonstrate the fix "
                    "where practical, and avoid introducing regressions."
                ),
            },
        ),
        PromptRecipe(
            key="migrate",
            title="Migrate or upgrade",
            summary="Move to a new version, library, or API.",
            tags=("migration", "upgrade"),
            bodies={
                "codex": (
                    "Migrate {topic}. Enumerate every breaking change, map old "
                    "usage to new, and provide the diff. Call out anything that "
                    "needs manual verification after the upgrade."
                ),
                "claude-code": (
                    "Migrate {topic}. Search the codebase for every affected "
                    "usage, plan the migration in stages, and apply it. Run the "
                    "build and tests after each stage and report what changed and "
                    "what still needs manual review."
                ),
            },
        ),
        PromptRecipe(
            key="explain",
            title="Explain a codebase",
            summary="Build a mental model of unfamiliar code.",
            tags=("understand", "onboarding"),
            bodies={
                "codex": (
                    "Explain {topic}. Describe the architecture, the main "
                    "components and how they interact, the data flow, and the key "
                    "entry points. Keep it concrete and reference real symbols."
                ),
                "claude-code": (
                    "Explain {topic}. Explore the repo, then give me a guided "
                    "tour: architecture overview, the most important files with "
                    "file:line pointers, the request/data flow, and where I "
                    "should start if I want to change behavior X."
                ),
            },
        ),
        PromptRecipe(
            key="ci",
            title="CI / build pipeline",
            summary="Create or fix continuous integration.",
            tags=("ci", "devops"),
            bodies={
                "codex": (
                    "Set up or fix CI for {topic}. Provide the pipeline config "
                    "with jobs for install, lint, test, and build. Make it cache "
                    "dependencies and fail fast, and output the full config file."
                ),
                "claude-code": (
                    "Set up or fix CI for {topic}. Inspect the project to detect "
                    "the toolchain, then write or repair the pipeline with lint, "
                    "test, and build stages. Explain how to run the same checks "
                    "locally and verify the config is valid."
                ),
            },
        ),
        PromptRecipe(
            key="git",
            title="Commit & PR hygiene",
            summary="Craft clean commits and pull requests.",
            tags=("git", "workflow"),
            bodies={
                "codex": (
                    "For {topic}, write a clear commit message (imperative "
                    "subject under 72 chars, body explaining what and why) and a "
                    "PR description with summary, rationale, and a test plan."
                ),
                "claude-code": (
                    "For {topic}, review the staged diff, group it into logical "
                    "commits with good messages, and draft a PR description with a "
                    "summary, the reasoning, and a concrete test plan reviewers "
                    "can follow."
                ),
            },
        ),
        PromptRecipe(
            key="api",
            title="Design or build an API",
            summary="Define endpoints, contracts, and handlers.",
            tags=("backend", "api"),
            bodies={
                "codex": (
                    "Design and implement an API for {topic}. Specify the routes, "
                    "request/response schemas, status codes, and error shapes, "
                    "then provide the handler code and validation as a diff."
                ),
                "claude-code": (
                    "Design and build an API for {topic}. Check how existing "
                    "routes are structured first, then define the contract "
                    "(routes, schemas, errors), implement the handlers to match "
                    "house style, and add tests that exercise each endpoint."
                ),
            },
        ),
        PromptRecipe(
            key="frontend",
            title="Build a UI component",
            summary="Create accessible, stateful UI.",
            tags=("frontend", "ui"),
            bodies={
                "codex": (
                    "Build a UI component for {topic}. Define the props/state, "
                    "handle loading and error states, and ensure accessibility "
                    "(labels, keyboard, focus). Output the component and a usage "
                    "example."
                ),
                "claude-code": (
                    "Build a UI component for {topic}. Match the existing "
                    "component patterns and styling system in the repo. Cover "
                    "loading/empty/error states and accessibility, then render or "
                    "test it to confirm it works."
                ),
            },
        ),
        PromptRecipe(
            key="database",
            title="Database & migrations",
            summary="Model data and write safe migrations.",
            tags=("database", "data"),
            bodies={
                "codex": (
                    "For {topic}, design the schema and write the migration. "
                    "Specify tables, columns, types, indexes, and constraints. "
                    "Provide both the up and down migration and note any data "
                    "backfill."
                ),
                "claude-code": (
                    "For {topic}, review the existing schema and migration style "
                    "first. Write a forward and reversible migration, add the "
                    "needed indexes/constraints, and describe how to apply and "
                    "roll it back safely."
                ),
            },
        ),
        PromptRecipe(
            key="typing",
            title="Add or tighten types",
            summary="Introduce or strengthen static typing.",
            tags=("types", "quality"),
            bodies={
                "codex": (
                    "Add or tighten types for {topic}. Annotate signatures, "
                    "remove unsafe casts/anys, and make the type checker pass. "
                    "Provide the diff and the command that proves it is clean."
                ),
                "claude-code": (
                    "Add or tighten types for {topic}. Run the type checker to "
                    "see the current state, then annotate incrementally, fixing "
                    "the errors it surfaces. Re-run until clean without weakening "
                    "real type safety."
                ),
            },
        ),
        PromptRecipe(
            key="logging",
            title="Logging & observability",
            summary="Add useful logs, metrics, and tracing.",
            tags=("observability", "ops"),
            bodies={
                "codex": (
                    "Add observability to {topic}. Insert structured logs at key "
                    "decision points, add metrics/timers for hot paths, and avoid "
                    "logging secrets. Provide the diff and a note on log levels."
                ),
                "claude-code": (
                    "Add observability to {topic}. Match the project's existing "
                    "logging setup, add structured logs and metrics at the right "
                    "boundaries, and avoid noise or leaking secrets. Show a sample "
                    "of the resulting log output."
                ),
            },
        ),
        PromptRecipe(
            key="cleanup",
            title="Dead code & dependency cleanup",
            summary="Remove cruft and unused dependencies.",
            tags=("cleanup",),
            bodies={
                "codex": (
                    "Clean up {topic}: remove dead code, unused imports, and "
                    "unreferenced dependencies. Confirm nothing else uses them and "
                    "provide the removal diff."
                ),
                "claude-code": (
                    "Clean up {topic}. Search for usages before deleting anything "
                    "to be sure it is truly dead, remove the cruft, and run the "
                    "build and tests to confirm nothing broke."
                ),
            },
        ),
        PromptRecipe(
            key="prototype",
            title="Quick prototype / spike",
            summary="Throwaway exploration to learn fast.",
            tags=("spike", "experiment"),
            bodies={
                "codex": (
                    "Prototype {topic}. Favor speed over polish: smallest runnable "
                    "thing that demonstrates the idea, with clear TODOs marking "
                    "what is stubbed. Output the runnable code."
                ),
                "claude-code": (
                    "Prototype {topic} as a quick spike. Keep it isolated from "
                    "production code, get something runnable fast, and run it so "
                    "we can see the result. Summarize what we learned and what a "
                    "real implementation would need."
                ),
            },
        ),
    )


# Build a lookup once at import time.
_RECIPES_BY_KEY: Dict[str, PromptRecipe] = {r.key: r for r in _recipes()}


# --- Public API ------------------------------------------------------------

def normalize_agent(agent: Optional[str]) -> Optional[str]:
    """Resolve a user-supplied agent label to a canonical id."""

    if not agent:
        return None
    key = agent.lower().strip().replace(" ", "-").replace("_", "-")
    return _AGENT_ALIASES.get(key)


def list_categories() -> List[Tuple[str, str]]:
    """Return ``(key, title)`` pairs for every category, in order."""

    return [(r.key, r.title) for r in _recipes()]


def category_keys() -> List[str]:
    """Return just the category keys, in order."""

    return [r.key for r in _recipes()]


def _fill(template: str, topic: Optional[str]) -> str:
    seed = (topic or "").strip().rstrip(".")
    return template.replace("{topic}", seed or _PLACEHOLDER)


def build_prompt(agent: str, category: str, topic: Optional[str] = None) -> str:
    """Build a single ready-to-paste prompt for ``agent`` and ``category``."""

    canonical = normalize_agent(agent)
    if canonical is None:
        raise ValueError(
            f"Unknown agent '{agent}'. Choose one of: {', '.join(AGENTS)}."
        )
    recipe = _RECIPES_BY_KEY.get(category)
    if recipe is None:
        raise ValueError(
            f"Unknown category '{category}'. Choose one of: "
            f"{', '.join(category_keys())}."
        )
    body = _fill(recipe.bodies[canonical], topic)
    style = _AGENT_STYLE[canonical]
    return f"{body}\n\nGuidance: {style}"


@dataclass
class PromptPack:
    """A rendered collection of prompts."""

    agents: Tuple[str, ...]
    entries: List[Tuple[str, str, str, str]]  # (agent, category, title, prompt)

    def format(self) -> str:
        labels = " + ".join(_AGENT_LABELS[a] for a in self.agents)
        header = f"🚀 Prompt pack ready for {labels} ({len(self.entries)} prompts) 🚀"
        chunks = [header]
        current_agent: Optional[str] = None
        for agent, _category, title, prompt in self.entries:
            if agent != current_agent:
                current_agent = agent
                chunks.append(f"\n=== {_AGENT_LABELS[agent]} ===")
            chunks.append(f"\n## {title}\n{prompt}")
        return "\n".join(chunks)


def build_prompt_pack(
    agent: str = "both",
    category: Optional[str] = None,
    topic: Optional[str] = None,
) -> PromptPack:
    """Build a (possibly massive) pack of prompts.

    Args:
        agent: ``"codex"``, ``"claude-code"``, ``"both"`` (or an alias).
        category: limit to one category; ``None`` emits every category.
        topic: optional seed substituted into each prompt.
    """

    if agent.lower().strip() in ("both", "all", "*"):
        agents: Tuple[str, ...] = AGENTS
    else:
        canonical = normalize_agent(agent)
        if canonical is None:
            raise ValueError(
                f"Unknown agent '{agent}'. Choose one of: "
                f"{', '.join(AGENTS)}, or 'both'."
            )
        agents = (canonical,)

    if category is not None and category not in _RECIPES_BY_KEY:
        raise ValueError(
            f"Unknown category '{category}'. Choose one of: "
            f"{', '.join(category_keys())}."
        )

    categories = [category] if category else category_keys()

    entries: List[Tuple[str, str, str, str]] = []
    for ag in agents:
        for cat in categories:
            recipe = _RECIPES_BY_KEY[cat]
            prompt = build_prompt(ag, cat, topic)
            entries.append((ag, cat, recipe.title, prompt))

    return PromptPack(agents=agents, entries=entries)
