"""SQLite-based state management for the multi-agent system."""
from __future__ import annotations
import json
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

import config


@dataclass
class Task:
    task_type: str
    status: str
    data: dict
    id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    retries: int = 0
    error: Optional[str] = None


class StateManager:
    def __init__(self, db_path: str = config.STATE_DB):
        self.db_path = db_path
        self._init_db()

    @contextmanager
    def _conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_db(self):
        with self._conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_type TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    data TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    retries INTEGER NOT NULL DEFAULT 0,
                    error TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS agent_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    agent TEXT NOT NULL,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cycle_summary (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cycle_number INTEGER NOT NULL,
                    started_at TEXT NOT NULL,
                    completed_at TEXT,
                    tasks_completed INTEGER DEFAULT 0,
                    tasks_failed INTEGER DEFAULT 0,
                    features_added TEXT DEFAULT '[]'
                )
            """)

    def create_task(self, task_type: str, data: dict) -> int:
        now = datetime.utcnow().isoformat()
        with self._conn() as conn:
            cursor = conn.execute(
                "INSERT INTO tasks (task_type, status, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (task_type, "pending", json.dumps(data), now, now),
            )
            return cursor.lastrowid

    def get_pending_tasks(self, task_type: Optional[str] = None) -> List[Task]:
        with self._conn() as conn:
            if task_type:
                rows = conn.execute(
                    "SELECT * FROM tasks WHERE status = 'pending' AND task_type = ? ORDER BY created_at",
                    (task_type,),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at"
                ).fetchall()
            return [self._row_to_task(r) for r in rows]

    def update_task(
        self,
        task_id: int,
        status: str,
        data: Optional[dict] = None,
        error: Optional[str] = None,
    ):
        now = datetime.utcnow().isoformat()
        with self._conn() as conn:
            if data is not None:
                conn.execute(
                    "UPDATE tasks SET status=?, data=?, updated_at=?, error=? WHERE id=?",
                    (status, json.dumps(data), now, error, task_id),
                )
            else:
                conn.execute(
                    "UPDATE tasks SET status=?, updated_at=?, error=? WHERE id=?",
                    (status, now, error, task_id),
                )

    def increment_retries(self, task_id: int):
        with self._conn() as conn:
            conn.execute(
                "UPDATE tasks SET retries=retries+1, updated_at=? WHERE id=?",
                (datetime.utcnow().isoformat(), task_id),
            )

    def get_task(self, task_id: int) -> Optional[Task]:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
            return self._row_to_task(row) if row else None

    def log_agent_event(self, agent: str, level: str, message: str):
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO agent_log (timestamp, agent, level, message) VALUES (?,?,?,?)",
                (datetime.utcnow().isoformat(), agent, level, message),
            )

    def get_recent_logs(self, limit: int = 50) -> list:
        with self._conn() as conn:
            return conn.execute(
                "SELECT * FROM agent_log ORDER BY timestamp DESC LIMIT ?", (limit,)
            ).fetchall()

    def get_stats(self) -> dict:
        with self._conn() as conn:
            def count(where=""):
                q = "SELECT COUNT(*) FROM tasks" + (f" WHERE {where}" if where else "")
                return conn.execute(q).fetchone()[0]

            return {
                "total": count(),
                "done": count("status='done'"),
                "failed": count("status='failed'"),
                "pending": count("status='pending'"),
                "running": count("status='running'"),
            }

    def create_cycle(self, cycle_number: int) -> int:
        now = datetime.utcnow().isoformat()
        with self._conn() as conn:
            cursor = conn.execute(
                "INSERT INTO cycle_summary (cycle_number, started_at) VALUES (?,?)",
                (cycle_number, now),
            )
            return cursor.lastrowid

    def complete_cycle(
        self,
        cycle_id: int,
        tasks_completed: int,
        tasks_failed: int,
        features_added: list,
    ):
        now = datetime.utcnow().isoformat()
        with self._conn() as conn:
            conn.execute(
                "UPDATE cycle_summary SET completed_at=?, tasks_completed=?, tasks_failed=?, features_added=? WHERE id=?",
                (now, tasks_completed, tasks_failed, json.dumps(features_added), cycle_id),
            )

    def get_cycles(self, limit: int = 10) -> list:
        with self._conn() as conn:
            return conn.execute(
                "SELECT * FROM cycle_summary ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()

    def _row_to_task(self, row) -> Task:
        return Task(
            id=row["id"],
            task_type=row["task_type"],
            status=row["status"],
            data=json.loads(row["data"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            retries=row["retries"],
            error=row["error"],
        )
