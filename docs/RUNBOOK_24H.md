# KUTT24 — 24-Hour Runbook

A bounded, operator-supervised 24h run. The engine is autonomous *within* a
cycle but pauses on `BLOCK` and respects a hard attempt cap. This runbook is the
shift discipline around it.

## Roles

- **Operator (on-call):** drives the CLI, triages verdicts, owns escalation.
- **Reviewer (two-person rule):** required before any `--live` enablement.

## Pre-flight (T-0:30)

1. `cd src && python -m verdikvern selftest` → expect `selftest: OK`.
2. Back up `.verdikvern/memory.json` (copy aside with a timestamp).
3. Confirm backend: mock unless a reviewer has approved `--live`.
4. Pick the task slate for the shift from `TASK_BANK_100.md`.

## Hourly loop

Each hour:

1. Run the next batch of tasks: `python -m verdikvern run-task T0xx`.
2. Record the verdict for each (`PASS` / `REWORK` / `BLOCK`).
3. For `REWORK`: confirm the loop converged within the attempt cap; if it hit
   the cap still in `REWORK`, set the task aside for manual framing.
4. For `BLOCK`: stop. Read the gate reason. Escalate per below. Do **not**
   attempt to work around the block.
5. Append a one-line status to the shift log.

## Checkpoints

| Time   | Check                                                        |
|--------|-------------------------------------------------------------|
| 00:00  | Pre-flight passed, memory backed up                          |
| 06:00  | PASS rate computed; memory store size sane                   |
| 12:00  | Mid-run backup; review open REWORKs                          |
| 18:00  | Trend check: rising BLOCK rate ⇒ investigate inputs          |
| 24:00  | Final backup, shift report, handoff note                     |

## Escalation: BLOCK storm

If blocks exceed the agreed threshold in a window:

1. **Detect** — count `BLOCK` traces in memory for the window.
2. **Triage** — group by gate reason (weaponization / auto-deploy / secret /
   social). One reason dominating points at a bad input source.
3. **Contain** — pause new task submission from the offending source.
4. **Rollback** — restore the last clean memory backup if traces are polluted.
5. **Report** — file a blameless note with counts, reasons, and the action taken.

## Hard stops

- Any `BLOCK` pauses that task; the loop never promotes it.
- The per-input attempt cap (default 3) prevents a runaway rework loop.
- There is no kill needed for a runaway model: mock mode is offline; live mode
  is bounded by the same caps and the explicit `--live` gate.

## Handoff note format

```
shift: <date> <hours>
backend: mock|live
tasks run: <n>   PASS: <n>  REWORK: <n>  BLOCK: <n>
open BLOCKs: <ids + reasons>
open REWORKs (cap-hit): <ids>
memory backup: <path>
notes: <free text>
```
