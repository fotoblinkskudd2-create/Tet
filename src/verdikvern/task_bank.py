"""The KUTT24 task bank: 100 concrete, operator-runnable tasks.

Each task is a small, well-defined unit of value with explicit acceptance
criteria. The bank is the menu the operator (or the 24h loop) pulls from. Tasks
are intentionally concrete enough that the DOMMER cell can rule PASS/REWORK/BLOCK
without guessing at intent.

Tasks are grouped into ten categories of ten. Ids are stable: ``T001``..``T100``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

# Default acceptance criteria applied to every task on top of its specifics.
_BASE_ACCEPTANCE = [
    "Output is bound to the run card objective.",
    "No social-platform (X/Twitter) dependency introduced.",
    "Claims are concrete and checkable.",
]


@dataclass
class Task:
    id: str
    category: str
    prompt: str
    acceptance: List[str] = field(default_factory=list)

    @property
    def title(self) -> str:
        return self.prompt.split(".")[0]


# category -> list of (prompt, [extra acceptance])
_RAW: Dict[str, List] = {
    "ops": [
        ("Write a 24h operator runbook for the value engine with shift checkpoints.", ["Includes per-hour checkpoints", "Defines escalation owner"]),
        ("Define a health-check command that verifies memory store integrity.", ["Returns non-zero on corruption"]),
        ("Draft an incident template for a BLOCK verdict storm.", ["Has detection, triage, rollback sections"]),
        ("Specify backup and restore steps for the memory JSON store.", ["Restore is reversible and verified"]),
        ("Create a checklist for promoting an output from REWORK to PASS.", ["Each item is binary"]),
        ("Define rate limits for the run loop to avoid runaway cost.", ["States a hard cap per hour"]),
        ("Write a degraded-mode plan when the live LLM backend is unreachable.", ["Falls back to mock deterministically"]),
        ("Document log rotation and retention for cycle traces.", ["Retention period is explicit"]),
        ("Create a startup self-test the CLI runs before the first cycle.", ["Fails closed on missing config"]),
        ("Define an on-call handoff note format between operators.", ["Captures open BLOCKs"]),
    ],
    "content": [
        ("Produce a one-page status report suitable for DOCX rendering.", ["No layout garbage", "Sections: summary, risks, next"]),
        ("Write release notes for the current engine version.", ["Groups changes by category"]),
        ("Draft an executive summary of the last 24h of cycles.", ["Under 200 words"]),
        ("Generate a FAQ for new operators of the engine.", ["At least 8 Q/A pairs"]),
        ("Write a changelog entry template enforcing semantic grouping.", ["Has Added/Changed/Fixed/Removed"]),
        ("Produce a README section explaining the HENTER/BYGGER/DOMMER cells.", ["Explains the data flow"]),
        ("Draft a risk register with likelihood and impact columns.", ["At least 5 risks"]),
        ("Write a postmortem template for a failed promotion.", ["Blameless framing"]),
        ("Create a glossary of KUTT24 terms.", ["Defines PASS/REWORK/BLOCK"]),
        ("Generate a weekly value summary from cycle history.", ["Quantifies PASS rate"]),
    ],
    "code": [
        ("Implement a function that validates a RunCard has non-empty acceptance.", ["Has unit test", "Pure function"]),
        ("Add a JSON schema validator for persisted memory records.", ["Rejects unknown kinds"]),
        ("Write a retry helper with exponential backoff and a hard cap.", ["Cap is configurable", "No unbounded loop"]),
        ("Implement a deterministic id generator suitable for tests.", ["Collision-resistant"]),
        ("Add a CLI flag to export the last cycle as JSON.", ["Round-trips through contracts"]),
        ("Implement a memory compaction routine that merges duplicate records.", ["Idempotent"]),
        ("Write a function to diff two outputs and list changed claims.", ["Stable ordering"]),
        ("Add structured logging to the run loop.", ["One event per stage"]),
        ("Implement a dry-run mode that builds but never writes memory.", ["No side effects"]),
        ("Write a parser that turns operator text into an Input contract.", ["Rejects empty input"]),
    ],
    "research": [
        ("Summarize trade-offs between token-overlap and embedding retrieval.", ["States when each wins"]),
        ("Compare three backoff strategies for the run loop.", ["Recommends one with reasons"]),
        ("Investigate failure modes of LLM-as-judge and list mitigations.", ["At least 4 mitigations"]),
        ("Research prompt-injection risks for external input and propose defenses.", ["Defenses are concrete"]),
        ("Evaluate cost models for fast vs deep model tiers.", ["Gives a break-even heuristic"]),
        ("Survey methods to detect hallucinated claims in outputs.", ["Names a checkable signal"]),
        ("Analyze when memory-first beats context-stuffing.", ["States a threshold"]),
        ("Research deterministic testing patterns for non-deterministic systems.", ["Applies to this engine"]),
        ("Compare flat-file vs SQLite for the memory store.", ["Recommends with migration cost"]),
        ("Investigate safe defaults for auto-promotion thresholds.", ["Errs toward REWORK"]),
    ],
    "data": [
        ("Define a metrics schema for cycle outcomes.", ["Includes verdict and latency"]),
        ("Write a query that computes PASS rate over a time window.", ["Handles empty windows"]),
        ("Design a memory record tagging taxonomy.", ["Tags are mutually consistent"]),
        ("Specify anonymization rules for stored operator text.", ["No PII retained by default"]),
        ("Create a data-quality check for orphaned outputs.", ["Detects missing card refs"]),
        ("Define retention tiers for hot vs cold memory.", ["Each tier has a TTL"]),
        ("Write an aggregation that ranks tasks by rework frequency.", ["Stable tie-breaking"]),
        ("Design a CSV export format for judgements.", ["Header is documented"]),
        ("Specify a checksum strategy for the memory file.", ["Detects partial writes"]),
        ("Create a sampling plan for auditing PASS verdicts.", ["Sample size justified"]),
    ],
    "review": [
        ("Self-review an output against its run card and list gaps.", ["Each gap maps to a criterion"]),
        ("Write an adversarial checklist the DOMMER cell applies.", ["At least 6 checks"]),
        ("Define what makes a claim 'checkable' vs vague.", ["Gives examples of each"]),
        ("Create a rubric scoring outputs 0-1 on acceptance coverage.", ["Deterministic scoring"]),
        ("Specify when REWORK must escalate to BLOCK.", ["Threshold on attempts"]),
        ("Draft a review note format that is actionable.", ["Imperative, specific"]),
        ("Define guardrails preventing the judge from rubber-stamping.", ["Requires evidence"]),
        ("Write a test that a BLOCK never auto-promotes.", ["Asserts no follow-up"]),
        ("Create a calibration set of known PASS/REWORK/BLOCK cases.", ["Covers all three"]),
        ("Define how to handle a judge/builder disagreement loop.", ["Bounded retries"]),
    ],
    "comms": [
        ("Draft an internal note explaining why X/Twitter is not a dependency.", ["States the resilience reason"]),
        ("Write an operator-to-stakeholder update on engine status.", ["No hype, just state"]),
        ("Create a template for reporting a BLOCK to a decision-maker.", ["Asks a clear question"]),
        ("Draft onboarding instructions for a new operator.", ["Runnable in mock mode"]),
        ("Write a concise explanation of output-binding for non-engineers.", ["One paragraph"]),
        ("Create a status-line format summarizing the current cycle.", ["Fits one line"]),
        ("Draft a message declining an unsafe auto-deploy request.", ["Cites the policy"]),
        ("Write a short brief on the clean-room drone policy for partners.", ["Civil-use only"]),
        ("Create a template acknowledging receipt of a new task.", ["Echoes acceptance criteria"]),
        ("Draft a weekly digest email from cycle metrics.", ["Links to evidence"]),
    ],
    "security": [
        ("Define input sanitization rules for operator text.", ["Strips control chars"]),
        ("Specify a least-privilege file layout for the memory store.", ["No world-write"]),
        ("Write a check that secrets never enter memory records.", ["Pattern-based redaction"]),
        ("Define a policy preventing the engine from running shell commands.", ["Default deny"]),
        ("Draft a threat model for the run loop.", ["Lists assets and adversaries"]),
        ("Specify how the live backend key is loaded and never logged.", ["Env-only, redacted"]),
        ("Create a check for prompt-injection markers in inputs.", ["Flags, does not execute"]),
        ("Define audit logging for every promotion decision.", ["Tamper-evident ordering"]),
        ("Write a safe-default config that fails closed.", ["Mock unless explicitly live"]),
        ("Specify a review gate before enabling the live backend.", ["Two-person rule"]),
    ],
    "automation": [
        ("Design the 20-minute autonomous loop budget and stop conditions.", ["Has a hard stop"]),
        ("Specify what the loop persists to memory each cycle.", ["Only durable facts"]),
        ("Define when the loop must pause for human input.", ["On BLOCK"]),
        ("Write a scheduler spec for running tasks from the bank.", ["No duplicate concurrent runs"]),
        ("Define idempotency for re-running a task after a crash.", ["No double side effects"]),
        ("Specify backpressure when the judge is the bottleneck.", ["Queue bound stated"]),
        ("Design a checkpoint format to resume a 24h run.", ["Resumable mid-cycle"]),
        ("Define metrics the loop emits per cycle.", ["Verdict, attempt, latency"]),
        ("Write a kill-switch spec for the autonomous loop.", ["Single command halt"]),
        ("Specify how the loop avoids X/Twitter and any social ingestion.", ["No social inputs"]),
    ],
    "drone_civil": [
        ("Draft a clean-room note scoping drone work to civil use only.", ["Excludes weaponization"]),
        ("Specify a survey flight plan for civil mapping.", ["Stays in permitted airspace"]),
        ("Define a no-fly geofence policy for sensitive zones.", ["Hard exclusion list"]),
        ("Write a pre-flight safety checklist for a civil drone op.", ["Battery, GPS, RTH"]),
        ("Specify data handling for aerial imagery (privacy-safe).", ["Blurs PII by default"]),
        ("Draft a maintenance log template for a survey drone.", ["Tracks airframe hours"]),
        ("Define a return-to-home failsafe configuration.", ["Triggers on signal loss"]),
        ("Write an SOP for agricultural field inspection flights.", ["Civil, non-harmful payload"]),
        ("Specify logging requirements for a civil inspection mission.", ["Auditable flight log"]),
        ("Draft a partner agreement clause limiting drones to civil tasks.", ["Explicit prohibition of weaponization"]),
    ],
}


def _build() -> Dict[str, Task]:
    tasks: Dict[str, Task] = {}
    counter = 1
    for category, items in _RAW.items():
        for prompt, extra in items:
            tid = f"T{counter:03d}"
            tasks[tid] = Task(
                id=tid,
                category=category,
                prompt=prompt,
                acceptance=list(_BASE_ACCEPTANCE) + list(extra),
            )
            counter += 1
    return tasks


class TaskBank:
    def __init__(self) -> None:
        self._tasks = _build()

    def get(self, task_id: str) -> Task:
        try:
            return self._tasks[task_id]
        except KeyError as exc:
            raise KeyError(f"Unknown task id: {task_id}") from exc

    def all(self) -> List[Task]:
        return list(self._tasks.values())

    def by_category(self, category: str) -> List[Task]:
        return [t for t in self._tasks.values() if t.category == category]

    def categories(self) -> List[str]:
        return list(_RAW.keys())

    def __len__(self) -> int:
        return len(self._tasks)


# Module-level sanity: the bank must always contain exactly 100 tasks.
assert len(_build()) == 100, "Task bank must contain exactly 100 tasks"
