# KUTT24 — Operator Manual

This is the runnable companion to the rendered Operator Manual DOCX. It tells an
operator how to drive the engine from a cold start.

## 0. Prerequisites

- Python 3.9+
- `pytest` only if you want to run the test suite
- No network and no credentials are needed for mock mode (the default)

## 1. Run from source

The package lives under `src/`. Run the CLI as a module:

```bash
cd src
python -m verdikvern selftest
```

Expected: backend `mock`, 100 tasks, and a smoke cycle on `T001` that ends in
`PASS`.

## 2. Commands

| Command                              | What it does                              |
|--------------------------------------|-------------------------------------------|
| `selftest`                           | Verifies wiring in mock mode              |
| `tasks`                              | Lists all 100 tasks                       |
| `tasks --category drone_civil`       | Lists tasks in one category               |
| `run "<text>"`                       | Runs free-text input through the loop     |
| `run-task T001`                      | Runs a bank task by id                    |
| `run-task T001 --json`               | Same, but emits the full cycle as JSON    |

Add `--live` (before the subcommand) to use the live Claude backend. This
**requires** `ANTHROPIC_API_KEY` and will refuse to start without it.

## 3. Reading a verdict

- `PASS  ✓` — output is safe, bound to the card, and meets every acceptance
  criterion. Promote it.
- `REWORK ↻` — safe and bound, but acceptance not yet fully met. The loop feeds
  the judge's notes back in and tries again, up to the attempt cap (default 3).
- `BLOCK  ✗` — a hard safety rule tripped. The loop stops. **Do not** try to
  work around a block; surface it to a decision-maker. The CLI exits with code
  `2` on a block.

## 4. The categories

`ops`, `content`, `code`, `research`, `data`, `review`, `comms`, `security`,
`automation`, `drone_civil` — ten each, 100 total. See `TASK_BANK_100.md`.

## 5. Memory

Cycle traces are written to `.verdikvern/memory.json` (configurable). Back this
file up before a long run; restore is a straight file copy. To start clean,
delete it — the engine recreates it on next run.

## 6. Going live (two-person rule)

1. Confirm the change has been reviewed (no blind auto-deploy).
2. Export `ANTHROPIC_API_KEY` in the environment (never commit it; it is never
   logged).
3. Run with `--live`. If the backend is unreachable, fall back to mock — the
   engine stays deterministic.

## 7. Troubleshooting

| Symptom                          | Cause / fix                               |
|----------------------------------|-------------------------------------------|
| `No module named verdikvern`     | Run from `src/`, or add `src` to `PYTHONPATH` |
| `refusing to enable the live backend` | `ANTHROPIC_API_KEY` not set            |
| Every cycle ends `REWORK`        | Acceptance criteria not evidenced in body |
| A cycle ends `BLOCK`             | A hard safety rule matched — read the reason |
