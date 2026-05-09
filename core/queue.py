from __future__ import annotations

import json
import sqlite3
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    id: Optional[int]
    task_type: str
    payload: dict
    status: TaskStatus = TaskStatus.PENDING
    priority: int = 5
    retries: int = 0
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None
    worker_id: Optional[str] = None


_SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    task_type    TEXT    NOT NULL,
    payload      TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'pending',
    priority     INTEGER NOT NULL DEFAULT 5,
    retries      INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL,
    started_at   TEXT,
    completed_at TEXT,
    result       TEXT,
    error        TEXT,
    worker_id    TEXT
);
CREATE INDEX IF NOT EXISTS idx_status   ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_type     ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_prio_ts  ON tasks(priority DESC, created_at ASC);
"""


class TaskQueue:
    def __init__(self, db_path: str):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._init_db()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._conn() as c:
            c.executescript(_SCHEMA)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def enqueue(self, task_type: str, payload: dict, priority: int = 5) -> int:
        with self._lock:
            with self._conn() as c:
                cur = c.execute(
                    "INSERT INTO tasks (task_type, payload, status, priority, created_at)"
                    " VALUES (?, ?, 'pending', ?, ?)",
                    (task_type, json.dumps(payload), priority, datetime.utcnow().isoformat()),
                )
                return cur.lastrowid  # type: ignore[return-value]

    def dequeue(self, task_type: Optional[str] = None, worker_id: str = "") -> Optional[Task]:
        with self._lock:
            with self._conn() as c:
                if task_type:
                    row = c.execute(
                        "SELECT * FROM tasks WHERE status = 'pending' AND task_type = ?"
                        " ORDER BY priority DESC, created_at ASC LIMIT 1",
                        (task_type,),
                    ).fetchone()
                else:
                    row = c.execute(
                        "SELECT * FROM tasks WHERE status = 'pending'"
                        " ORDER BY priority DESC, created_at ASC LIMIT 1"
                    ).fetchone()

                if not row:
                    return None

                now = datetime.utcnow().isoformat()
                c.execute(
                    "UPDATE tasks SET status = 'in_progress', started_at = ?, worker_id = ?"
                    " WHERE id = ?",
                    (now, worker_id, row["id"]),
                )
                return Task(
                    id=row["id"],
                    task_type=row["task_type"],
                    payload=json.loads(row["payload"]),
                    status=TaskStatus.IN_PROGRESS,
                    priority=row["priority"],
                    retries=row["retries"],
                    created_at=row["created_at"],
                    started_at=now,
                    worker_id=worker_id,
                )

    def complete(self, task_id: int, result: dict) -> None:
        with self._lock:
            with self._conn() as c:
                c.execute(
                    "UPDATE tasks SET status = 'completed', completed_at = ?, result = ?"
                    " WHERE id = ?",
                    (datetime.utcnow().isoformat(), json.dumps(result), task_id),
                )

    def fail(self, task_id: int, error: str, max_retries: int = 3) -> None:
        with self._lock:
            with self._conn() as c:
                row = c.execute("SELECT retries FROM tasks WHERE id = ?", (task_id,)).fetchone()
                retries = (row["retries"] + 1) if row else 1
                if retries >= max_retries:
                    c.execute(
                        "UPDATE tasks SET status = 'failed', completed_at = ?, error = ?, retries = ?"
                        " WHERE id = ?",
                        (datetime.utcnow().isoformat(), error, retries, task_id),
                    )
                else:
                    c.execute(
                        "UPDATE tasks SET status = 'pending', error = ?, retries = ?"
                        " WHERE id = ?",
                        (error, retries, task_id),
                    )

    def reset_stale_tasks(self, timeout_seconds: int = 300) -> int:
        cutoff = datetime.utcfromtimestamp(time.time() - timeout_seconds).isoformat()
        with self._lock:
            with self._conn() as c:
                cur = c.execute(
                    "UPDATE tasks SET status = 'pending', worker_id = NULL"
                    " WHERE status = 'in_progress' AND started_at < ?",
                    (cutoff,),
                )
                return cur.rowcount

    def get_stats(self) -> dict:
        with self._conn() as c:
            counts = {
                s: c.execute(
                    "SELECT COUNT(*) FROM tasks WHERE status = ?", (s,)
                ).fetchone()[0]
                for s in ("pending", "in_progress", "completed", "failed")
            }
            by_type_rows = c.execute(
                "SELECT task_type, status, COUNT(*) as cnt FROM tasks GROUP BY task_type, status"
            ).fetchall()
            by_type: dict = {}
            for row in by_type_rows:
                by_type.setdefault(row["task_type"], {})[row["status"]] = row["cnt"]

            recent = [dict(r) for r in c.execute(
                "SELECT id, task_type, status, created_at, completed_at, error"
                " FROM tasks ORDER BY id DESC LIMIT 15"
            ).fetchall()]

        return {**counts, "by_type": by_type, "recent": recent}
