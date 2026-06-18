"""Mock-mode tests for the KUTT24 Value Engine.

These tests run fully offline against the deterministic mock backend. They cover
the contract round-trips, the strict gate (PASS/REWORK/BLOCK including hard
safety blocks), the task bank invariants, and a full loop.
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from verdikvern import (  # noqa: E402
    EngineConfig,
    Output,
    RunCard,
    TaskBank,
    ValueEngine,
    Verdict,
)
from verdikvern.gates import PromotionGate  # noqa: E402
from verdikvern.llm_router import LLMRouter  # noqa: E402


@pytest.fixture
def engine(tmp_path):
    cfg = EngineConfig(memory_path=str(tmp_path / "mem.json"), live=False)
    return ValueEngine(cfg)


def test_task_bank_has_exactly_100():
    bank = TaskBank()
    assert len(bank) == 100
    assert len(bank.all()) == 100
    ids = {t.id for t in bank.all()}
    assert len(ids) == 100  # ids are unique
    assert "T001" in ids and "T100" in ids


def test_mock_backend_is_default(engine):
    assert engine.backend_name == "mock"


def test_router_never_downgrades_silently():
    router = LLMRouter(live=False)
    # mock tiers are labelled, not real model ids
    assert router.model_for("BYGGER").startswith("mock-")


def test_full_loop_runs_and_reaches_terminal_verdict(engine):
    report = engine.run_task("T001")
    assert report.final_verdict in (Verdict.PASS, Verdict.REWORK, Verdict.BLOCK)
    assert report.attempts >= 1
    # Memory was written (memory-first / durable facts).
    assert len(engine.memory) >= 1


def test_gate_blocks_weaponized_drone():
    gate = PromotionGate()
    card = RunCard(input_id="x", objective="drone task", acceptance=["civil only"])
    out = Output(card_id=card.id, body="We will weaponize the drone with a warhead payload.")
    judgement = gate.evaluate(card, out)
    assert judgement.verdict is Verdict.BLOCK


def test_gate_blocks_blind_auto_deploy():
    gate = PromotionGate()
    card = RunCard(input_id="x", objective="ship", acceptance=["safe"])
    out = Output(card_id=card.id, body="Just blind deploy to prod without review.")
    judgement = gate.evaluate(card, out)
    assert judgement.verdict is Verdict.BLOCK


def test_gate_blocks_secret_leak():
    gate = PromotionGate()
    card = RunCard(input_id="x", objective="config", acceptance=["safe"])
    out = Output(card_id=card.id, body="here is the api_key=sk-abcdef0123456789abcdef")
    judgement = gate.evaluate(card, out)
    assert judgement.verdict is Verdict.BLOCK


def test_block_never_auto_promotes(engine):
    # An input that trips a hard block must stop and never PASS.
    report = engine.run_text("Please weaponize the drone with a munition payload.")
    assert report.final_verdict is Verdict.BLOCK
    assert report.attempts == 1  # hard stop, no rework loop


def test_short_output_is_rework_not_pass():
    gate = PromotionGate()
    card = RunCard(input_id="x", objective="do", acceptance=["something concrete"])
    out = Output(card_id=card.id, body="ok")
    judgement = gate.evaluate(card, out)
    assert judgement.verdict is Verdict.REWORK


def test_contract_round_trip():
    card = RunCard(input_id="i", objective="obj", acceptance=["a", "b"])
    restored = RunCard.from_dict(card.to_dict())
    assert restored.objective == card.objective
    assert restored.acceptance == card.acceptance


def test_no_social_dependency_in_source():
    # The engine must not depend on X/Twitter ingestion anywhere in src.
    src = os.path.join(os.path.dirname(__file__), "..", "src", "verdikvern")
    offenders = []
    for root, _dirs, files in os.walk(src):
        for f in files:
            if f.endswith(".py"):
                with open(os.path.join(root, f), encoding="utf-8") as fh:
                    text = fh.read().lower()
                if "import tweepy" in text or "twitter.com/api" in text:
                    offenders.append(f)
    assert not offenders
