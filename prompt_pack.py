"""A massive, curated prompt pack for coding agents (Codex & Claude Code).

This module turns a single library of high-quality engineering prompts into
agent-tuned, ready-to-paste briefs. Each base prompt is framed differently for
each agent:

* ``codex``       -> surgical, diff-first, minimal-chatter framing.
* ``claude-code`` -> plan-first, tool-aware, test-and-verify framing.

The same library powers the CLI (``app.py --pack ...``) and the generated
``PROMPT_PACK.md`` document, so there is a single source of truth.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Agent profiles
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class AgentProfile:
    """How a base prompt should be framed for a specific coding agent."""

    key: str
    label: str
    preamble: str
    style: Tuple[str, ...]


AGENT_PROFILES: Dict[str, AgentProfile] = {
    "codex": AgentProfile(
        key="codex",
        label="Codex",
        preamble=(
            "You are Codex working in this repository. Act autonomously, keep "
            "chatter to a minimum, and return a tight unified diff."
        ),
        style=(
            "Make the smallest change that fully solves the task.",
            "Match the surrounding code style; do not reformat untouched lines.",
            "Show the patch and a one-line summary—skip the play-by-play.",
            "If a command is needed to verify, state the exact command.",
        ),
    ),
    "claude-code": AgentProfile(
        key="claude-code",
        label="Claude Code",
        preamble=(
            "You are Claude Code working in this repository. Investigate before "
            "editing, use your tools, and verify the result."
        ),
        style=(
            "Read the relevant files first; ground every change in what you find.",
            "Lay out a short plan, then implement it step by step.",
            "Run tests/linters and report the actual output, not assumptions.",
            "Surface anything surprising instead of silently working around it.",
        ),
    ),
}

DEFAULT_AGENTS: Tuple[str, ...] = ("codex", "claude-code")


# ---------------------------------------------------------------------------
# Prompt library
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PackPrompt:
    """A single base prompt that can be rendered for any supported agent."""

    id: str
    title: str
    category: str
    intent: str
    body: str
    tags: Tuple[str, ...] = field(default_factory=tuple)
    agents: Tuple[str, ...] = DEFAULT_AGENTS


def _p(
    id: str,
    title: str,
    category: str,
    intent: str,
    body: str,
    tags: Iterable[str] = (),
    agents: Iterable[str] = DEFAULT_AGENTS,
) -> PackPrompt:
    return PackPrompt(
        id=id,
        title=title,
        category=category,
        intent=intent,
        body=" ".join(body.split()),
        tags=tuple(tags),
        agents=tuple(agents),
    )


# The library is deliberately large ("massivt"): broad coverage of the work a
# coding agent is asked to do, organized by category for easy filtering.
PROMPT_LIBRARY: Tuple[PackPrompt, ...] = (
    # -- Planning & exploration -------------------------------------------
    _p(
        "plan-feature", "Plan a feature", "planning",
        "Turn a feature request into an actionable plan.",
        """Explore the codebase and produce an implementation plan for: {{TASK}}.
        List the files you would touch, the order of changes, edge cases, and how
        you will test it. Call out risks and open questions before writing code.""",
        tags=("plan", "design"),
    ),
    _p(
        "explore-unknown", "Map an unfamiliar codebase", "planning",
        "Build a mental model of a new repo or module.",
        """I am new to this code. Give me a guided tour of {{AREA}}: the entry
        points, the main data flow, key abstractions, and where the important
        logic lives. Reference files as path:line so I can jump to them.""",
        tags=("onboarding", "explain"),
    ),
    _p(
        "spike-options", "Compare approaches", "planning",
        "Weigh design options before committing.",
        """For {{GOAL}}, propose 2-3 viable approaches. For each: a one-line
        summary, the main trade-offs, effort, and blast radius. End with a single
        recommendation and why. Do not write code yet.""",
        tags=("design", "trade-offs"),
    ),

    # -- Scaffolding & generation -----------------------------------------
    _p(
        "scaffold-module", "Scaffold a module", "scaffolding",
        "Create a new module with sensible structure.",
        """Create a new {{LANGUAGE}} module for {{PURPOSE}}. Follow the existing
        project conventions for layout, naming, and error handling. Include a
        minimal public API and a docstring/header explaining usage.""",
        tags=("create", "boilerplate"),
    ),
    _p(
        "scaffold-cli", "Add a CLI command", "scaffolding",
        "Wire a new subcommand into an existing CLI.",
        """Add a CLI command {{COMMAND}} that {{BEHAVIOR}}. Reuse the existing
        argument-parsing setup, validate inputs, print helpful errors, and update
        the help text. Add a usage example to the README.""",
        tags=("cli", "create"),
    ),
    _p(
        "scaffold-endpoint", "Add an API endpoint", "scaffolding",
        "Add a route end to end.",
        """Add an endpoint {{METHOD}} {{PATH}} that {{BEHAVIOR}}. Wire routing,
        validation, the handler, and the response shape. Reuse existing auth and
        error-handling middleware, and add a test covering success and one
        failure case.""",
        tags=("api", "backend", "create"),
    ),

    # -- Refactoring ------------------------------------------------------
    _p(
        "refactor-clarity", "Refactor for clarity", "refactor",
        "Improve readability without changing behavior.",
        """Refactor {{TARGET}} to be clearer and easier to maintain without
        changing its behavior. Improve naming, reduce nesting, and remove
        duplication. Keep the public interface stable and ensure tests still
        pass.""",
        tags=("cleanup", "readability"),
    ),
    _p(
        "extract-function", "Extract a function", "refactor",
        "Pull tangled logic into a named unit.",
        """Extract the logic in {{LOCATION}} into a well-named function with a
        focused signature. Replace the inline code with a call, keep behavior
        identical, and add a short docstring describing inputs and outputs.""",
        tags=("cleanup", "extract"),
    ),
    _p(
        "dedupe", "Remove duplication", "refactor",
        "Consolidate copy-pasted logic.",
        """Find the duplicated logic around {{TOPIC}} and consolidate it into a
        single reusable helper. Update all call sites, keep behavior identical,
        and confirm with tests.""",
        tags=("cleanup", "DRY"),
    ),
    _p(
        "modernize", "Modernize legacy code", "refactor",
        "Bring old code up to current idioms.",
        """Modernize {{TARGET}} to current {{LANGUAGE}} idioms and the project's
        conventions (types, error handling, async if appropriate). Preserve
        behavior, do it in reviewable steps, and keep tests green.""",
        tags=("legacy", "cleanup"),
    ),

    # -- Debugging --------------------------------------------------------
    _p(
        "debug-repro", "Reproduce and fix a bug", "debugging",
        "Diagnose a defect from a report.",
        """Bug report: {{SYMPTOM}}. Reproduce it, find the root cause (not just
        the symptom), and fix it. Explain the cause in one or two sentences, then
        add a regression test that fails before the fix and passes after.""",
        tags=("bug", "root-cause"),
    ),
    _p(
        "debug-trace", "Trace a value", "debugging",
        "Follow data through the system.",
        """Trace how {{VALUE}} flows from {{SOURCE}} to {{DESTINATION}}. Identify
        where it becomes wrong or unexpected, citing files as path:line, and
        propose the minimal fix.""",
        tags=("bug", "trace"),
    ),
    _p(
        "debug-flaky", "Stabilize a flaky test", "debugging",
        "Make an intermittent test reliable.",
        """The test {{TEST}} is flaky. Determine why it is non-deterministic
        (timing, ordering, shared state, randomness, network) and make it
        reliable without weakening what it verifies.""",
        tags=("test", "flaky"),
    ),
    _p(
        "debug-stacktrace", "Explain an error", "debugging",
        "Decode an error/stack trace.",
        """Here is an error: {{ERROR}}. Explain what it means, the most likely
        cause in this codebase, and the fix. If more than one cause is plausible,
        rank them.""",
        tags=("error", "explain"),
    ),

    # -- Testing ----------------------------------------------------------
    _p(
        "test-coverage", "Add missing tests", "testing",
        "Cover untested behavior.",
        """Add tests for {{TARGET}}. Cover the happy path, edge cases, and at
        least one failure mode. Match the project's existing test style and
        framework, and make each test name describe the behavior it checks.""",
        tags=("test", "coverage"),
    ),
    _p(
        "test-from-bug", "Write a regression test", "testing",
        "Lock in a fix.",
        """Write a focused regression test for {{BUG}} that fails on the current
        (buggy) behavior and passes once fixed. Keep it small and tied to the
        specific defect.""",
        tags=("test", "regression"),
    ),
    _p(
        "test-edge", "Brainstorm edge cases", "testing",
        "Find the cases that break things.",
        """For {{FUNCTION}}, list the edge cases and adversarial inputs worth
        testing (empty, boundary, malformed, concurrent, huge). Then implement
        tests for the highest-value ones.""",
        tags=("test", "edge-cases"),
    ),

    # -- Code review ------------------------------------------------------
    _p(
        "review-diff", "Review the current diff", "code-review",
        "Self-review before pushing.",
        """Review the current diff for correctness bugs, missed edge cases, and
        simplifications. Be specific: cite path:line and suggest the concrete
        change. Prioritize real issues over style nits.""",
        tags=("review", "quality"),
    ),
    _p(
        "review-security", "Security review", "code-review",
        "Audit a change for vulnerabilities.",
        """Review {{TARGET}} for security issues: injection, authz/authn gaps,
        unsafe deserialization, secrets in code, SSRF, path traversal, and unsafe
        defaults. For each finding give severity, the risk, and the fix.""",
        tags=("security", "review"),
    ),
    _p(
        "review-pr", "Summarize a PR", "code-review",
        "Make a change easy to review.",
        """Summarize the changes on this branch for a reviewer: what changed and
        why, the risk areas, how it was tested, and anything that needs a closer
        look. Keep it concise.""",
        tags=("review", "pr"),
    ),

    # -- Documentation ----------------------------------------------------
    _p(
        "doc-readme", "Update the README", "documentation",
        "Keep user-facing docs accurate.",
        """Update the README to reflect {{CHANGE}}. Keep it accurate and concise,
        include a runnable usage example, and don't document behavior that does
        not exist.""",
        tags=("docs", "readme"),
    ),
    _p(
        "doc-api", "Document an API", "documentation",
        "Write reference docs for an interface.",
        """Document the public API of {{TARGET}}: each function/endpoint, its
        parameters, return value, errors, and a short example. Match the existing
        docstring/comment style.""",
        tags=("docs", "api"),
    ),
    _p(
        "doc-explain", "Explain code to a teammate", "documentation",
        "Produce a plain-language explanation.",
        """Explain how {{TARGET}} works in plain language for a teammate who is
        new to it. Cover the purpose, the flow, and one gotcha. Reference
        path:line for the key spots.""",
        tags=("docs", "explain"),
    ),

    # -- Performance ------------------------------------------------------
    _p(
        "perf-profile", "Find a bottleneck", "performance",
        "Locate the slow part before optimizing.",
        """{{OPERATION}} is slow. Identify the likely bottleneck (algorithmic
        complexity, N+1 queries, excess allocation, I/O), measure or reason about
        it, and propose the highest-impact fix before changing code.""",
        tags=("performance", "profiling"),
    ),
    _p(
        "perf-optimize", "Optimize a hot path", "performance",
        "Speed up code without breaking it.",
        """Optimize {{TARGET}} for {{METRIC}} (latency/throughput/memory). Keep
        behavior identical and readable; justify each change with why it helps.
        Confirm correctness with tests.""",
        tags=("performance", "optimize"),
    ),

    # -- Security ---------------------------------------------------------
    _p(
        "sec-harden", "Harden an input boundary", "security",
        "Validate and sanitize untrusted input.",
        """Harden {{BOUNDARY}} against untrusted input: validate and sanitize,
        enforce limits, fail closed, and avoid leaking internals in errors. Add
        tests for malicious and malformed inputs.""",
        tags=("security", "validation"),
    ),
    _p(
        "sec-secrets", "Find and fix leaked secrets", "security",
        "Remove credentials from code.",
        """Scan {{SCOPE}} for hardcoded secrets, tokens, or credentials. For each,
        move it to configuration/secret storage, document the change, and note
        whether the secret must be rotated.""",
        tags=("security", "secrets"),
    ),

    # -- Migration & upgrades --------------------------------------------
    _p(
        "migrate-dep", "Upgrade a dependency", "migration",
        "Move to a new version safely.",
        """Upgrade {{DEPENDENCY}} from {{FROM}} to {{TO}}. Read the changelog for
        breaking changes, update call sites, fix deprecations, and run the test
        suite. Summarize what changed and any follow-ups.""",
        tags=("upgrade", "dependencies"),
    ),
    _p(
        "migrate-api", "Migrate to a new API", "migration",
        "Swap one interface for another.",
        """Migrate usages of {{OLD}} to {{NEW}} across the codebase. Do it
        incrementally, keep behavior equivalent, update tests, and confirm
        nothing still depends on the old path.""",
        tags=("migration", "refactor"),
    ),
    _p(
        "migrate-schema", "Write a schema migration", "migration",
        "Change a data model safely.",
        """Write a migration for {{CHANGE}} to the data model. Make it reversible
        if possible, preserve existing data, and update the code that reads/writes
        the affected fields. Note any backfill or downtime considerations.""",
        tags=("database", "migration"),
    ),

    # -- Git & workflow ---------------------------------------------------
    _p(
        "git-commit", "Write a commit message", "git",
        "Describe a change clearly.",
        """Write a clear commit message for the staged changes: a concise subject
        line and a body explaining the what and why. Follow the repo's commit
        conventions if any exist.""",
        tags=("git", "workflow"),
    ),
    _p(
        "git-bisect", "Find the breaking commit", "git",
        "Locate a regression in history.",
        """A regression appeared: {{SYMPTOM}}. Help me find the commit that
        introduced it using git history/bisect reasoning, then explain the change
        that caused it and how to fix it.""",
        tags=("git", "regression"),
    ),

    # -- Frontend ---------------------------------------------------------
    _p(
        "fe-component", "Build a UI component", "frontend",
        "Create a reusable component.",
        """Build a {{FRAMEWORK}} component {{NAME}} that {{BEHAVIOR}}. Match the
        existing component patterns, keep it accessible (labels, keyboard, focus),
        and handle loading/empty/error states.""",
        tags=("frontend", "ui"),
    ),
    _p(
        "fe-a11y", "Fix accessibility issues", "frontend",
        "Make the UI usable for everyone.",
        """Audit {{TARGET}} for accessibility issues (semantics, labels, contrast,
        keyboard navigation, focus management, ARIA) and fix them. Explain each
        fix and how to verify it.""",
        tags=("frontend", "accessibility"),
    ),

    # -- Backend & data ---------------------------------------------------
    _p(
        "be-query", "Fix an N+1 / slow query", "backend",
        "Make data access efficient.",
        """{{QUERY_AREA}} is doing too many or too slow queries. Identify the
        problem (N+1, missing index, over-fetching), fix it with batching/joins/
        indexing, and confirm the result set is unchanged.""",
        tags=("backend", "database"),
    ),
    _p(
        "be-idempotent", "Make an operation idempotent", "backend",
        "Avoid duplicate side effects.",
        """Make {{OPERATION}} safe to retry: ensure it is idempotent so repeated
        calls do not double-apply side effects. Handle the concurrent/duplicate
        case and add a test that retries it.""",
        tags=("backend", "reliability"),
    ),

    # -- DevOps & CI ------------------------------------------------------
    _p(
        "ci-fix", "Fix a failing CI job", "devops",
        "Get the pipeline green.",
        """CI job {{JOB}} is failing. Read the logs, find the actual cause (not
        just the failing step), and fix it. Distinguish a real code failure from a
        flaky/infra issue and say which it is.""",
        tags=("ci", "devops"),
    ),
    _p(
        "ci-add", "Add a CI check", "devops",
        "Automate a quality gate.",
        """Add a CI step that runs {{CHECK}} on every push/PR. Fit the existing
        pipeline, fail fast with a clear message, and cache where it speeds things
        up.""",
        tags=("ci", "automation"),
    ),

    # -- AI / LLM integration --------------------------------------------
    _p(
        "ai-integrate", "Integrate an LLM call", "ai-integration",
        "Add a model-backed feature safely.",
        """Add a feature that uses an LLM to {{TASK}}. Keep the prompt and model
        config in one place, handle timeouts/retries/rate limits, validate the
        model output before using it, and make the call testable with a mock.""",
        tags=("ai", "integration"),
    ),
    _p(
        "ai-prompt", "Tune a prompt", "ai-integration",
        "Improve an existing prompt.",
        """Improve the prompt at {{LOCATION}} for {{GOAL}}. Make the instructions
        unambiguous, specify the output format, add guardrails for bad input, and
        explain each change you made.""",
        tags=("ai", "prompting"),
    ),
)


# ---------------------------------------------------------------------------
# Query & rendering helpers
# ---------------------------------------------------------------------------

def categories() -> List[str]:
    """Return the sorted list of available categories."""

    seen: List[str] = []
    for prompt in PROMPT_LIBRARY:
        if prompt.category not in seen:
            seen.append(prompt.category)
    return sorted(seen)


def resolve_agent(agent: Optional[str]) -> Optional[str]:
    """Normalize a user-supplied agent name to a profile key."""

    if not agent:
        return None
    lowered = agent.lower().strip().replace("_", "-").replace(" ", "-")
    aliases = {
        "codex": "codex",
        "openai": "codex",
        "claude": "claude-code",
        "claude-code": "claude-code",
        "claudecode": "claude-code",
        "cc": "claude-code",
    }
    return aliases.get(lowered)


def iter_prompts(
    agent: Optional[str] = None,
    category: Optional[str] = None,
) -> List[PackPrompt]:
    """Return prompts filtered by agent and/or category."""

    results: List[PackPrompt] = []
    for prompt in PROMPT_LIBRARY:
        if agent and agent not in prompt.agents:
            continue
        if category and prompt.category != category:
            continue
        results.append(prompt)
    return results


def render_prompt(prompt: PackPrompt, agent: str) -> str:
    """Render a single base prompt as an agent-tuned, paste-ready brief."""

    profile = AGENT_PROFILES[agent]
    style_lines = "\n".join(f"- {line}" for line in profile.style)
    return (
        f"[{profile.label}] {prompt.title}\n"
        f"{profile.preamble}\n\n"
        f"Task:\n{prompt.body}\n\n"
        f"Working style:\n{style_lines}"
    )


def render_pack(
    agent: Optional[str] = None,
    category: Optional[str] = None,
) -> str:
    """Render the (optionally filtered) pack for one or all agents."""

    agent_keys: Tuple[str, ...] = (agent,) if agent else DEFAULT_AGENTS
    blocks: List[str] = []
    for prompt in iter_prompts(category=category):
        for key in agent_keys:
            if key in prompt.agents:
                blocks.append(render_prompt(prompt, key))
    return "\n\n".join(blocks)


def export_markdown() -> str:
    """Render the entire pack as a Markdown document."""

    lines: List[str] = [
        "# Massive Prompt Pack — Codex & Claude Code",
        "",
        "A curated, agent-tuned set of engineering prompts. Each base prompt is "
        "framed for both **Codex** (surgical, diff-first) and **Claude Code** "
        "(plan-first, verify-with-tools). Replace `{{PLACEHOLDERS}}` with your "
        "specifics before sending.",
        "",
        f"_Total base prompts: {len(PROMPT_LIBRARY)} across "
        f"{len(categories())} categories._",
        "",
        "## Contents",
        "",
    ]
    for category in categories():
        anchor = category.replace(" ", "-")
        count = len(iter_prompts(category=category))
        lines.append(f"- [{category}](#{anchor}) ({count})")
    lines.append("")

    for category in categories():
        lines.append(f"## {category}")
        lines.append("")
        for prompt in iter_prompts(category=category):
            lines.append(f"### {prompt.title}")
            lines.append("")
            lines.append(f"_{prompt.intent}_")
            if prompt.tags:
                lines.append("")
                lines.append("Tags: " + ", ".join(f"`{t}`" for t in prompt.tags))
            lines.append("")
            for key in prompt.agents:
                profile = AGENT_PROFILES[key]
                lines.append(f"**{profile.label}**")
                lines.append("")
                lines.append("```text")
                lines.append(render_prompt(prompt, key))
                lines.append("```")
                lines.append("")
    return "\n".join(lines).rstrip() + "\n"
