"""LLM routing for the KUTT24 Value Engine.

The router is the single choke point for model calls. It defaults to a fully
deterministic **mock** backend so the whole engine can run, be tested, and be
demoed offline with zero credentials and zero network.

A real backend (Anthropic Claude) is available behind an explicit opt-in. The
model ids below are the current Claude family; the router never silently
downgrades to a smaller model than requested.

Routing policy
--------------
The engine has three model tiers, mapped to the three cells:

    HENTER  -> fast tier   (retrieval / framing)
    BYGGER  -> deep tier    (building the artifact)
    DOMMER  -> judge tier   (adversarial review)

By default every tier resolves to the mock backend.
"""

from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from typing import Dict, Optional

# Current Claude model ids. Used only when the live backend is explicitly
# enabled. Kept here so there is exactly one place to update on migration.
CLAUDE_MODELS = {
    "fast": "claude-haiku-4-5-20251001",
    "deep": "claude-opus-4-8",
    "judge": "claude-sonnet-4-6",
}

TIER_BY_CELL = {
    "HENTER": "fast",
    "BYGGER": "deep",
    "DOMMER": "judge",
}


@dataclass
class LLMResponse:
    text: str
    backend: str
    model: str


class MockBackend:
    """Deterministic, offline stand-in for a real model.

    It does not pretend to be smart. It echoes structured, predictable text so
    that gates and the loop have something concrete and stable to operate on.
    """

    name = "mock"

    def complete(self, *, system: str, prompt: str, model: str) -> LLMResponse:
        digest = hashlib.sha256((system + "\n" + prompt).encode("utf-8")).hexdigest()[:8]
        text = (
            f"[mock:{model}] {prompt.strip()}\n"
            f"trace={digest}"
        )
        return LLMResponse(text=text, backend=self.name, model=model)


class AnthropicBackend:
    """Live Claude backend. Imported lazily so the package has no hard dep."""

    name = "anthropic"

    def __init__(self) -> None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set; refusing to enable the live backend."
            )
        try:
            import anthropic  # type: ignore
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise RuntimeError(
                "The 'anthropic' package is not installed. Run mock mode or `pip install anthropic`."
            ) from exc
        self._client = anthropic.Anthropic(api_key=api_key)

    def complete(self, *, system: str, prompt: str, model: str) -> LLMResponse:  # pragma: no cover - network
        msg = self._client.messages.create(
            model=model,
            max_tokens=2048,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in msg.content if getattr(block, "type", None) == "text")
        return LLMResponse(text=text, backend=self.name, model=model)


class LLMRouter:
    def __init__(self, *, live: bool = False, models: Optional[Dict[str, str]] = None) -> None:
        self.live = live
        self.models = dict(CLAUDE_MODELS)
        if models:
            self.models.update(models)
        self._backend = AnthropicBackend() if live else MockBackend()

    @property
    def backend_name(self) -> str:
        return self._backend.name

    def model_for(self, cell: str) -> str:
        tier = TIER_BY_CELL.get(cell, "deep")
        if self.live:
            return self.models[tier]
        return f"mock-{tier}"

    def route(self, *, cell: str, system: str, prompt: str) -> LLMResponse:
        model = self.model_for(cell)
        return self._backend.complete(system=system, prompt=prompt, model=model)
