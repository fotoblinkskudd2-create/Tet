"""The PromotionGate for the KUTT24 Value Engine.

The gate is strict by design. An output is promoted (PASS) only if it clears
*every* hard block and meets the acceptance coverage threshold. Anything short
of that is REWORK. Anything that trips a safety block is BLOCK — and a BLOCK can
never be auto-promoted by the loop.

Three verdicts, three meanings:

    PASS   -> safe, bound, and meets acceptance. Promote.
    REWORK -> safe and bound, but acceptance not yet met. Loop again.
    BLOCK  -> tripped a hard safety rule. Stop. Surface to a human.

Hard safety blocks encode KUTT24 policy:
  * no blind auto-deploy
  * civil / clean-room drone use only (no weaponization)
  * no secret/credential leakage into outputs
  * no social-platform (X/Twitter) dependency
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Tuple

from .contracts import Judgement, Output, RunCard, Verdict

# --- hard safety rules -------------------------------------------------------
# Each rule is (name, compiled pattern, human reason). A match => BLOCK.
_WEAPONIZE = re.compile(
    r"\b(weaponi[sz]e|armed drone|munition|warhead|payload to harm|strike package|kill chain)\b",
    re.IGNORECASE,
)
_AUTO_DEPLOY = re.compile(
    r"\b(auto[- ]?deploy to prod|blind deploy|deploy without review|push to production unattended)\b",
    re.IGNORECASE,
)
_SECRET = re.compile(
    r"(?i)\b(api[_-]?key|secret[_-]?key|password|bearer\s+[a-z0-9._-]{12,})\b|sk-[a-z0-9]{16,}",
)
_SOCIAL_DEP = re.compile(
    r"(?i)\b(depends on|requires|relies on)\b.{0,30}\b(x\.com|twitter|x api)\b",
)

_HARD_RULES: List[Tuple[str, re.Pattern, str]] = [
    ("drone_weaponization", _WEAPONIZE, "Output references weaponized drone use; clean-room policy is civil-only."),
    ("blind_auto_deploy", _AUTO_DEPLOY, "Output proposes blind auto-deploy; the engine forbids unattended production deploys."),
    ("secret_leak", _SECRET, "Output appears to contain a secret or credential."),
    ("social_dependency", _SOCIAL_DEP, "Output introduces an X/Twitter dependency, which is forbidden."),
]


@dataclass
class GateConfig:
    # Minimum fraction of acceptance criteria that must be satisfied to PASS.
    pass_threshold: float = 1.0
    # Minimum body length to be considered a real attempt (anti-empty-output).
    min_body_chars: int = 20


class PromotionGate:
    def __init__(self, config: GateConfig | None = None) -> None:
        self.config = config or GateConfig()

    def evaluate(self, card: RunCard, output: Output) -> Judgement:
        reasons: List[str] = []
        rework: List[str] = []

        # 1. Hard safety blocks take absolute precedence.
        block_reason = self._hard_block(card, output)
        if block_reason is not None:
            return Judgement(
                output_id=output.id,
                verdict=Verdict.BLOCK,
                reasons=[block_reason],
                score=0.0,
            )

        # 2. Anti-empty-output: an unsubstantiated output is REWORK, not PASS.
        if len(output.body.strip()) < self.config.min_body_chars:
            return Judgement(
                output_id=output.id,
                verdict=Verdict.REWORK,
                reasons=["Output body is too short to be a real attempt."],
                rework_notes=["Produce a substantive body addressing the objective."],
                score=0.0,
            )

        # 3. Acceptance coverage. Each criterion must be evidenced in the body
        #    or in an explicit claim.
        haystack = (output.body + "\n" + "\n".join(output.claims)).lower()
        met = 0
        total = len(card.acceptance) or 1
        for criterion in card.acceptance:
            if self._criterion_met(criterion, haystack):
                met += 1
            else:
                rework.append(f"Unmet acceptance: {criterion}")

        score = met / total
        if score >= self.config.pass_threshold:
            reasons.append(f"All {total} acceptance criteria evidenced.")
            verdict = Verdict.PASS
        else:
            reasons.append(f"Acceptance coverage {met}/{total} below threshold {self.config.pass_threshold:.2f}.")
            verdict = Verdict.REWORK

        return Judgement(
            output_id=output.id,
            verdict=verdict,
            reasons=reasons,
            rework_notes=rework,
            score=round(score, 3),
        )

    # -- helpers ---------------------------------------------------------
    def _hard_block(self, card: RunCard, output: Output) -> str | None:
        text = output.body + "\n" + "\n".join(output.claims)
        for _name, pattern, reason in _HARD_RULES:
            if pattern.search(text):
                return reason
        return None

    @staticmethod
    def _criterion_met(criterion: str, haystack: str) -> bool:
        """A criterion counts as met when the output evidences it.

        Heuristic but deterministic: the output must mention the criterion's
        salient content words. This is intentionally strict so the gate does
        not rubber-stamp.
        """

        words = [w for w in re.findall(r"[a-zæøå0-9]+", criterion.lower()) if len(w) > 3]
        if not words:
            return True
        hits = sum(1 for w in words if w in haystack)
        return hits >= max(1, len(words) // 2)
