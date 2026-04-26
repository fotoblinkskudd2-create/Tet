"""
OpenClaw Hermes — memory management with a bounded sliding window.

Total prompt overhead is capped at roughly 700 tokens regardless of
conversation length, satisfying the low-token-budget constraint.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Turn:
    role: str    # "user" | "agent"
    content: str


@dataclass
class MemorySnapshot:
    summary: str
    window: list[Turn]
    kv: dict[str, str]


class MemoryStore:
    """Sliding-window memory with a deterministic rolling summary and a KV fact store.

    Memory budget (defaults):
      summary  ≤ 300 chars
      window   ≤ 6 turns × 400 chars  = 2 400 chars
      kv       typically < 200 chars
      total    ≈ 2 900 chars / ~725 tokens
    """

    def __init__(
        self,
        window_size: int = 6,
        max_chars_per_turn: int = 400,
        summary_max_chars: int = 300,
    ) -> None:
        self._window_size = window_size
        self._max_chars = max_chars_per_turn
        self._summary_max = summary_max_chars
        self._window: list[Turn] = []
        self._summary: str = ""
        self._kv: dict[str, str] = {}

    # ------------------------------------------------------------------
    # Public write API
    # ------------------------------------------------------------------

    def add(self, role: str, content: str) -> None:
        """Append a turn, evicting the oldest one into the summary if needed."""
        trimmed = content[: self._max_chars]
        self._window.append(Turn(role=role, content=trimmed))
        while len(self._window) > self._window_size:
            self._compress_oldest()

    def set_fact(self, key: str, value: str) -> None:
        self._kv[key] = value

    # ------------------------------------------------------------------
    # Public read API
    # ------------------------------------------------------------------

    def get_fact(self, key: str) -> Optional[str]:
        return self._kv.get(key)

    def snapshot(self) -> MemorySnapshot:
        return MemorySnapshot(
            summary=self._summary,
            window=list(self._window),
            kv=dict(self._kv),
        )

    def context_block(self) -> str:
        """Return a compact string ready for injection into a system prompt."""
        parts: list[str] = []

        if self._summary:
            parts.append(f"[SUMMARY] {self._summary}")

        if self._kv:
            kv_line = " | ".join(f"{k}={v}" for k, v in self._kv.items())
            parts.append(f"[FACTS] {kv_line}")

        if self._window:
            lines = ["[RECENT]"]
            for turn in self._window:
                lines.append(f"{turn.role}: {turn.content}")
            parts.append("\n".join(lines))

        return "\n".join(parts)

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _compress_oldest(self) -> None:
        oldest = self._window.pop(0)
        excerpt = oldest.content[:150]
        addition = f"Earlier ({oldest.role}): {excerpt}"
        combined = f"{self._summary} {addition}".strip() if self._summary else addition
        self._summary = combined[: self._summary_max]
