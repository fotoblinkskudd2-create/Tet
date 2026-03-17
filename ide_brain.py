"""
IDE Smart Ideas Generator — the brain that pumps out actionable coding ideas.

Analyzes code snippets, file paths, and project descriptions to produce
contextual suggestions across categories: refactoring, testing, performance,
security, architecture, and more.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class Idea:
    """A single smart idea produced by the brain."""

    category: str
    title: str
    description: str
    priority: str  # "high", "medium", "low"
    tags: List[str] = field(default_factory=list)

    def format(self) -> str:
        tag_str = f" [{', '.join(self.tags)}]" if self.tags else ""
        return (
            f"[{self.priority.upper()}] {self.category}: {self.title}{tag_str}\n"
            f"  → {self.description}"
        )


@dataclass
class IdeaReport:
    """A collection of ideas returned by the brain for a single analysis."""

    context_summary: str
    ideas: List[Idea]

    def format(self) -> str:
        header = f"=== IDE Brain Report ===\nContext: {self.context_summary}\n"
        if not self.ideas:
            return header + "\nNo ideas generated — the code looks solid!"
        body = "\n\n".join(idea.format() for idea in self.ideas)
        stats = _build_stats(self.ideas)
        return f"{header}\n{body}\n\n--- {stats} ---"


def _build_stats(ideas: List[Idea]) -> str:
    total = len(ideas)
    by_priority = {}
    for idea in ideas:
        by_priority[idea.priority] = by_priority.get(idea.priority, 0) + 1
    parts = [f"{total} idea{'s' if total != 1 else ''}"]
    for p in ("high", "medium", "low"):
        if p in by_priority:
            parts.append(f"{by_priority[p]} {p}")
    return " | ".join(parts)


# ---------------------------------------------------------------------------
# Pattern detectors — each inspects code and returns ideas
# ---------------------------------------------------------------------------

_PatternDetector = type(lambda code, ctx: [])  # just for readability


def _detect_long_functions(code: str, _ctx: str) -> List[Idea]:
    """Flag functions that are suspiciously long."""
    ideas: List[Idea] = []
    # Match Python def or JS/TS function declarations
    func_pattern = re.compile(
        r"(?:def |function |(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\()"
    )
    lines = code.split("\n")
    func_starts: List[Tuple[int, str]] = []
    for i, line in enumerate(lines):
        m = func_pattern.search(line)
        if m:
            name_match = re.search(r"(?:def |function )\s*(\w+)", line)
            name = name_match.group(1) if name_match else f"anonymous@L{i + 1}"
            func_starts.append((i, name))

    for idx, (start, name) in enumerate(func_starts):
        end = func_starts[idx + 1][0] if idx + 1 < len(func_starts) else len(lines)
        length = end - start
        if length > 40:
            ideas.append(Idea(
                category="Refactoring",
                title=f"Break up '{name}' ({length} lines)",
                description=(
                    f"Function '{name}' spans ~{length} lines. Extract cohesive blocks "
                    "into smaller helper functions to improve readability and testability."
                ),
                priority="medium",
                tags=["maintainability", "readability"],
            ))
    return ideas


def _detect_missing_error_handling(code: str, _ctx: str) -> List[Idea]:
    """Spot risky patterns that lack error handling."""
    ideas: List[Idea] = []

    # Bare except clauses
    if re.search(r"except\s*:", code):
        ideas.append(Idea(
            category="Error Handling",
            title="Replace bare except clauses",
            description=(
                "Bare 'except:' catches everything including KeyboardInterrupt and "
                "SystemExit. Catch specific exceptions instead."
            ),
            priority="high",
            tags=["reliability", "best-practice"],
        ))

    # File opens without context manager
    if re.search(r"\bopen\s*\(", code) and not re.search(r"with\s+open\s*\(", code):
        ideas.append(Idea(
            category="Error Handling",
            title="Use context managers for file I/O",
            description=(
                "File opens without 'with' statements risk resource leaks. "
                "Wrap file operations in context managers."
            ),
            priority="medium",
            tags=["reliability", "resource-management"],
        ))

    return ideas


def _detect_security_issues(code: str, _ctx: str) -> List[Idea]:
    """Identify common security anti-patterns."""
    ideas: List[Idea] = []

    # eval / exec usage
    if re.search(r"\b(?:eval|exec)\s*\(", code):
        ideas.append(Idea(
            category="Security",
            title="Audit eval/exec usage",
            description=(
                "Dynamic code execution with eval() or exec() can enable injection "
                "attacks. Use safer alternatives like ast.literal_eval or dedicated parsers."
            ),
            priority="high",
            tags=["security", "injection"],
        ))

    # Hardcoded secrets patterns
    secret_pattern = re.compile(
        r"""(?:password|secret|api_key|token|credentials)\s*=\s*['"][^'"]{4,}['"]""",
        re.IGNORECASE,
    )
    if secret_pattern.search(code):
        ideas.append(Idea(
            category="Security",
            title="Move secrets to environment variables",
            description=(
                "Hardcoded credentials detected. Store secrets in environment "
                "variables or a secrets manager, never in source code."
            ),
            priority="high",
            tags=["security", "secrets"],
        ))

    # SQL string concatenation
    if re.search(r"""(?:execute|query)\s*\(\s*(?:f['"]|['"].*?\%|['"].*?\+)""", code):
        ideas.append(Idea(
            category="Security",
            title="Use parameterized queries",
            description=(
                "String concatenation in SQL queries enables injection. "
                "Use parameterized queries or an ORM instead."
            ),
            priority="high",
            tags=["security", "sql-injection"],
        ))

    return ideas


def _detect_performance_opportunities(code: str, _ctx: str) -> List[Idea]:
    """Find common performance improvements."""
    ideas: List[Idea] = []

    # Repeated list comprehension that could be a generator
    if code.count("[") > 10 and re.search(r"\blen\(\[.*?for\s", code):
        ideas.append(Idea(
            category="Performance",
            title="Use generators instead of list comprehensions for counting",
            description=(
                "len([x for x in ...]) builds a full list just to count it. "
                "Use sum(1 for x in ...) instead."
            ),
            priority="low",
            tags=["performance", "memory"],
        ))

    # Nested loops that might benefit from sets
    nested_loop = re.compile(r"for\s+\w+\s+in\s+.*:\s*\n\s+for\s+\w+\s+in\s+")
    if nested_loop.search(code):
        ideas.append(Idea(
            category="Performance",
            title="Consider set lookups for nested iterations",
            description=(
                "Nested loops can be O(n*m). If the inner loop is a membership check, "
                "convert the collection to a set for O(1) lookups."
            ),
            priority="medium",
            tags=["performance", "algorithms"],
        ))

    # String concatenation in loops
    if re.search(r"for\s+.*:[\s\S]{0,200}\+\s*=\s*['\"]", code):
        ideas.append(Idea(
            category="Performance",
            title="Use join() instead of string concatenation in loops",
            description=(
                "Repeated string concatenation with += in a loop is O(n^2). "
                "Collect parts in a list and use ''.join() at the end."
            ),
            priority="medium",
            tags=["performance", "strings"],
        ))

    return ideas


def _detect_testing_opportunities(code: str, ctx: str) -> List[Idea]:
    """Suggest testing improvements."""
    ideas: List[Idea] = []

    # Functions without corresponding tests
    func_names = re.findall(r"def (\w+)\s*\(", code)
    public_funcs = [f for f in func_names if not f.startswith("_")]
    if public_funcs and "test" not in ctx.lower():
        ideas.append(Idea(
            category="Testing",
            title=f"Add tests for {len(public_funcs)} public function(s)",
            description=(
                f"Public functions found: {', '.join(public_funcs[:5])}"
                f"{'...' if len(public_funcs) > 5 else ''}. "
                "Each public function should have at least one test covering "
                "the happy path and one for edge cases."
            ),
            priority="medium",
            tags=["testing", "coverage"],
        ))

    # Magic numbers
    magic_nums = re.findall(r"(?<!=\s)(?<!\w)\b(\d{2,})\b(?!\s*[=:])", code)
    unique_magic = set(magic_nums) - {"10", "100", "1000", "0", "1", "2"}
    if len(unique_magic) > 3:
        ideas.append(Idea(
            category="Refactoring",
            title="Extract magic numbers into named constants",
            description=(
                f"Found {len(unique_magic)} distinct numeric literals. "
                "Named constants improve readability and make tests easier to maintain."
            ),
            priority="low",
            tags=["readability", "maintainability"],
        ))

    return ideas


def _detect_architecture_ideas(code: str, ctx: str) -> List[Idea]:
    """Suggest architectural improvements."""
    ideas: List[Idea] = []

    # God class / module detection: too many classes or functions
    class_count = len(re.findall(r"^class\s+\w+", code, re.MULTILINE))
    func_count = len(re.findall(r"^def\s+\w+", code, re.MULTILINE))

    if class_count > 5:
        ideas.append(Idea(
            category="Architecture",
            title=f"Split module — {class_count} classes detected",
            description=(
                "This module has many classes. Consider splitting into separate "
                "modules by responsibility (e.g., models, services, handlers)."
            ),
            priority="medium",
            tags=["architecture", "single-responsibility"],
        ))

    if func_count > 15:
        ideas.append(Idea(
            category="Architecture",
            title=f"Organize {func_count} functions into logical groups",
            description=(
                "Large flat modules become hard to navigate. Group related functions "
                "into classes or split into sub-modules by domain."
            ),
            priority="low",
            tags=["architecture", "organization"],
        ))

    # Circular-ish import hints
    import_count = len(re.findall(r"^(?:from|import)\s+", code, re.MULTILINE))
    if import_count > 15:
        ideas.append(Idea(
            category="Architecture",
            title=f"Review {import_count} imports for dependency hygiene",
            description=(
                "A high import count can signal tight coupling. Check for "
                "circular dependencies and consider dependency injection."
            ),
            priority="low",
            tags=["architecture", "coupling"],
        ))

    return ideas


def _detect_documentation_gaps(code: str, _ctx: str) -> List[Idea]:
    """Spot missing docstrings on public interfaces."""
    ideas: List[Idea] = []

    # Public functions without docstrings
    public_no_doc = re.findall(
        r"^def ([a-zA-Z]\w*)\s*\([^)]*\)\s*(?:->.*?)?:\s*\n\s+(?!\"\"\")",
        code,
        re.MULTILINE,
    )
    if len(public_no_doc) > 2:
        ideas.append(Idea(
            category="Documentation",
            title=f"Add docstrings to {len(public_no_doc)} public functions",
            description=(
                f"Functions without docstrings: {', '.join(public_no_doc[:5])}"
                f"{'...' if len(public_no_doc) > 5 else ''}. "
                "Brief docstrings help IDE tooltips and future collaborators."
            ),
            priority="low",
            tags=["documentation", "developer-experience"],
        ))

    # Public classes without docstrings
    classes_no_doc = re.findall(
        r"^class ([A-Z]\w*)[^:]*:\s*\n\s+(?!\"\"\")",
        code,
        re.MULTILINE,
    )
    if classes_no_doc:
        ideas.append(Idea(
            category="Documentation",
            title=f"Document {len(classes_no_doc)} class(es)",
            description=(
                f"Classes without docstrings: {', '.join(classes_no_doc[:5])}. "
                "A one-liner describing purpose and key behavior goes a long way."
            ),
            priority="low",
            tags=["documentation"],
        ))

    return ideas


def _detect_type_hint_opportunities(code: str, _ctx: str) -> List[Idea]:
    """Suggest adding type annotations where missing."""
    ideas: List[Idea] = []

    untyped_funcs = re.findall(
        r"^def (\w+)\s*\([^)]*\)\s*:\s*$",
        code,
        re.MULTILINE,
    )
    public_untyped = [f for f in untyped_funcs if not f.startswith("_")]
    if len(public_untyped) > 2:
        ideas.append(Idea(
            category="Type Safety",
            title=f"Add type hints to {len(public_untyped)} functions",
            description=(
                f"Functions without return-type annotations: "
                f"{', '.join(public_untyped[:5])}"
                f"{'...' if len(public_untyped) > 5 else ''}. "
                "Type hints enable better IDE autocompletion and catch bugs early."
            ),
            priority="low",
            tags=["type-safety", "developer-experience"],
        ))

    return ideas


# ---------------------------------------------------------------------------
# Contextual idea generators — ideas from description, not code
# ---------------------------------------------------------------------------

_DOMAIN_IDEAS: Dict[str, List[Idea]] = {
    "api": [
        Idea(
            category="Architecture",
            title="Add request validation middleware",
            description="Validate request bodies/params at the boundary with schemas (e.g., Pydantic, Zod) to fail fast.",
            priority="high",
            tags=["api", "validation"],
        ),
        Idea(
            category="Performance",
            title="Implement response caching",
            description="Cache GET responses with appropriate TTLs to reduce DB load and improve latency.",
            priority="medium",
            tags=["api", "caching"],
        ),
        Idea(
            category="Security",
            title="Add rate limiting",
            description="Protect endpoints from abuse with rate limiting per IP or API key.",
            priority="high",
            tags=["api", "security"],
        ),
    ],
    "database": [
        Idea(
            category="Performance",
            title="Add database indexes for frequent queries",
            description="Identify slow queries and add composite indexes on commonly filtered/sorted columns.",
            priority="high",
            tags=["database", "performance"],
        ),
        Idea(
            category="Architecture",
            title="Use migrations for schema changes",
            description="Track all schema changes in versioned migration files for reproducible deployments.",
            priority="medium",
            tags=["database", "devops"],
        ),
    ],
    "frontend": [
        Idea(
            category="Performance",
            title="Lazy-load heavy components",
            description="Use dynamic imports / React.lazy for routes and heavy widgets to reduce initial bundle size.",
            priority="medium",
            tags=["frontend", "performance"],
        ),
        Idea(
            category="Testing",
            title="Add component integration tests",
            description="Test user flows with a tool like Testing Library to catch regressions in UI behavior.",
            priority="medium",
            tags=["frontend", "testing"],
        ),
    ],
    "auth": [
        Idea(
            category="Security",
            title="Implement token refresh flow",
            description="Short-lived access tokens + refresh tokens limit exposure if a token is compromised.",
            priority="high",
            tags=["auth", "security"],
        ),
        Idea(
            category="Security",
            title="Add brute-force protection",
            description="Lock accounts or add exponential backoff after repeated failed login attempts.",
            priority="high",
            tags=["auth", "security"],
        ),
    ],
    "cli": [
        Idea(
            category="Developer Experience",
            title="Add shell completions",
            description="Generate bash/zsh/fish completions so users can tab-complete commands and options.",
            priority="low",
            tags=["cli", "dx"],
        ),
        Idea(
            category="Architecture",
            title="Use a plugin system for extensibility",
            description="Let users add custom commands or solvers via a plugin directory or entry points.",
            priority="medium",
            tags=["cli", "extensibility"],
        ),
    ],
}

_DOMAIN_KEYWORDS: Dict[str, Tuple[str, ...]] = {
    "api": ("api", "endpoint", "rest", "graphql", "route", "request", "response"),
    "database": ("database", "db", "sql", "query", "migration", "schema", "table"),
    "frontend": ("frontend", "react", "component", "ui", "css", "html", "dom", "render"),
    "auth": ("auth", "login", "signup", "token", "jwt", "session", "password"),
    "cli": ("cli", "command", "argparse", "terminal", "flag", "option"),
}


def _detect_domain_ideas(ctx: str) -> List[Idea]:
    """Match context keywords to domain-specific idea packs."""
    lowered = ctx.lower()
    ideas: List[Idea] = []
    seen_domains = set()
    for domain, keywords in _DOMAIN_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            if domain not in seen_domains:
                seen_domains.add(domain)
                ideas.extend(_DOMAIN_IDEAS[domain])
    return ideas


# ---------------------------------------------------------------------------
# The Brain — main entry point
# ---------------------------------------------------------------------------

# All pattern detectors that analyze source code
_CODE_DETECTORS = [
    _detect_long_functions,
    _detect_missing_error_handling,
    _detect_security_issues,
    _detect_performance_opportunities,
    _detect_testing_opportunities,
    _detect_architecture_ideas,
    _detect_documentation_gaps,
    _detect_type_hint_opportunities,
]


def generate_ideas(
    code: Optional[str] = None,
    context: str = "",
    max_ideas: int = 20,
) -> IdeaReport:
    """Analyze code and/or context and generate smart ideas.

    Parameters
    ----------
    code : str, optional
        Source code to analyze for patterns and anti-patterns.
    context : str
        Free-text description of what you're building (e.g. "REST API for
        user management with JWT auth").
    max_ideas : int
        Maximum number of ideas to return, ordered by priority.
    """
    ideas: List[Idea] = []

    # Run code detectors if code is provided
    if code and code.strip():
        for detector in _CODE_DETECTORS:
            ideas.extend(detector(code, context))

    # Run domain-based idea generation from context
    combined_ctx = f"{context} {code or ''}"
    ideas.extend(_detect_domain_ideas(combined_ctx))

    # Deduplicate by title
    seen_titles: set = set()
    unique: List[Idea] = []
    for idea in ideas:
        if idea.title not in seen_titles:
            seen_titles.add(idea.title)
            unique.append(idea)

    # Sort by priority: high > medium > low
    priority_order = {"high": 0, "medium": 1, "low": 2}
    unique.sort(key=lambda i: priority_order.get(i.priority, 3))

    # Trim to max
    unique = unique[:max_ideas]

    summary = context.strip() if context.strip() else "Code analysis"
    if code and not context.strip():
        line_count = len(code.strip().split("\n"))
        summary = f"Analyzed {line_count} lines of code"

    return IdeaReport(context_summary=summary, ideas=unique)


def generate_ideas_from_file(filepath: str, context: str = "") -> IdeaReport:
    """Convenience wrapper: read a file and generate ideas."""
    with open(filepath, "r") as f:
        code = f.read()
    file_ctx = f"{context} (file: {filepath})" if context else f"file: {filepath}"
    return generate_ideas(code=code, context=file_ctx)
