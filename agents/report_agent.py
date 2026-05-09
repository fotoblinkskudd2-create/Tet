from __future__ import annotations

import json
import threading
import time
from datetime import datetime
from pathlib import Path

from core.logger import setup_logger
from core.queue import TaskQueue


class ReportAgent:
    """Generates periodic JSON reports summarising system activity."""

    def __init__(self, task_queue: TaskQueue, config: dict) -> None:
        self.task_queue = task_queue
        self.config = config
        self.logger = setup_logger("report_agent", config["log_dir"])
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self.status = "stopped"
        self.last_heartbeat: float = time.time()
        self.reports_generated = 0

    def _write_report(self) -> None:
        stats = self.task_queue.get_stats()
        report = {
            "generated_at_utc": datetime.utcnow().isoformat(),
            "stats": stats,
        }
        reports_dir = Path(self.config["reports_dir"])
        reports_dir.mkdir(parents=True, exist_ok=True)
        fname = reports_dir / f"report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        fname.write_text(json.dumps(report, indent=2), encoding="utf-8")
        self.reports_generated += 1
        self.logger.info(
            f"Report #{self.reports_generated} → {fname.name} | "
            f"completed={stats['completed']} failed={stats['failed']}"
        )

    def run(self) -> None:
        self.status = "running"
        interval = self.config.get("report_interval", 3600)
        self.logger.info(f"Report agent started (interval={interval}s)")

        while not self._stop_event.is_set():
            self.last_heartbeat = time.time()
            self._stop_event.wait(interval)
            if not self._stop_event.is_set():
                try:
                    self._write_report()
                except Exception as exc:
                    self.logger.error(f"Report generation failed: {exc}")

        self.status = "stopped"
        self.logger.info("Report agent stopped")

    def start(self) -> None:
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self.run, daemon=True, name="report_agent"
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=10)

    def is_alive(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def heartbeat_age(self) -> float:
        return time.time() - self.last_heartbeat
