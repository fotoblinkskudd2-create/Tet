# KUTT24 — Clean-Room Notes

KUTT24 is built and operated under a clean-room discipline. This document states
the boundaries plainly so there is no ambiguity for operators or partners.

## Civil / clean-room drone policy

All drone-related tasks in this engine are scoped to **civil use only**:
mapping, survey, inspection, agriculture, maintenance, privacy-safe imagery.

The engine **refuses** any output that references weaponization. The
PromotionGate hard-blocks terms such as *weaponize*, *munition*, *warhead*, and
*strike package* (`gates._WEAPONIZE`). There is no configuration flag that turns
this block off. A blocked output is escalated to a human, never promoted.

Partner work must carry an explicit clause prohibiting weaponization (see task
`T100`).

## No blind auto-deploy

The engine does not deploy. It produces outputs and judges them. Any output that
proposes unattended production deployment is hard-blocked
(`gates._AUTO_DEPLOY`). Promotion to production is a separate, human, two-person
decision outside this engine.

## No social-platform dependency

KUTT24 does not ingest X/Twitter or any social feed. Inputs are operator-driven
or task-bank-driven only (`input_binder.py`). Any output that introduces such a
dependency is hard-blocked (`gates._SOCIAL_DEP`). The test suite asserts the
source tree imports no social client (`test_no_social_dependency_in_source`).

## Secrets

Credential-shaped content in an output is hard-blocked (`gates._SECRET`). The
live backend key is read from the environment only and is never written to
memory or logs.

## Provenance

- The mock backend is fully deterministic; runs are reproducible offline.
- Binding decisions (run card shape, verdict) are computed in code, not left to
  a model, so every promotion can be re-derived and audited.
- Memory stores only durable facts (verdict + trace), not raw model chatter.
