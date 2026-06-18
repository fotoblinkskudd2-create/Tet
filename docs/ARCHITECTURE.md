# KUTT24 — Architecture

KUTT24 is a **memory-bound value engine**. It is not an agent factory. It is a
narrow loop that turns inputs into promoted outputs, and refuses to promote
anything that is unsafe or unsubstantiated.

## The loop

```
input → memory → run card → output → judgement → next input
```

Every turn:

1. **input** — an operator string or a task-bank task, normalized into the
   `Input` contract by the `InputBinder`. No social-platform ingestion.
2. **memory** — the `MemoryBinder` binds the relevant slice of durable memory to
   the input. Memory-first: nothing is built before memory is bound.
3. **run card** — the HENTER cell frames the objective and acceptance criteria
   into a `RunCard`. The card is the plan of record.
4. **output** — the BYGGER cell builds an artifact *under the card* and
   self-reviews it. This is output-binding: an output is only valid against the
   card it was built under.
5. **judgement** — the DOMMER cell rules via the strict `PromotionGate`:
   `PASS` / `REWORK` / `BLOCK`.
6. **next input** — `PASS` ends the work; `REWORK` feeds back as the next input
   with the judge's notes; `BLOCK` stops and surfaces to a human.

## The three cells

```
HENTER (1, fetch)  →  BYGGER (3, build)  →  DOMMER (2, judge)
```

| Cell   | Role               | Model tier | Output            |
|--------|--------------------|------------|-------------------|
| HENTER | retrieval/framing  | fast       | `RunCard`         |
| BYGGER | build + self-review| deep       | `Output`          |
| DOMMER | adversarial judge  | judge      | `Judgement`       |

Each cell makes exactly one model call through the shared `LLMRouter`. The
binding decisions (the run card structure and the verdict) are computed
deterministically, so promotion is reproducible and auditable — the model
narrates, the gate rules.

## Backends

The router defaults to a **deterministic mock backend**: the whole engine runs,
tests, and demos offline with no credentials and no network. A live Claude
backend is available only behind an explicit `--live` flag *and*
`ANTHROPIC_API_KEY`. The router never silently downgrades to a smaller model
than requested. Model ids live in exactly one place: `llm_router.CLAUDE_MODELS`.

## Memory

A durable, append-mostly JSON store (`.verdikvern/memory.json`). Retrieval is
dependency-free (token overlap + recency + weight) — good enough to be useful,
cheap enough for a tight loop, swappable for an embedding store without changing
any contract.

The loop persists **only durable facts** (verdict + one-line trace per cycle),
not raw chatter.

## Safety posture

The `PromotionGate` enforces hard blocks that can never be auto-promoted:

- **no blind auto-deploy** — unattended production deploys are blocked.
- **civil / clean-room only** — weaponized drone references are blocked.
- **no secret leakage** — credential-shaped content is blocked.
- **no X/Twitter dependency** — social-platform dependencies are blocked.

A `BLOCK` is a hard stop. The loop pauses and surfaces it to a human; there is
no path from `BLOCK` to promotion.

## Module map

| Module             | Responsibility                                  |
|--------------------|-------------------------------------------------|
| `contracts.py`     | typed, serializable data contracts              |
| `input_binder.py`  | raw input → `Input`; rework follow-ups          |
| `memory_binder.py` | persist + retrieve durable memory               |
| `task_bank.py`     | the 100 concrete tasks                          |
| `llm_router.py`    | single choke point for model calls (mock/live)  |
| `self_review.py`   | BYGGER's pre-judge self-check                    |
| `gates.py`         | the strict PromotionGate                        |
| `agents.py`        | HENTER / BYGGER / DOMMER cells                   |
| `run_loop.py`      | the bounded orchestration loop                  |
| `cli.py`           | operator command-line interface                 |
