"""
Mock worker for testing without an API key.
Generates deterministic fake findings so the full orchestrator pipeline
can be validated end-to-end.

Activated automatically when ANTHROPIC_API_KEY is empty or 'mock'.
"""
from __future__ import annotations

import random
import threading
import time

from agents.memory_store import Finding, MemoryStore
from config import WORKER_CYCLE_INTERVAL_SEC

import logging

logger = logging.getLogger(__name__)

_MOCK_OPPORTUNITIES: dict[str, list[dict]] = {
    "kunst": [
        {"opportunity": "AI portrait commissions via Etsy", "speed_to_money": 8, "effort": "low",
         "first_action": "Set up Etsy shop with 5 AI portrait samples", "earning_potential": "$500-2000/month"},
        {"opportunity": "Print-on-demand wall art via Redbubble", "speed_to_money": 7, "effort": "low",
         "first_action": "Upload 20 trending art styles to Redbubble today", "earning_potential": "$200-800/month"},
    ],
    "musikk": [
        {"opportunity": "License AI music to Pond5/AudioJungle", "speed_to_money": 8, "effort": "low",
         "first_action": "Generate 10 royalty-free tracks and submit to Pond5", "earning_potential": "$300-1500/month"},
        {"opportunity": "Sell custom jingles to small businesses via Fiverr", "speed_to_money": 9, "effort": "low",
         "first_action": "Create Fiverr gig for 30-second custom jingles at $50", "earning_potential": "$500-2000/month"},
    ],
    "video": [
        {"opportunity": "Faceless YouTube channel (finance niche) via AI voiceover", "speed_to_money": 6,
         "effort": "medium", "first_action": "Publish 3 videos on personal finance this week",
         "earning_potential": "$1000-5000/month"},
        {"opportunity": "UGC creator deals for SaaS tools", "speed_to_money": 9, "effort": "low",
         "first_action": "Apply to 10 SaaS companies on Billo/Insense today",
         "earning_potential": "$500-3000/month"},
    ],
    "forfatter": [
        {"opportunity": "AI-assisted Kindle short books (how-to niche)", "speed_to_money": 7, "effort": "low",
         "first_action": "Write and publish first 80-page Kindle book this week",
         "earning_potential": "$200-2000/month"},
        {"opportunity": "Substack newsletter (niche: AI tools weekly)", "speed_to_money": 5, "effort": "medium",
         "first_action": "Launch free Substack, post first issue, add paid tier at $7/mo",
         "earning_potential": "$500-5000/month"},
    ],
    "vibe_code": [
        {"opportunity": "Sell Cursor/Claude prompt packs on Gumroad", "speed_to_money": 9, "effort": "low",
         "first_action": "Package 20 Cursor prompts, list on Gumroad at $19",
         "earning_potential": "$300-2000/month"},
        {"opportunity": "Build micro-SaaS with Claude in a weekend", "speed_to_money": 7, "effort": "medium",
         "first_action": "Identify one repetitive B2B task, build it in 48h, charge $49/mo",
         "earning_potential": "$1000-10000/month"},
    ],
    "nye_oppfinnelser": [
        {"opportunity": "3D-printed custom phone accessories on Etsy", "speed_to_money": 7, "effort": "medium",
         "first_action": "Design 3 trending phone stand variants and list on Etsy",
         "earning_potential": "$300-1500/month"},
        {"opportunity": "Dropship health-tech gadgets via AliExpress + Shopify", "speed_to_money": 6,
         "effort": "medium", "first_action": "Source top-selling biohacking gadget, set up Shopify store",
         "earning_potential": "$500-3000/month"},
    ],
    "trender": [
        {"opportunity": "B2B AI automation consulting (1-day audits)", "speed_to_money": 9, "effort": "low",
         "first_action": "Cold-email 20 local SMBs offering a 2h AI audit for $299",
         "earning_potential": "$2000-10000/month"},
        {"opportunity": "Community monetization via Discord + course bundle", "speed_to_money": 6,
         "effort": "medium", "first_action": "Launch Discord for a niche, charge $15/mo after 100 free members",
         "earning_potential": "$500-5000/month"},
    ],
    "nye_produkter": [
        {"opportunity": "Digital templates pack (Notion, Canva) on Gumroad", "speed_to_money": 9,
         "effort": "low", "first_action": "Create 5 Notion templates, bundle for $29 on Gumroad",
         "earning_potential": "$200-2000/month"},
        {"opportunity": "White-label AI chatbot for local businesses", "speed_to_money": 8, "effort": "medium",
         "first_action": "Use Voiceflow to build a demo, pitch 5 local restaurants",
         "earning_potential": "$500-3000/month"},
    ],
}


class MockWorkerAgent(threading.Thread):
    """Fake worker for pipeline testing — no API calls."""

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

    def run(self) -> None:
        logger.info("[MOCK %s] started", self.agent_id)
        while not self.stop_event.is_set():
            self._run_cycle()
            self.store.heartbeat(self.agent_id, self._cycles, self.topics)
            self.stop_event.wait(timeout=self.cycle_interval)
        self.store.mark_done(self.agent_id)

    def _run_cycle(self) -> None:
        self._cycles += 1
        for topic in self.topics:
            if self.stop_event.is_set():
                return
            candidates = _MOCK_OPPORTUNITIES.get(topic, [])
            item = random.choice(candidates) if candidates else {}
            if item:
                self.store.add_finding(Finding(
                    topic=topic,
                    agent_id=self.agent_id,
                    cycle=self._cycles,
                    timestamp=time.time(),
                    opportunity=item["opportunity"],
                    speed_to_money=item["speed_to_money"],
                    effort=item["effort"],
                    first_action=item["first_action"],
                    earning_potential=item["earning_potential"],
                ))
