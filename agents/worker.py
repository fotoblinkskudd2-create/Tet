"""
Worker agent: repeatedly researches its assigned topics via Claude API,
saves findings to MemoryStore, and sends heartbeats.
"""
from __future__ import annotations

import logging
import threading
import time
from typing import Any

import anthropic

from config import (
    ANTHROPIC_API_KEY,
    CLAUDE_MODEL,
    TOPIC_INSTRUCTIONS,
    WORKER_CYCLE_INTERVAL_SEC,
)
from agents.memory_store import Finding, MemoryStore

logger = logging.getLogger(__name__)


class WorkerAgent(threading.Thread):
    """Runs in its own thread; queries Claude in cycles until stop_event is set."""

    def __init__(
        self,
        agent_id: str,
        topics: list[str],
        store: MemoryStore,
        stop_event: threading.Event,
        cycle_interval: int = WORKER_CYCLE_INTERVAL_SEC,
    ) -> None:
        super().__init__(name=agent_id, daemon=True)
        self.agent_id = agent_id
        self.topics = topics
        self.store = store
        self.stop_event = stop_event
        self.cycle_interval = cycle_interval
        self._cycles = 0
        self._client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # ------------------------------------------------------------------ #

    def run(self) -> None:
        logger.info("[%s] started, topics: %s", self.agent_id, self.topics)
        while not self.stop_event.is_set():
            self._run_cycle()
            self.store.heartbeat(self.agent_id, self._cycles, self.topics)
            # Wait for next cycle or until stopped
            self.stop_event.wait(timeout=self.cycle_interval)
        self.store.mark_done(self.agent_id)
        logger.info("[%s] finished after %d cycles", self.agent_id, self._cycles)

    # ------------------------------------------------------------------ #

    def _run_cycle(self) -> None:
        self._cycles += 1
        logger.info("[%s] cycle %d begin", self.agent_id, self._cycles)
        for topic in self.topics:
            if self.stop_event.is_set():
                return
            try:
                findings = self._research_topic(topic)
                for f in findings:
                    self.store.add_finding(f)
            except Exception as exc:
                logger.error("[%s] error on topic %s: %s", self.agent_id, topic, exc)

    def _research_topic(self, topic: str) -> list[Finding]:
        instruction = TOPIC_INSTRUCTIONS.get(topic, f"Research monetization of: {topic}")
        system_prompt = (
            "You are a sharp market-research agent. Your job is to find fast money-making "
            "opportunities. Be specific, actionable, and brutally honest about effort required. "
            "For each opportunity output EXACTLY this JSON structure as a list:\n"
            '[\n'
            '  {\n'
            '    "opportunity": "<one-line description>",\n'
            '    "speed_to_money": <1-10>,\n'
            '    "effort": "<low|medium|high>",\n'
            '    "first_action": "<concrete next step>",\n'
            '    "earning_potential": "<realistic monthly estimate>"\n'
            '  }\n'
            ']\n'
            "Return ONLY valid JSON, no markdown fences, no prose."
        )
        message = self._client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": instruction}],
        )
        raw = message.content[0].text.strip()
        items = _parse_json_list(raw)
        findings: list[Finding] = []
        for item in items:
            findings.append(
                Finding(
                    topic=topic,
                    agent_id=self.agent_id,
                    cycle=self._cycles,
                    timestamp=time.time(),
                    opportunity=item.get("opportunity", ""),
                    speed_to_money=int(item.get("speed_to_money", 5)),
                    effort=item.get("effort", "medium"),
                    first_action=item.get("first_action", ""),
                    earning_potential=item.get("earning_potential", ""),
                )
            )
        logger.info("[%s] topic=%s findings=%d", self.agent_id, topic, len(findings))
        return findings


# ------------------------------------------------------------------ #
#  Helpers
# ------------------------------------------------------------------ #

def _parse_json_list(raw: str) -> list[dict[str, Any]]:
    import json
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return [data]
    except json.JSONDecodeError:
        # Attempt to extract a JSON array from messy output
        import re
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    logger.warning("Could not parse JSON from agent response: %s", raw[:200])
    return []
