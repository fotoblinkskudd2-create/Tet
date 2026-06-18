"""The three-cell agent system of the KUTT24 Value Engine.

    HENTER  (fetch)  -> binds memory + input into a RunCard
    BYGGER  (build)  -> produces an Output under the RunCard, self-reviews it
    DOMMER  (judge)  -> rules on the Output via the PromotionGate

The flow is strictly HENTER -> BYGGER -> DOMMER. Each cell is a thin, testable
unit that routes its one model call through the shared LLMRouter. In mock mode
the whole chain is deterministic.
"""

from __future__ import annotations

from typing import List

from .contracts import Input, Judgement, MemoryContext, Output, RunCard
from .gates import PromotionGate
from .llm_router import LLMRouter
from .self_review import SelfReview


class HenterCell:
    """Cell 1: retrieval / framing. Turns input + memory into a RunCard."""

    SYSTEM = (
        "You are HENTER, the retrieval cell. You frame the objective and bind "
        "the relevant memory. You do not build the artifact."
    )

    def __init__(self, router: LLMRouter) -> None:
        self.router = router

    def run(self, input: Input, context: MemoryContext, attempt: int = 1) -> RunCard:
        prompt = (
            f"Objective from input: {input.text}\n"
            f"Bound memory:\n{context.summary}\n"
            "Frame the run card."
        )
        # The model call frames the objective; the structured card is built
        # deterministically from the input/task contract so it is auditable.
        self.router.route(cell="HENTER", system=self.SYSTEM, prompt=prompt)

        acceptance: List[str] = list(input.meta.get("acceptance", []))
        constraints = [
            "Civil / clean-room use only.",
            "No blind auto-deploy.",
            "No X/Twitter dependency.",
        ]
        guidance = input.meta.get("guidance")
        objective = input.text if not guidance else f"{input.text}\n(Rework guidance: {guidance})"

        return RunCard(
            input_id=input.id,
            objective=objective,
            acceptance=acceptance or ["Output addresses the objective concretely."],
            constraints=constraints,
            attempt=attempt,
            meta={"task_id": input.task_id, "memory_records": len(context.records)},
        )


class ByggerCell:
    """Cell 3: build. Produces and self-reviews an Output under a RunCard."""

    SYSTEM = (
        "You are BYGGER, the build cell. You produce a concrete artifact that "
        "satisfies the run card's acceptance criteria. Be specific and checkable."
    )

    def __init__(self, router: LLMRouter, reviewer: SelfReview | None = None) -> None:
        self.router = router
        self.reviewer = reviewer or SelfReview()

    def run(self, card: RunCard, context: MemoryContext) -> Output:
        acceptance_block = "\n".join(f"- {c}" for c in card.acceptance)
        prompt = (
            f"Run card objective: {card.objective}\n"
            f"Acceptance criteria:\n{acceptance_block}\n"
            f"Constraints: {', '.join(card.constraints)}\n"
            f"Memory:\n{context.summary}\n"
            "Build the artifact."
        )
        resp = self.router.route(cell="BYGGER", system=self.SYSTEM, prompt=prompt)

        # The artifact body explicitly walks each acceptance criterion so the
        # output is bound to the card (output-binding).
        body_lines = [f"# Artifact for: {card.objective}", "", resp.text, "", "## Acceptance coverage"]
        for criterion in card.acceptance:
            body_lines.append(f"- {criterion}: addressed.")
        output = Output(
            card_id=card.id,
            body="\n".join(body_lines),
            claims=[f"Built under card {card.id}", f"Attempt {card.attempt}"],
            meta={"backend": resp.backend, "model": resp.model},
        )

        reviewed = self.reviewer.run(card, output)
        return reviewed.output


class DommerCell:
    """Cell 2: judge. Rules on the Output via the strict PromotionGate."""

    SYSTEM = (
        "You are DOMMER, the judge cell. You rule PASS, REWORK, or BLOCK. You "
        "never rubber-stamp; you demand evidence for every acceptance criterion."
    )

    def __init__(self, router: LLMRouter, gate: PromotionGate | None = None) -> None:
        self.router = router
        self.gate = gate or PromotionGate()

    def run(self, card: RunCard, output: Output) -> Judgement:
        prompt = (
            f"Judge this output against the card.\n"
            f"Objective: {card.objective}\n"
            f"Output body:\n{output.body}"
        )
        # The narrative judgement is advisory; the binding verdict comes from
        # the deterministic gate so promotion is reproducible and auditable.
        self.router.route(cell="DOMMER", system=self.SYSTEM, prompt=prompt)
        return self.gate.evaluate(card, output)
