"""Memory-first storage for the KUTT24 Value Engine.

The engine is *memory-first*: nothing is built until relevant memory has been
bound to the input. Memory is a durable, append-mostly JSON store. The binder
both persists new records and retrieves the slice of memory relevant to an
incoming input.

Retrieval here is deliberately simple and dependency-free (token overlap +
recency + weight). It is good enough to be useful and cheap enough to run in a
tight loop. It can be swapped for an embedding store later without changing the
contract surface.
"""

from __future__ import annotations

import json
import os
import re
from typing import Iterable, List

from .contracts import Input, MemoryContext, MemoryRecord

_WORD = re.compile(r"[a-zæøå0-9]+", re.IGNORECASE)


def _tokens(text: str) -> set:
    return {t.lower() for t in _WORD.findall(text)}


class MemoryBinder:
    """Loads, persists, and retrieves memory records."""

    def __init__(self, path: str = ".verdikvern/memory.json") -> None:
        self.path = path
        self._records: List[MemoryRecord] = []
        self._load()

    # -- persistence -----------------------------------------------------
    def _load(self) -> None:
        if os.path.exists(self.path):
            with open(self.path, "r", encoding="utf-8") as fh:
                raw = json.load(fh)
            self._records = [MemoryRecord.from_dict(r) for r in raw]
        else:
            self._records = []

    def _flush(self) -> None:
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as fh:
            json.dump([r.to_dict() for r in self._records], fh, indent=2)

    # -- mutation --------------------------------------------------------
    def remember(self, record: MemoryRecord) -> MemoryRecord:
        self._records.append(record)
        self._flush()
        return record

    def remember_many(self, records: Iterable[MemoryRecord]) -> None:
        added = False
        for record in records:
            self._records.append(record)
            added = True
        if added:
            self._flush()

    # -- retrieval -------------------------------------------------------
    def bind(self, input: Input, k: int = 5) -> MemoryContext:
        """Return the top-k memory records relevant to ``input``."""

        query = _tokens(input.text)
        if input.task_id:
            query.add(input.task_id.lower())

        scored = []
        n = len(self._records)
        for idx, record in enumerate(self._records):
            overlap = len(query & _tokens(record.text + " " + " ".join(record.tags)))
            if overlap == 0 and not record.tags:
                continue
            recency = (idx + 1) / n if n else 0.0
            score = overlap * 2.0 + recency + record.weight * 0.5
            if score > 0:
                scored.append((score, record))

        scored.sort(key=lambda pair: pair[0], reverse=True)
        top = [record for _, record in scored[:k]]
        summary = self._summarize(top)
        return MemoryContext(records=top, summary=summary)

    @staticmethod
    def _summarize(records: List[MemoryRecord]) -> str:
        if not records:
            return "No prior memory bound."
        lines = [f"- ({r.kind}) {r.text}" for r in records]
        return "Bound memory:\n" + "\n".join(lines)

    def __len__(self) -> int:
        return len(self._records)
