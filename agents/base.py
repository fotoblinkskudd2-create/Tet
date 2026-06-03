"""Base agent with Claude API integration and retry logic."""
from __future__ import annotations
import logging
import time
from abc import ABC, abstractmethod
from typing import Optional

import anthropic

import config


class BaseAgent(ABC):
    def __init__(self, client: anthropic.Anthropic, model: Optional[str] = None):
        self.client = client
        self.model = model or config.MODEL_FAST
        self.logger = logging.getLogger(self.__class__.__name__)

    def call_claude(
        self,
        messages: list,
        system: str = "",
        max_tokens: int = 4096,
        retries: int = 3,
    ) -> str:
        for attempt in range(retries):
            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    system=system,
                    messages=messages,
                )
                return response.content[0].text
            except anthropic.RateLimitError:
                wait = 2 ** (attempt + 2) * 10
                self.logger.warning("Rate limited. Waiting %ds (attempt %d/%d)", wait, attempt + 1, retries)
                time.sleep(wait)
            except anthropic.APIError as e:
                self.logger.error("API error attempt %d/%d: %s", attempt + 1, retries, e)
                if attempt == retries - 1:
                    raise
                time.sleep(5 * (attempt + 1))
        raise RuntimeError("All API retries exhausted")

    @abstractmethod
    def run(self, task_data: dict) -> dict:
        """Execute the agent's task. Returns enriched task data."""
