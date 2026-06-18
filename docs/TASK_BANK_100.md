# KUTT24 Task Bank — 100 Concrete Tasks

The bank is the menu the operator and the 24h loop pull from. Each task carries explicit acceptance criteria so the DOMMER cell can rule PASS/REWORK/BLOCK without guessing intent. Ids are stable (T001..T100).

## Operations  (ops)

### T001 — Write a 24h operator runbook for the value engine with shift checkpoints

Write a 24h operator runbook for the value engine with shift checkpoints.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Includes per-hour checkpoints
- Defines escalation owner

### T002 — Define a health-check command that verifies memory store integrity

Define a health-check command that verifies memory store integrity.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Returns non-zero on corruption

### T003 — Draft an incident template for a BLOCK verdict storm

Draft an incident template for a BLOCK verdict storm.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Has detection, triage, rollback sections

### T004 — Specify backup and restore steps for the memory JSON store

Specify backup and restore steps for the memory JSON store.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Restore is reversible and verified

### T005 — Create a checklist for promoting an output from REWORK to PASS

Create a checklist for promoting an output from REWORK to PASS.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Each item is binary

### T006 — Define rate limits for the run loop to avoid runaway cost

Define rate limits for the run loop to avoid runaway cost.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- States a hard cap per hour

### T007 — Write a degraded-mode plan when the live LLM backend is unreachable

Write a degraded-mode plan when the live LLM backend is unreachable.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Falls back to mock deterministically

### T008 — Document log rotation and retention for cycle traces

Document log rotation and retention for cycle traces.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Retention period is explicit

### T009 — Create a startup self-test the CLI runs before the first cycle

Create a startup self-test the CLI runs before the first cycle.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Fails closed on missing config

### T010 — Define an on-call handoff note format between operators

Define an on-call handoff note format between operators.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Captures open BLOCKs

## Content & Reporting  (content)

### T011 — Produce a one-page status report suitable for DOCX rendering

Produce a one-page status report suitable for DOCX rendering.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No layout garbage
- Sections: summary, risks, next

### T012 — Write release notes for the current engine version

Write release notes for the current engine version.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Groups changes by category

### T013 — Draft an executive summary of the last 24h of cycles

Draft an executive summary of the last 24h of cycles.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Under 200 words

### T014 — Generate a FAQ for new operators of the engine

Generate a FAQ for new operators of the engine.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- At least 8 Q/A pairs

### T015 — Write a changelog entry template enforcing semantic grouping

Write a changelog entry template enforcing semantic grouping.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Has Added/Changed/Fixed/Removed

### T016 — Produce a README section explaining the HENTER/BYGGER/DOMMER cells

Produce a README section explaining the HENTER/BYGGER/DOMMER cells.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Explains the data flow

### T017 — Draft a risk register with likelihood and impact columns

Draft a risk register with likelihood and impact columns.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- At least 5 risks

### T018 — Write a postmortem template for a failed promotion

Write a postmortem template for a failed promotion.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Blameless framing

### T019 — Create a glossary of KUTT24 terms

Create a glossary of KUTT24 terms.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Defines PASS/REWORK/BLOCK

### T020 — Generate a weekly value summary from cycle history

Generate a weekly value summary from cycle history.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Quantifies PASS rate

## Code  (code)

### T021 — Implement a function that validates a RunCard has non-empty acceptance

Implement a function that validates a RunCard has non-empty acceptance.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Has unit test
- Pure function

### T022 — Add a JSON schema validator for persisted memory records

Add a JSON schema validator for persisted memory records.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Rejects unknown kinds

### T023 — Write a retry helper with exponential backoff and a hard cap

Write a retry helper with exponential backoff and a hard cap.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Cap is configurable
- No unbounded loop

### T024 — Implement a deterministic id generator suitable for tests

Implement a deterministic id generator suitable for tests.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Collision-resistant

### T025 — Add a CLI flag to export the last cycle as JSON

Add a CLI flag to export the last cycle as JSON.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Round-trips through contracts

### T026 — Implement a memory compaction routine that merges duplicate records

Implement a memory compaction routine that merges duplicate records.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Idempotent

### T027 — Write a function to diff two outputs and list changed claims

Write a function to diff two outputs and list changed claims.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Stable ordering

### T028 — Add structured logging to the run loop

Add structured logging to the run loop.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- One event per stage

### T029 — Implement a dry-run mode that builds but never writes memory

Implement a dry-run mode that builds but never writes memory.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No side effects

### T030 — Write a parser that turns operator text into an Input contract

Write a parser that turns operator text into an Input contract.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Rejects empty input

## Research  (research)

### T031 — Summarize trade-offs between token-overlap and embedding retrieval

Summarize trade-offs between token-overlap and embedding retrieval.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- States when each wins

### T032 — Compare three backoff strategies for the run loop

Compare three backoff strategies for the run loop.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Recommends one with reasons

### T033 — Investigate failure modes of LLM-as-judge and list mitigations

Investigate failure modes of LLM-as-judge and list mitigations.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- At least 4 mitigations

### T034 — Research prompt-injection risks for external input and propose defenses

Research prompt-injection risks for external input and propose defenses.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Defenses are concrete

### T035 — Evaluate cost models for fast vs deep model tiers

Evaluate cost models for fast vs deep model tiers.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Gives a break-even heuristic

### T036 — Survey methods to detect hallucinated claims in outputs

Survey methods to detect hallucinated claims in outputs.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Names a checkable signal

### T037 — Analyze when memory-first beats context-stuffing

Analyze when memory-first beats context-stuffing.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- States a threshold

### T038 — Research deterministic testing patterns for non-deterministic systems

Research deterministic testing patterns for non-deterministic systems.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Applies to this engine

### T039 — Compare flat-file vs SQLite for the memory store

Compare flat-file vs SQLite for the memory store.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Recommends with migration cost

### T040 — Investigate safe defaults for auto-promotion thresholds

Investigate safe defaults for auto-promotion thresholds.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Errs toward REWORK

## Data  (data)

### T041 — Define a metrics schema for cycle outcomes

Define a metrics schema for cycle outcomes.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Includes verdict and latency

### T042 — Write a query that computes PASS rate over a time window

Write a query that computes PASS rate over a time window.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Handles empty windows

### T043 — Design a memory record tagging taxonomy

Design a memory record tagging taxonomy.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Tags are mutually consistent

### T044 — Specify anonymization rules for stored operator text

Specify anonymization rules for stored operator text.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No PII retained by default

### T045 — Create a data-quality check for orphaned outputs

Create a data-quality check for orphaned outputs.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Detects missing card refs

### T046 — Define retention tiers for hot vs cold memory

Define retention tiers for hot vs cold memory.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Each tier has a TTL

### T047 — Write an aggregation that ranks tasks by rework frequency

Write an aggregation that ranks tasks by rework frequency.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Stable tie-breaking

### T048 — Design a CSV export format for judgements

Design a CSV export format for judgements.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Header is documented

### T049 — Specify a checksum strategy for the memory file

Specify a checksum strategy for the memory file.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Detects partial writes

### T050 — Create a sampling plan for auditing PASS verdicts

Create a sampling plan for auditing PASS verdicts.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Sample size justified

## Review & QA  (review)

### T051 — Self-review an output against its run card and list gaps

Self-review an output against its run card and list gaps.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Each gap maps to a criterion

### T052 — Write an adversarial checklist the DOMMER cell applies

Write an adversarial checklist the DOMMER cell applies.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- At least 6 checks

### T053 — Define what makes a claim 'checkable' vs vague

Define what makes a claim 'checkable' vs vague.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Gives examples of each

### T054 — Create a rubric scoring outputs 0-1 on acceptance coverage

Create a rubric scoring outputs 0-1 on acceptance coverage.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Deterministic scoring

### T055 — Specify when REWORK must escalate to BLOCK

Specify when REWORK must escalate to BLOCK.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Threshold on attempts

### T056 — Draft a review note format that is actionable

Draft a review note format that is actionable.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Imperative, specific

### T057 — Define guardrails preventing the judge from rubber-stamping

Define guardrails preventing the judge from rubber-stamping.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Requires evidence

### T058 — Write a test that a BLOCK never auto-promotes

Write a test that a BLOCK never auto-promotes.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Asserts no follow-up

### T059 — Create a calibration set of known PASS/REWORK/BLOCK cases

Create a calibration set of known PASS/REWORK/BLOCK cases.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Covers all three

### T060 — Define how to handle a judge/builder disagreement loop

Define how to handle a judge/builder disagreement loop.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Bounded retries

## Comms  (comms)

### T061 — Draft an internal note explaining why X/Twitter is not a dependency

Draft an internal note explaining why X/Twitter is not a dependency.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- States the resilience reason

### T062 — Write an operator-to-stakeholder update on engine status

Write an operator-to-stakeholder update on engine status.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No hype, just state

### T063 — Create a template for reporting a BLOCK to a decision-maker

Create a template for reporting a BLOCK to a decision-maker.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Asks a clear question

### T064 — Draft onboarding instructions for a new operator

Draft onboarding instructions for a new operator.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Runnable in mock mode

### T065 — Write a concise explanation of output-binding for non-engineers

Write a concise explanation of output-binding for non-engineers.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- One paragraph

### T066 — Create a status-line format summarizing the current cycle

Create a status-line format summarizing the current cycle.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Fits one line

### T067 — Draft a message declining an unsafe auto-deploy request

Draft a message declining an unsafe auto-deploy request.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Cites the policy

### T068 — Write a short brief on the clean-room drone policy for partners

Write a short brief on the clean-room drone policy for partners.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Civil-use only

### T069 — Create a template acknowledging receipt of a new task

Create a template acknowledging receipt of a new task.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Echoes acceptance criteria

### T070 — Draft a weekly digest email from cycle metrics

Draft a weekly digest email from cycle metrics.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Links to evidence

## Security (defensive)  (security)

### T071 — Define input sanitization rules for operator text

Define input sanitization rules for operator text.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Strips control chars

### T072 — Specify a least-privilege file layout for the memory store

Specify a least-privilege file layout for the memory store.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No world-write

### T073 — Write a check that secrets never enter memory records

Write a check that secrets never enter memory records.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Pattern-based redaction

### T074 — Define a policy preventing the engine from running shell commands

Define a policy preventing the engine from running shell commands.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Default deny

### T075 — Draft a threat model for the run loop

Draft a threat model for the run loop.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Lists assets and adversaries

### T076 — Specify how the live backend key is loaded and never logged

Specify how the live backend key is loaded and never logged.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Env-only, redacted

### T077 — Create a check for prompt-injection markers in inputs

Create a check for prompt-injection markers in inputs.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Flags, does not execute

### T078 — Define audit logging for every promotion decision

Define audit logging for every promotion decision.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Tamper-evident ordering

### T079 — Write a safe-default config that fails closed

Write a safe-default config that fails closed.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Mock unless explicitly live

### T080 — Specify a review gate before enabling the live backend

Specify a review gate before enabling the live backend.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Two-person rule

## Automation  (automation)

### T081 — Design the 20-minute autonomous loop budget and stop conditions

Design the 20-minute autonomous loop budget and stop conditions.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Has a hard stop

### T082 — Specify what the loop persists to memory each cycle

Specify what the loop persists to memory each cycle.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Only durable facts

### T083 — Define when the loop must pause for human input

Define when the loop must pause for human input.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- On BLOCK

### T084 — Write a scheduler spec for running tasks from the bank

Write a scheduler spec for running tasks from the bank.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No duplicate concurrent runs

### T085 — Define idempotency for re-running a task after a crash

Define idempotency for re-running a task after a crash.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No double side effects

### T086 — Specify backpressure when the judge is the bottleneck

Specify backpressure when the judge is the bottleneck.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Queue bound stated

### T087 — Design a checkpoint format to resume a 24h run

Design a checkpoint format to resume a 24h run.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Resumable mid-cycle

### T088 — Define metrics the loop emits per cycle

Define metrics the loop emits per cycle.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Verdict, attempt, latency

### T089 — Write a kill-switch spec for the autonomous loop

Write a kill-switch spec for the autonomous loop.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Single command halt

### T090 — Specify how the loop avoids X/Twitter and any social ingestion

Specify how the loop avoids X/Twitter and any social ingestion.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- No social inputs

## Civil / Clean-room Drone  (drone_civil)

### T091 — Draft a clean-room note scoping drone work to civil use only

Draft a clean-room note scoping drone work to civil use only.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Excludes weaponization

### T092 — Specify a survey flight plan for civil mapping

Specify a survey flight plan for civil mapping.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Stays in permitted airspace

### T093 — Define a no-fly geofence policy for sensitive zones

Define a no-fly geofence policy for sensitive zones.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Hard exclusion list

### T094 — Write a pre-flight safety checklist for a civil drone op

Write a pre-flight safety checklist for a civil drone op.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Battery, GPS, RTH

### T095 — Specify data handling for aerial imagery (privacy-safe)

Specify data handling for aerial imagery (privacy-safe).

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Blurs PII by default

### T096 — Draft a maintenance log template for a survey drone

Draft a maintenance log template for a survey drone.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Tracks airframe hours

### T097 — Define a return-to-home failsafe configuration

Define a return-to-home failsafe configuration.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Triggers on signal loss

### T098 — Write an SOP for agricultural field inspection flights

Write an SOP for agricultural field inspection flights.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Civil, non-harmful payload

### T099 — Specify logging requirements for a civil inspection mission

Specify logging requirements for a civil inspection mission.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Auditable flight log

### T100 — Draft a partner agreement clause limiting drones to civil tasks

Draft a partner agreement clause limiting drones to civil tasks.

Acceptance:
- Output is bound to the run card objective.
- No social-platform (X/Twitter) dependency introduced.
- Claims are concrete and checkable.
- Explicit prohibition of weaponization
