# Massive Prompt Pack — Codex & Claude Code

A curated, agent-tuned set of engineering prompts. Each base prompt is framed for both **Codex** (surgical, diff-first) and **Claude Code** (plan-first, verify-with-tools). Replace `{{PLACEHOLDERS}}` with your specifics before sending.

_Total base prompts: 40 across 15 categories._

## Contents

- [ai-integration](#ai-integration) (2)
- [backend](#backend) (2)
- [code-review](#code-review) (3)
- [debugging](#debugging) (4)
- [devops](#devops) (2)
- [documentation](#documentation) (3)
- [frontend](#frontend) (2)
- [git](#git) (2)
- [migration](#migration) (3)
- [performance](#performance) (2)
- [planning](#planning) (3)
- [refactor](#refactor) (4)
- [scaffolding](#scaffolding) (3)
- [security](#security) (2)
- [testing](#testing) (3)

## ai-integration

### Integrate an LLM call

_Add a model-backed feature safely._

Tags: `ai`, `integration`

**Codex**

```text
[Codex] Integrate an LLM call
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Add a feature that uses an LLM to {{TASK}}. Keep the prompt and model config in one place, handle timeouts/retries/rate limits, validate the model output before using it, and make the call testable with a mock.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Integrate an LLM call
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Add a feature that uses an LLM to {{TASK}}. Keep the prompt and model config in one place, handle timeouts/retries/rate limits, validate the model output before using it, and make the call testable with a mock.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Tune a prompt

_Improve an existing prompt._

Tags: `ai`, `prompting`

**Codex**

```text
[Codex] Tune a prompt
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Improve the prompt at {{LOCATION}} for {{GOAL}}. Make the instructions unambiguous, specify the output format, add guardrails for bad input, and explain each change you made.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Tune a prompt
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Improve the prompt at {{LOCATION}} for {{GOAL}}. Make the instructions unambiguous, specify the output format, add guardrails for bad input, and explain each change you made.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## backend

### Fix an N+1 / slow query

_Make data access efficient._

Tags: `backend`, `database`

**Codex**

```text
[Codex] Fix an N+1 / slow query
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
{{QUERY_AREA}} is doing too many or too slow queries. Identify the problem (N+1, missing index, over-fetching), fix it with batching/joins/ indexing, and confirm the result set is unchanged.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Fix an N+1 / slow query
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
{{QUERY_AREA}} is doing too many or too slow queries. Identify the problem (N+1, missing index, over-fetching), fix it with batching/joins/ indexing, and confirm the result set is unchanged.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Make an operation idempotent

_Avoid duplicate side effects._

Tags: `backend`, `reliability`

**Codex**

```text
[Codex] Make an operation idempotent
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Make {{OPERATION}} safe to retry: ensure it is idempotent so repeated calls do not double-apply side effects. Handle the concurrent/duplicate case and add a test that retries it.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Make an operation idempotent
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Make {{OPERATION}} safe to retry: ensure it is idempotent so repeated calls do not double-apply side effects. Handle the concurrent/duplicate case and add a test that retries it.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## code-review

### Review the current diff

_Self-review before pushing._

Tags: `review`, `quality`

**Codex**

```text
[Codex] Review the current diff
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Review the current diff for correctness bugs, missed edge cases, and simplifications. Be specific: cite path:line and suggest the concrete change. Prioritize real issues over style nits.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Review the current diff
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Review the current diff for correctness bugs, missed edge cases, and simplifications. Be specific: cite path:line and suggest the concrete change. Prioritize real issues over style nits.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Security review

_Audit a change for vulnerabilities._

Tags: `security`, `review`

**Codex**

```text
[Codex] Security review
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Review {{TARGET}} for security issues: injection, authz/authn gaps, unsafe deserialization, secrets in code, SSRF, path traversal, and unsafe defaults. For each finding give severity, the risk, and the fix.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Security review
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Review {{TARGET}} for security issues: injection, authz/authn gaps, unsafe deserialization, secrets in code, SSRF, path traversal, and unsafe defaults. For each finding give severity, the risk, and the fix.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Summarize a PR

_Make a change easy to review._

Tags: `review`, `pr`

**Codex**

```text
[Codex] Summarize a PR
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Summarize the changes on this branch for a reviewer: what changed and why, the risk areas, how it was tested, and anything that needs a closer look. Keep it concise.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Summarize a PR
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Summarize the changes on this branch for a reviewer: what changed and why, the risk areas, how it was tested, and anything that needs a closer look. Keep it concise.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## debugging

### Reproduce and fix a bug

_Diagnose a defect from a report._

Tags: `bug`, `root-cause`

**Codex**

```text
[Codex] Reproduce and fix a bug
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Bug report: {{SYMPTOM}}. Reproduce it, find the root cause (not just the symptom), and fix it. Explain the cause in one or two sentences, then add a regression test that fails before the fix and passes after.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Reproduce and fix a bug
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Bug report: {{SYMPTOM}}. Reproduce it, find the root cause (not just the symptom), and fix it. Explain the cause in one or two sentences, then add a regression test that fails before the fix and passes after.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Trace a value

_Follow data through the system._

Tags: `bug`, `trace`

**Codex**

```text
[Codex] Trace a value
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Trace how {{VALUE}} flows from {{SOURCE}} to {{DESTINATION}}. Identify where it becomes wrong or unexpected, citing files as path:line, and propose the minimal fix.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Trace a value
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Trace how {{VALUE}} flows from {{SOURCE}} to {{DESTINATION}}. Identify where it becomes wrong or unexpected, citing files as path:line, and propose the minimal fix.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Stabilize a flaky test

_Make an intermittent test reliable._

Tags: `test`, `flaky`

**Codex**

```text
[Codex] Stabilize a flaky test
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
The test {{TEST}} is flaky. Determine why it is non-deterministic (timing, ordering, shared state, randomness, network) and make it reliable without weakening what it verifies.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Stabilize a flaky test
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
The test {{TEST}} is flaky. Determine why it is non-deterministic (timing, ordering, shared state, randomness, network) and make it reliable without weakening what it verifies.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Explain an error

_Decode an error/stack trace._

Tags: `error`, `explain`

**Codex**

```text
[Codex] Explain an error
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Here is an error: {{ERROR}}. Explain what it means, the most likely cause in this codebase, and the fix. If more than one cause is plausible, rank them.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Explain an error
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Here is an error: {{ERROR}}. Explain what it means, the most likely cause in this codebase, and the fix. If more than one cause is plausible, rank them.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## devops

### Fix a failing CI job

_Get the pipeline green._

Tags: `ci`, `devops`

**Codex**

```text
[Codex] Fix a failing CI job
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
CI job {{JOB}} is failing. Read the logs, find the actual cause (not just the failing step), and fix it. Distinguish a real code failure from a flaky/infra issue and say which it is.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Fix a failing CI job
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
CI job {{JOB}} is failing. Read the logs, find the actual cause (not just the failing step), and fix it. Distinguish a real code failure from a flaky/infra issue and say which it is.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Add a CI check

_Automate a quality gate._

Tags: `ci`, `automation`

**Codex**

```text
[Codex] Add a CI check
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Add a CI step that runs {{CHECK}} on every push/PR. Fit the existing pipeline, fail fast with a clear message, and cache where it speeds things up.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Add a CI check
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Add a CI step that runs {{CHECK}} on every push/PR. Fit the existing pipeline, fail fast with a clear message, and cache where it speeds things up.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## documentation

### Update the README

_Keep user-facing docs accurate._

Tags: `docs`, `readme`

**Codex**

```text
[Codex] Update the README
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Update the README to reflect {{CHANGE}}. Keep it accurate and concise, include a runnable usage example, and don't document behavior that does not exist.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Update the README
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Update the README to reflect {{CHANGE}}. Keep it accurate and concise, include a runnable usage example, and don't document behavior that does not exist.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Document an API

_Write reference docs for an interface._

Tags: `docs`, `api`

**Codex**

```text
[Codex] Document an API
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Document the public API of {{TARGET}}: each function/endpoint, its parameters, return value, errors, and a short example. Match the existing docstring/comment style.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Document an API
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Document the public API of {{TARGET}}: each function/endpoint, its parameters, return value, errors, and a short example. Match the existing docstring/comment style.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Explain code to a teammate

_Produce a plain-language explanation._

Tags: `docs`, `explain`

**Codex**

```text
[Codex] Explain code to a teammate
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Explain how {{TARGET}} works in plain language for a teammate who is new to it. Cover the purpose, the flow, and one gotcha. Reference path:line for the key spots.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Explain code to a teammate
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Explain how {{TARGET}} works in plain language for a teammate who is new to it. Cover the purpose, the flow, and one gotcha. Reference path:line for the key spots.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## frontend

### Build a UI component

_Create a reusable component._

Tags: `frontend`, `ui`

**Codex**

```text
[Codex] Build a UI component
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Build a {{FRAMEWORK}} component {{NAME}} that {{BEHAVIOR}}. Match the existing component patterns, keep it accessible (labels, keyboard, focus), and handle loading/empty/error states.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Build a UI component
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Build a {{FRAMEWORK}} component {{NAME}} that {{BEHAVIOR}}. Match the existing component patterns, keep it accessible (labels, keyboard, focus), and handle loading/empty/error states.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Fix accessibility issues

_Make the UI usable for everyone._

Tags: `frontend`, `accessibility`

**Codex**

```text
[Codex] Fix accessibility issues
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Audit {{TARGET}} for accessibility issues (semantics, labels, contrast, keyboard navigation, focus management, ARIA) and fix them. Explain each fix and how to verify it.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Fix accessibility issues
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Audit {{TARGET}} for accessibility issues (semantics, labels, contrast, keyboard navigation, focus management, ARIA) and fix them. Explain each fix and how to verify it.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## git

### Write a commit message

_Describe a change clearly._

Tags: `git`, `workflow`

**Codex**

```text
[Codex] Write a commit message
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Write a clear commit message for the staged changes: a concise subject line and a body explaining the what and why. Follow the repo's commit conventions if any exist.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Write a commit message
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Write a clear commit message for the staged changes: a concise subject line and a body explaining the what and why. Follow the repo's commit conventions if any exist.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Find the breaking commit

_Locate a regression in history._

Tags: `git`, `regression`

**Codex**

```text
[Codex] Find the breaking commit
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
A regression appeared: {{SYMPTOM}}. Help me find the commit that introduced it using git history/bisect reasoning, then explain the change that caused it and how to fix it.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Find the breaking commit
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
A regression appeared: {{SYMPTOM}}. Help me find the commit that introduced it using git history/bisect reasoning, then explain the change that caused it and how to fix it.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## migration

### Upgrade a dependency

_Move to a new version safely._

Tags: `upgrade`, `dependencies`

**Codex**

```text
[Codex] Upgrade a dependency
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Upgrade {{DEPENDENCY}} from {{FROM}} to {{TO}}. Read the changelog for breaking changes, update call sites, fix deprecations, and run the test suite. Summarize what changed and any follow-ups.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Upgrade a dependency
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Upgrade {{DEPENDENCY}} from {{FROM}} to {{TO}}. Read the changelog for breaking changes, update call sites, fix deprecations, and run the test suite. Summarize what changed and any follow-ups.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Migrate to a new API

_Swap one interface for another._

Tags: `migration`, `refactor`

**Codex**

```text
[Codex] Migrate to a new API
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Migrate usages of {{OLD}} to {{NEW}} across the codebase. Do it incrementally, keep behavior equivalent, update tests, and confirm nothing still depends on the old path.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Migrate to a new API
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Migrate usages of {{OLD}} to {{NEW}} across the codebase. Do it incrementally, keep behavior equivalent, update tests, and confirm nothing still depends on the old path.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Write a schema migration

_Change a data model safely._

Tags: `database`, `migration`

**Codex**

```text
[Codex] Write a schema migration
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Write a migration for {{CHANGE}} to the data model. Make it reversible if possible, preserve existing data, and update the code that reads/writes the affected fields. Note any backfill or downtime considerations.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Write a schema migration
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Write a migration for {{CHANGE}} to the data model. Make it reversible if possible, preserve existing data, and update the code that reads/writes the affected fields. Note any backfill or downtime considerations.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## performance

### Find a bottleneck

_Locate the slow part before optimizing._

Tags: `performance`, `profiling`

**Codex**

```text
[Codex] Find a bottleneck
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
{{OPERATION}} is slow. Identify the likely bottleneck (algorithmic complexity, N+1 queries, excess allocation, I/O), measure or reason about it, and propose the highest-impact fix before changing code.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Find a bottleneck
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
{{OPERATION}} is slow. Identify the likely bottleneck (algorithmic complexity, N+1 queries, excess allocation, I/O), measure or reason about it, and propose the highest-impact fix before changing code.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Optimize a hot path

_Speed up code without breaking it._

Tags: `performance`, `optimize`

**Codex**

```text
[Codex] Optimize a hot path
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Optimize {{TARGET}} for {{METRIC}} (latency/throughput/memory). Keep behavior identical and readable; justify each change with why it helps. Confirm correctness with tests.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Optimize a hot path
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Optimize {{TARGET}} for {{METRIC}} (latency/throughput/memory). Keep behavior identical and readable; justify each change with why it helps. Confirm correctness with tests.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## planning

### Plan a feature

_Turn a feature request into an actionable plan._

Tags: `plan`, `design`

**Codex**

```text
[Codex] Plan a feature
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Explore the codebase and produce an implementation plan for: {{TASK}}. List the files you would touch, the order of changes, edge cases, and how you will test it. Call out risks and open questions before writing code.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Plan a feature
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Explore the codebase and produce an implementation plan for: {{TASK}}. List the files you would touch, the order of changes, edge cases, and how you will test it. Call out risks and open questions before writing code.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Map an unfamiliar codebase

_Build a mental model of a new repo or module._

Tags: `onboarding`, `explain`

**Codex**

```text
[Codex] Map an unfamiliar codebase
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
I am new to this code. Give me a guided tour of {{AREA}}: the entry points, the main data flow, key abstractions, and where the important logic lives. Reference files as path:line so I can jump to them.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Map an unfamiliar codebase
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
I am new to this code. Give me a guided tour of {{AREA}}: the entry points, the main data flow, key abstractions, and where the important logic lives. Reference files as path:line so I can jump to them.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Compare approaches

_Weigh design options before committing._

Tags: `design`, `trade-offs`

**Codex**

```text
[Codex] Compare approaches
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
For {{GOAL}}, propose 2-3 viable approaches. For each: a one-line summary, the main trade-offs, effort, and blast radius. End with a single recommendation and why. Do not write code yet.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Compare approaches
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
For {{GOAL}}, propose 2-3 viable approaches. For each: a one-line summary, the main trade-offs, effort, and blast radius. End with a single recommendation and why. Do not write code yet.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## refactor

### Refactor for clarity

_Improve readability without changing behavior._

Tags: `cleanup`, `readability`

**Codex**

```text
[Codex] Refactor for clarity
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Refactor {{TARGET}} to be clearer and easier to maintain without changing its behavior. Improve naming, reduce nesting, and remove duplication. Keep the public interface stable and ensure tests still pass.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Refactor for clarity
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Refactor {{TARGET}} to be clearer and easier to maintain without changing its behavior. Improve naming, reduce nesting, and remove duplication. Keep the public interface stable and ensure tests still pass.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Extract a function

_Pull tangled logic into a named unit._

Tags: `cleanup`, `extract`

**Codex**

```text
[Codex] Extract a function
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Extract the logic in {{LOCATION}} into a well-named function with a focused signature. Replace the inline code with a call, keep behavior identical, and add a short docstring describing inputs and outputs.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Extract a function
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Extract the logic in {{LOCATION}} into a well-named function with a focused signature. Replace the inline code with a call, keep behavior identical, and add a short docstring describing inputs and outputs.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Remove duplication

_Consolidate copy-pasted logic._

Tags: `cleanup`, `DRY`

**Codex**

```text
[Codex] Remove duplication
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Find the duplicated logic around {{TOPIC}} and consolidate it into a single reusable helper. Update all call sites, keep behavior identical, and confirm with tests.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Remove duplication
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Find the duplicated logic around {{TOPIC}} and consolidate it into a single reusable helper. Update all call sites, keep behavior identical, and confirm with tests.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Modernize legacy code

_Bring old code up to current idioms._

Tags: `legacy`, `cleanup`

**Codex**

```text
[Codex] Modernize legacy code
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Modernize {{TARGET}} to current {{LANGUAGE}} idioms and the project's conventions (types, error handling, async if appropriate). Preserve behavior, do it in reviewable steps, and keep tests green.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Modernize legacy code
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Modernize {{TARGET}} to current {{LANGUAGE}} idioms and the project's conventions (types, error handling, async if appropriate). Preserve behavior, do it in reviewable steps, and keep tests green.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## scaffolding

### Scaffold a module

_Create a new module with sensible structure._

Tags: `create`, `boilerplate`

**Codex**

```text
[Codex] Scaffold a module
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Create a new {{LANGUAGE}} module for {{PURPOSE}}. Follow the existing project conventions for layout, naming, and error handling. Include a minimal public API and a docstring/header explaining usage.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Scaffold a module
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Create a new {{LANGUAGE}} module for {{PURPOSE}}. Follow the existing project conventions for layout, naming, and error handling. Include a minimal public API and a docstring/header explaining usage.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Add a CLI command

_Wire a new subcommand into an existing CLI._

Tags: `cli`, `create`

**Codex**

```text
[Codex] Add a CLI command
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Add a CLI command {{COMMAND}} that {{BEHAVIOR}}. Reuse the existing argument-parsing setup, validate inputs, print helpful errors, and update the help text. Add a usage example to the README.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Add a CLI command
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Add a CLI command {{COMMAND}} that {{BEHAVIOR}}. Reuse the existing argument-parsing setup, validate inputs, print helpful errors, and update the help text. Add a usage example to the README.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Add an API endpoint

_Add a route end to end._

Tags: `api`, `backend`, `create`

**Codex**

```text
[Codex] Add an API endpoint
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Add an endpoint {{METHOD}} {{PATH}} that {{BEHAVIOR}}. Wire routing, validation, the handler, and the response shape. Reuse existing auth and error-handling middleware, and add a test covering success and one failure case.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Add an API endpoint
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Add an endpoint {{METHOD}} {{PATH}} that {{BEHAVIOR}}. Wire routing, validation, the handler, and the response shape. Reuse existing auth and error-handling middleware, and add a test covering success and one failure case.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## security

### Harden an input boundary

_Validate and sanitize untrusted input._

Tags: `security`, `validation`

**Codex**

```text
[Codex] Harden an input boundary
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Harden {{BOUNDARY}} against untrusted input: validate and sanitize, enforce limits, fail closed, and avoid leaking internals in errors. Add tests for malicious and malformed inputs.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Harden an input boundary
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Harden {{BOUNDARY}} against untrusted input: validate and sanitize, enforce limits, fail closed, and avoid leaking internals in errors. Add tests for malicious and malformed inputs.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Find and fix leaked secrets

_Remove credentials from code._

Tags: `security`, `secrets`

**Codex**

```text
[Codex] Find and fix leaked secrets
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Scan {{SCOPE}} for hardcoded secrets, tokens, or credentials. For each, move it to configuration/secret storage, document the change, and note whether the secret must be rotated.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Find and fix leaked secrets
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Scan {{SCOPE}} for hardcoded secrets, tokens, or credentials. For each, move it to configuration/secret storage, document the change, and note whether the secret must be rotated.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

## testing

### Add missing tests

_Cover untested behavior._

Tags: `test`, `coverage`

**Codex**

```text
[Codex] Add missing tests
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Add tests for {{TARGET}}. Cover the happy path, edge cases, and at least one failure mode. Match the project's existing test style and framework, and make each test name describe the behavior it checks.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Add missing tests
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Add tests for {{TARGET}}. Cover the happy path, edge cases, and at least one failure mode. Match the project's existing test style and framework, and make each test name describe the behavior it checks.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Write a regression test

_Lock in a fix._

Tags: `test`, `regression`

**Codex**

```text
[Codex] Write a regression test
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
Write a focused regression test for {{BUG}} that fails on the current (buggy) behavior and passes once fixed. Keep it small and tied to the specific defect.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Write a regression test
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
Write a focused regression test for {{BUG}} that fails on the current (buggy) behavior and passes once fixed. Keep it small and tied to the specific defect.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```

### Brainstorm edge cases

_Find the cases that break things._

Tags: `test`, `edge-cases`

**Codex**

```text
[Codex] Brainstorm edge cases
You are Codex working in this repository. Act autonomously, keep chatter to a minimum, and return a tight unified diff.

Task:
For {{FUNCTION}}, list the edge cases and adversarial inputs worth testing (empty, boundary, malformed, concurrent, huge). Then implement tests for the highest-value ones.

Working style:
- Make the smallest change that fully solves the task.
- Match the surrounding code style; do not reformat untouched lines.
- Show the patch and a one-line summary—skip the play-by-play.
- If a command is needed to verify, state the exact command.
```

**Claude Code**

```text
[Claude Code] Brainstorm edge cases
You are Claude Code working in this repository. Investigate before editing, use your tools, and verify the result.

Task:
For {{FUNCTION}}, list the edge cases and adversarial inputs worth testing (empty, boundary, malformed, concurrent, huge). Then implement tests for the highest-value ones.

Working style:
- Read the relevant files first; ground every change in what you find.
- Lay out a short plan, then implement it step by step.
- Run tests/linters and report the actual output, not assumptions.
- Surface anything surprising instead of silently working around it.
```
