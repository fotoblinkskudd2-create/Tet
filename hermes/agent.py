"""
OpenClaw Hermes — core agent loop.

Perceive → Think → Act → Observe
"""
from __future__ import annotations

from typing import Callable, Optional

from hermes.memory import MemoryStore
from hermes.tools import ToolRegistry

_FALLBACK = "Hermes here — I'm not sure how to handle that yet. Try rephrasing!"


class HermesAgent:
    """Lightweight AI agent with bounded memory and pluggable tools.

    Args:
        registry:  ToolRegistry to dispatch against.
        memory:    MemoryStore instance; defaults to standard settings if omitted.
        think_fn:  Optional LLM hook: think_fn(context_block, user_input) -> str.
                   When provided, called before tool dispatch. If think_fn returns
                   a non-empty string AND no tool matches, the LLM response is used
                   directly. When None, the agent works fully offline.
    """

    def __init__(
        self,
        registry: ToolRegistry,
        memory: Optional[MemoryStore] = None,
        think_fn: Optional[Callable[[str, str], str]] = None,
    ) -> None:
        self.registry = registry
        self.memory = memory if memory is not None else MemoryStore()
        self._think_fn = think_fn

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    def run(self, user_input: str) -> str:
        text = self._perceive(user_input)
        thought = self._think(text)
        response = self._act(text, thought)
        return self._observe(response)

    # ------------------------------------------------------------------
    # Pipeline steps
    # ------------------------------------------------------------------

    def _perceive(self, raw_input: str) -> str:
        text = raw_input.strip()
        self.memory.add("user", text)
        return text

    def _think(self, input_text: str) -> Optional[str]:
        if self._think_fn is None:
            return None
        context = self.memory.context_block()
        try:
            result = self._think_fn(context, input_text)
            return result if result and result.strip() else None
        except Exception:
            return None

    def _act(self, input_text: str, thought: Optional[str]) -> str:
        tool = self.registry.find(input_text)
        if tool is not None:
            try:
                result = tool.handle(input_text)
                self.memory.set_fact("last_tool", tool.name)
                return result
            except Exception as exc:
                return f"Tool '{tool.name}' encountered an error: {exc}"
        if thought:
            return thought
        return _FALLBACK

    def _observe(self, agent_response: str) -> str:
        self.memory.add("agent", agent_response)
        return agent_response
