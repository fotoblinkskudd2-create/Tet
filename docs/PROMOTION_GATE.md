# KUTT24 — PromotionGate

The PromotionGate is the only thing allowed to promote an output. It is strict
by design: it would rather hold a good output in `REWORK` than wave through a
bad one.

## Decision order

The gate evaluates in a fixed precedence so the result is reproducible:

1. **Hard safety blocks** (highest precedence). If any match, the verdict is
   `BLOCK` immediately — acceptance is never even scored.
2. **Anti-empty-output.** A body shorter than `min_body_chars` (default 20) is
   `REWORK`, never `PASS`.
3. **Acceptance coverage.** Each acceptance criterion must be evidenced in the
   output body or an explicit claim. Coverage `≥ pass_threshold` (default 1.0,
   i.e. *all* criteria) ⇒ `PASS`; otherwise `REWORK`.

## The three verdicts

| Verdict  | Meaning                                            | Loop behaviour          |
|----------|----------------------------------------------------|-------------------------|
| `PASS`   | safe, bound, all acceptance met                    | promote, stop           |
| `REWORK` | safe and bound, acceptance not yet met             | feed notes back, retry  |
| `BLOCK`  | tripped a hard safety rule                         | hard stop, surface      |

## Hard safety rules

| Rule                  | Triggers on                                  | Why                              |
|-----------------------|----------------------------------------------|----------------------------------|
| `drone_weaponization` | weaponize / munition / warhead / strike pkg  | civil clean-room policy          |
| `blind_auto_deploy`   | deploy without review / unattended prod push | no blind auto-deploy             |
| `secret_leak`         | api/secret keys, bearer tokens, `sk-…`       | never leak credentials           |
| `social_dependency`   | "depends on … X/Twitter"                      | no social-platform dependency    |

A `BLOCK` can **never** be auto-promoted and the loop will not generate a rework
follow-up from it — it is escalated to a human.

## Why the verdict is deterministic

The model cells (HENTER/BYGGER/DOMMER) narrate and reason, but the *binding*
verdict comes from this gate's deterministic checks. That means: same card +
same output ⇒ same verdict, every time, with or without a live model. Promotion
is auditable.

## Tuning

`GateConfig` exposes:

- `pass_threshold` — fraction of acceptance criteria required to PASS. Lowering
  this trades strictness for throughput. Default `1.0`.
- `min_body_chars` — minimum substantive body length. Default `20`.

Defaults err toward `REWORK`. Loosen only with a documented reason.
