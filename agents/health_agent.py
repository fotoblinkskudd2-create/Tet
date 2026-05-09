from __future__ import annotations

import threading
import time
from typing import Any, Dict

from core.logger import setup_logger
from core.queue import TaskQueue


class HealthAgent:
    """Monitors all registered agents, resets stale tasks, and auto-restarts dead agents."""

    def __init__(self, task_queue: TaskQueue, config: dict) -> None:
        self.task_queue = task_queue
        self.config = config
        self.logger = setup_logger("health_agent", config["log_dir"])
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._registry: Dict[str, Any] = {}
        self.status = "stopped"
        self.last_heartbeat: float = time.time()
        self.checks_performed = 0
        self.restarts_performed = 0

    def register(self, name: str, agent: Any) -> None:
        self._registry[name] = agent

    def _check_and_recover(self) -> None:
        stale_cutoff = self.config.get("health_check_interval", 30) * 4
        restart_delay = self.config.get("agent_restart_delay", 5)

        for name, agent in self._registry.items():
            alive = agent.is_alive()
            hb_age = agent.heartbeat_age() if hasattr(agent, "heartbeat_age") else 0

            if not alive:
                self.logger.warning(f"[{name}] thread dead — restarting")
                self._restart(name, agent, restart_delay)

            elif hb_age > stale_cutoff:
                self.logger.warning(
                    f"[{name}] heartbeat stale ({hb_age:.0f}s > {stale_cutoff}s) — restarting"
                )
                agent.stop()
                time.sleep(restart_delay)
                self._restart(name, agent, 0)

    def _restart(self, name: str, agent: Any, delay: float) -> None:
        if delay:
            time.sleep(delay)
        try:
            agent.start()
            self.restarts_performed += 1
            self.logger.info(f"[{name}] restarted successfully")
        except Exception as exc:
            self.logger.error(f"[{name}] restart failed: {exc}")

    def run(self) -> None:
        self.status = "running"
        interval = self.config.get("health_check_interval", 30)
        stale_timeout = self.config.get("stale_task_timeout", 300)
        self.logger.info(f"Health agent started (interval={interval}s)")

        while not self._stop_event.is_set():
            self.last_heartbeat = time.time()
            try:
                reset_count = self.task_queue.reset_stale_tasks(stale_timeout)
                if reset_count:
                    self.logger.info(f"Reset {reset_count} stale in-progress task(s)")
                self._check_and_recover()
                self.checks_performed += 1

                stats = self.task_queue.get_stats()
                self.logger.info(
                    f"Check #{self.checks_performed} | "
                    f"Q: {stats['pending']}p {stats['in_progress']}r "
                    f"{stats['completed']}done {stats['failed']}fail | "
                    f"restarts={self.restarts_performed}"
                )
            except Exception as exc:
                self.logger.error(f"Health check error: {exc}")

            self._stop_event.wait(interval)

        self.status = "stopped"
        self.logger.info("Health agent stopped")

    def start(self) -> None:
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self.run, daemon=True, name="health_agent"
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
