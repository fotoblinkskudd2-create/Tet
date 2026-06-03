"""Tester agent - runs pytest and smoke-tests the new solver."""
from __future__ import annotations
import subprocess
import sys
from pathlib import Path

import anthropic

from .base import BaseAgent
import config


class TesterAgent(BaseAgent):
    def __init__(self, client: anthropic.Anthropic):
        super().__init__(client, model=config.MODEL_FAST)

    def run(self, task_data: dict) -> dict:
        proposal = task_data.get("proposal", {})
        base_dir = str(Path(config.APP_FILE).parent)

        # Full pytest suite
        pytest_result = subprocess.run(
            [sys.executable, "-m", "pytest", config.TESTS_DIR, "-v", "--tb=short", "-q"],
            capture_output=True,
            text=True,
            cwd=base_dir,
        )
        pytest_passed = pytest_result.returncode == 0
        pytest_output = (pytest_result.stdout + pytest_result.stderr)[:3000]

        # Smoke tests from proposal
        smoke_results = []
        for tc in proposal.get("test_cases", []):
            r = subprocess.run(
                [sys.executable, config.APP_FILE, tc["input"]],
                capture_output=True,
                text=True,
                cwd=base_dir,
                timeout=15,
            )
            out = r.stdout + r.stderr
            passed = tc.get("expected_contains", "") in out
            smoke_results.append({
                "input": tc["input"],
                "expected_contains": tc.get("expected_contains", ""),
                "actual_output": out[:300],
                "passed": passed,
            })
            if not passed:
                self.logger.warning(
                    "Smoke test FAILED: %r not in %r", tc["expected_contains"], out[:200]
                )

        smoke_passed = all(r["passed"] for r in smoke_results) if smoke_results else True
        all_passed = pytest_passed and smoke_passed

        self.logger.info(
            "Tests: pytest=%s smoke=%s (%d/%d passed)",
            pytest_passed,
            smoke_passed,
            sum(r["passed"] for r in smoke_results),
            len(smoke_results),
        )

        return {
            **task_data,
            "pytest_passed": pytest_passed,
            "pytest_output": pytest_output,
            "smoke_results": smoke_results,
            "smoke_passed": smoke_passed,
            "all_passed": all_passed,
        }
