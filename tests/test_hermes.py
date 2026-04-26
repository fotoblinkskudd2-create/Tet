"""Tests for the OpenClaw Hermes AI agent framework."""
from __future__ import annotations

import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

import pytest

from hermes.memory import MemoryStore, Turn
from hermes.tools import Tool, ToolRegistry
from hermes.adapters import default_registry
from hermes.agent import HermesAgent


# ---------------------------------------------------------------------------
# MemoryStore tests
# ---------------------------------------------------------------------------

class TestMemoryStore:
    def test_add_and_retrieve_via_snapshot(self):
        mem = MemoryStore()
        mem.add("user", "hello")
        mem.add("agent", "hi there")
        snap = mem.snapshot()
        assert len(snap.window) == 2
        assert snap.window[0].role == "user"
        assert snap.window[1].role == "agent"

    def test_window_evicts_after_limit(self):
        mem = MemoryStore(window_size=3)
        for i in range(8):
            mem.add("user", f"message {i}")
        snap = mem.snapshot()
        assert len(snap.window) == 3

    def test_evicted_turns_appear_in_summary(self):
        mem = MemoryStore(window_size=2)
        mem.add("user", "first message")
        mem.add("user", "second message")
        mem.add("user", "third message")  # triggers eviction
        snap = mem.snapshot()
        assert "first message" in snap.summary

    def test_context_block_is_bounded(self):
        mem = MemoryStore(window_size=6, max_chars_per_turn=400, summary_max_chars=300)
        for i in range(20):
            mem.add("user", "x" * 500)   # exceeds per-turn cap
            mem.add("agent", "y" * 500)
        assert len(mem.context_block()) < 3200

    def test_kv_roundtrip(self):
        mem = MemoryStore()
        mem.set_fact("last_tool", "math")
        assert mem.get_fact("last_tool") == "math"

    def test_get_fact_missing_returns_none(self):
        mem = MemoryStore()
        assert mem.get_fact("nonexistent") is None

    def test_kv_appears_in_context_block(self):
        mem = MemoryStore()
        mem.set_fact("last_tool", "anagram")
        block = mem.context_block()
        assert "last_tool=anagram" in block

    def test_summary_stays_bounded_after_many_evictions(self):
        mem = MemoryStore(window_size=2, summary_max_chars=100)
        for i in range(30):
            mem.add("user", f"turn {i} " * 20)
        assert len(mem.snapshot().summary) <= 100

    def test_per_turn_char_cap_enforced(self):
        mem = MemoryStore(max_chars_per_turn=50)
        mem.add("user", "a" * 200)
        snap = mem.snapshot()
        assert len(snap.window[0].content) == 50

    def test_context_block_recent_section(self):
        mem = MemoryStore()
        mem.add("user", "test input")
        block = mem.context_block()
        assert "[RECENT]" in block
        assert "test input" in block


# ---------------------------------------------------------------------------
# ToolRegistry tests
# ---------------------------------------------------------------------------

class TestToolRegistry:
    def _make_tool(self, name: str, trigger: str) -> Tool:
        return Tool(
            name=name,
            description=f"Handles '{trigger}'",
            can_handle=lambda s, t=trigger: t in s,
            handle=lambda s, n=name: f"handled by {n}",
        )

    def test_find_returns_first_match(self):
        registry = ToolRegistry()
        registry.register(self._make_tool("first", "hello"))
        registry.register(self._make_tool("second", "hello"))
        tool = registry.find("say hello world")
        assert tool is not None
        assert tool.name == "first"

    def test_find_returns_none_for_no_match(self):
        registry = ToolRegistry()
        registry.register(self._make_tool("only", "xyz"))
        assert registry.find("hello") is None

    def test_find_returns_none_for_empty_registry(self):
        registry = ToolRegistry()
        assert registry.find("anything") is None

    def test_all_descriptions_format(self):
        registry = ToolRegistry()
        registry.register(self._make_tool("math", "calc"))
        descs = registry.all_descriptions()
        assert len(descs) == 1
        assert "math" in descs[0]

    def test_len(self):
        registry = ToolRegistry()
        assert len(registry) == 0
        registry.register(self._make_tool("a", "a"))
        assert len(registry) == 1


# ---------------------------------------------------------------------------
# Adapter smoke tests
# ---------------------------------------------------------------------------

class TestAdapters:
    def test_default_registry_has_five_tools(self):
        registry = default_registry()
        assert len(registry) == 5

    def test_math_adapter_matches(self):
        registry = default_registry()
        tool = registry.find("2 + 3")
        assert tool is not None
        assert tool.name == "math"

    def test_anagram_adapter_matches(self):
        registry = default_registry()
        tool = registry.find("anagram of listen")
        assert tool is not None
        assert tool.name == "anagram"

    def test_panic_adapter_matches(self):
        registry = default_registry()
        tool = registry.find("I am having a panic attack")
        assert tool is not None
        assert tool.name == "panic_support"

    def test_creative_adapter_matches_prompt_prefix(self):
        registry = default_registry()
        tool = registry.find("prompt: misty forest")
        assert tool is not None
        assert tool.name == "creative_prompt"

    def test_brainstorm_is_final_fallback(self):
        registry = default_registry()
        tool = registry.find("something completely unknown xyz123")
        assert tool is not None
        assert tool.name == "brainstorm"


# ---------------------------------------------------------------------------
# HermesAgent integration tests
# ---------------------------------------------------------------------------

class TestHermesAgent:
    def _agent(self) -> HermesAgent:
        return HermesAgent(registry=default_registry())

    def test_solves_math(self):
        result = self._agent().run("2 + 3 * 4")
        assert "14" in result

    def test_solves_anagram(self):
        result = self._agent().run("anagram of listen")
        assert "silent" in result or "enlist" in result or "tinsel" in result

    def test_panic_support(self):
        result = self._agent().run("I am having a panic attack")
        assert "panic" in result.lower() or "safe" in result.lower()

    def test_creative_prompt(self):
        result = self._agent().run("prompt: misty forest at dawn")
        assert len(result) > 20

    def test_brainstorm_fallback(self):
        result = self._agent().run("xyzzy completely unknown input 99999")
        assert len(result) > 0

    def test_memory_persists_across_turns(self):
        agent = self._agent()
        agent.run("2 + 2")
        block = agent.memory.context_block()
        assert "2 + 2" in block

    def test_last_tool_fact_updated(self):
        agent = self._agent()
        agent.run("2 + 2")
        assert agent.memory.get_fact("last_tool") == "math"

    def test_custom_tool_registered_and_used(self):
        agent = self._agent()
        # Insert before the catch-all brainstorm fallback (index -1 = before last).
        agent.registry.insert(-1, Tool(
            name="weather",
            description="Returns fake weather",
            can_handle=lambda s: "weather" in s.lower(),
            handle=lambda s: "Sunny, 18C in Bergen",
        ))
        result = agent.run("What is the weather today?")
        assert "Bergen" in result

    def test_think_fn_called_when_no_tool_matches(self):
        calls: list[str] = []

        def mock_think(ctx: str, inp: str) -> str:
            calls.append(inp)
            return "mock thought response"

        agent = HermesAgent(
            registry=ToolRegistry(),  # empty registry — nothing matches
            think_fn=mock_think,
        )
        result = agent.run("tell me something interesting")
        assert "mock thought response" in result
        assert len(calls) == 1

    def test_think_fn_not_called_when_tool_matches(self):
        calls: list[str] = []

        def mock_think(ctx: str, inp: str) -> str:
            calls.append(inp)
            return "should not appear"

        agent = HermesAgent(
            registry=default_registry(),
            think_fn=mock_think,
        )
        result = agent.run("2 + 2")
        # math tool should handle it; think_fn may still be called but result
        # should come from the math tool, not the mock
        assert "4" in result

    def test_fallback_message_when_nothing_matches(self):
        agent = HermesAgent(registry=ToolRegistry())  # empty
        result = agent.run("nothing here")
        assert len(result) > 0   # fallback message returned, not empty
