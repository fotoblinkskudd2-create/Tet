"""
OpenClaw Hermes — tool registry.

A Tool mirrors the existing Solver pattern in app.py:
  can_handle(input) -> bool
  handle(input)     -> str

Registration order determines priority; the first matching tool wins.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional


@dataclass
class Tool:
    name: str
    description: str
    can_handle: Callable[[str], bool]
    handle: Callable[[str], str]


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: list[Tool] = []

    def register(self, tool: Tool) -> None:
        self._tools.append(tool)

    def insert(self, index: int, tool: Tool) -> None:
        """Insert a tool at a specific position. Use -1 to insert before the last tool."""
        self._tools.insert(index, tool)

    def find(self, user_input: str) -> Optional[Tool]:
        """Return the first registered tool whose can_handle() returns True."""
        for tool in self._tools:
            if tool.can_handle(user_input):
                return tool
        return None

    def all_descriptions(self) -> list[str]:
        return [f"{t.name}: {t.description}" for t in self._tools]

    def __len__(self) -> int:
        return len(self._tools)
