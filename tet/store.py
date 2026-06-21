"""SQLite-backed storage for Tet items.

The store is intentionally dependency-free (stdlib ``sqlite3`` only) so the
whole system runs anywhere Python runs, including iOS web shells and cheap
servers. All items share one flexible table; category-specific data lives in a
JSON ``metadata`` column.
"""
from __future__ import annotations

import json
import os
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

from .categories import resolve_category


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def default_db_path() -> Path:
    """Resolve the database location.

    Honours the ``TET_DB`` environment variable, otherwise stores data under
    ``~/.tet/tet.db`` so it survives between runs.
    """

    env = os.environ.get("TET_DB")
    if env:
        return Path(env).expanduser()
    return Path.home() / ".tet" / "tet.db"


def _normalize_tags(tags: Optional[Iterable[str]]) -> str:
    if not tags:
        return ""
    cleaned = []
    for tag in tags:
        for piece in str(tag).replace(";", ",").split(","):
            piece = piece.strip().lower()
            if piece and piece not in cleaned:
                cleaned.append(piece)
    return ",".join(cleaned)


@dataclass
class Item:
    """A single captured idea/task/note in any category."""

    category: str
    title: str
    body: str = ""
    tags: List[str] = field(default_factory=list)
    status: str = "open"
    priority: int = 3
    score: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Item":
        return cls(
            id=row["id"],
            category=row["category"],
            title=row["title"],
            body=row["body"] or "",
            tags=[t for t in (row["tags"] or "").split(",") if t],
            status=row["status"],
            priority=row["priority"],
            score=row["score"],
            metadata=json.loads(row["metadata"] or "{}"),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "category": self.category,
            "title": self.title,
            "body": self.body,
            "tags": self.tags,
            "status": self.status,
            "priority": self.priority,
            "score": self.score,
            "metadata": self.metadata,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class Store:
    """Thin, well-tested wrapper around the SQLite item table."""

    def __init__(self, path: Optional[Path | str] = None) -> None:
        self.path = Path(path) if path else default_db_path()
        if self.path.parent and str(self.path) != ":memory:":
            self.path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.path))
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    # -- lifecycle -------------------------------------------------------
    def _init_schema(self) -> None:
        self.conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT DEFAULT '',
                tags TEXT DEFAULT '',
                status TEXT DEFAULT 'open',
                priority INTEGER DEFAULT 3,
                score REAL,
                metadata TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
            CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
            """
        )
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

    def __enter__(self) -> "Store":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    # -- writes ----------------------------------------------------------
    def add(self, item: Item) -> Item:
        item.category = resolve_category(item.category)
        if not item.title or not item.title.strip():
            raise ValueError("An item needs a title.")
        item.priority = max(1, min(5, int(item.priority)))
        now = _now()
        item.created_at = now
        item.updated_at = now
        cur = self.conn.execute(
            """
            INSERT INTO items
                (category, title, body, tags, status, priority, score, metadata,
                 created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item.category,
                item.title.strip(),
                item.body,
                _normalize_tags(item.tags),
                item.status,
                item.priority,
                item.score,
                json.dumps(item.metadata, ensure_ascii=False),
                item.created_at,
                item.updated_at,
            ),
        )
        self.conn.commit()
        item.id = cur.lastrowid
        item.tags = [t for t in _normalize_tags(item.tags).split(",") if t]
        return item

    def update(self, item_id: int, **changes: Any) -> Item:
        existing = self.get(item_id)
        if existing is None:
            raise KeyError(f"No item with id {item_id}")

        allowed = {
            "category",
            "title",
            "body",
            "tags",
            "status",
            "priority",
            "score",
            "metadata",
        }
        for field_name, value in changes.items():
            if field_name not in allowed:
                raise ValueError(f"Cannot update field '{field_name}'")
            if field_name == "category":
                value = resolve_category(value)
            if field_name == "priority":
                value = max(1, min(5, int(value)))
            if field_name == "tags":
                value = [t for t in _normalize_tags(value).split(",") if t]
            if field_name == "metadata" and isinstance(value, dict):
                merged = dict(existing.metadata)
                merged.update(value)
                value = merged
            setattr(existing, field_name, value)

        existing.updated_at = _now()
        self.conn.execute(
            """
            UPDATE items SET category=?, title=?, body=?, tags=?, status=?,
                priority=?, score=?, metadata=?, updated_at=?
            WHERE id=?
            """,
            (
                existing.category,
                existing.title,
                existing.body,
                _normalize_tags(existing.tags),
                existing.status,
                existing.priority,
                existing.score,
                json.dumps(existing.metadata, ensure_ascii=False),
                existing.updated_at,
                item_id,
            ),
        )
        self.conn.commit()
        return existing

    def delete(self, item_id: int) -> bool:
        cur = self.conn.execute("DELETE FROM items WHERE id=?", (item_id,))
        self.conn.commit()
        return cur.rowcount > 0

    # -- reads -----------------------------------------------------------
    def get(self, item_id: int) -> Optional[Item]:
        row = self.conn.execute(
            "SELECT * FROM items WHERE id=?", (item_id,)
        ).fetchone()
        return Item.from_row(row) if row else None

    def list(
        self,
        category: Optional[str] = None,
        status: Optional[str] = None,
        tag: Optional[str] = None,
        order_by: str = "priority",
    ) -> List[Item]:
        clauses: List[str] = []
        params: List[Any] = []
        if category:
            clauses.append("category=?")
            params.append(resolve_category(category))
        if status:
            clauses.append("status=?")
            params.append(status)
        if tag:
            clauses.append("(',' || tags || ',') LIKE ?")
            params.append(f"%,{tag.strip().lower()},%")

        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        order = {
            "priority": "priority DESC, updated_at DESC",
            "recent": "updated_at DESC",
            "created": "created_at DESC",
            "score": "score DESC NULLS LAST, priority DESC",
        }.get(order_by, "priority DESC, updated_at DESC")
        rows = self.conn.execute(
            f"SELECT * FROM items {where} ORDER BY {order}", params
        ).fetchall()
        return [Item.from_row(r) for r in rows]

    def search(self, query: str) -> List[Item]:
        like = f"%{query.strip().lower()}%"
        rows = self.conn.execute(
            """
            SELECT * FROM items
            WHERE lower(title) LIKE ? OR lower(body) LIKE ? OR lower(tags) LIKE ?
            ORDER BY priority DESC, updated_at DESC
            """,
            (like, like, like),
        ).fetchall()
        return [Item.from_row(r) for r in rows]

    def all_tags(self) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for row in self.conn.execute("SELECT tags FROM items"):
            for tag in (row["tags"] or "").split(","):
                if tag:
                    counts[tag] = counts.get(tag, 0) + 1
        return dict(sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])))

    def stats(self) -> Dict[str, Any]:
        total = self.conn.execute("SELECT COUNT(*) AS n FROM items").fetchone()["n"]
        by_category: Dict[str, int] = {}
        for row in self.conn.execute(
            "SELECT category, COUNT(*) AS n FROM items GROUP BY category"
        ):
            by_category[row["category"]] = row["n"]
        by_status: Dict[str, int] = {}
        for row in self.conn.execute(
            "SELECT status, COUNT(*) AS n FROM items GROUP BY status"
        ):
            by_status[row["status"]] = row["n"]
        return {
            "total": total,
            "by_category": by_category,
            "by_status": by_status,
            "tags": self.all_tags(),
        }
