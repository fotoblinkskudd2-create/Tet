from __future__ import annotations

import threading
import time
from abc import ABC, abstractmethod
from typing import Optional

from core.logger import setup_logger
from core.queue import Task, TaskQueue


class BaseAgent(ABC):
    """Abstract base for all worker agents."""

    def __init__(self, agent_id: str, task_queue: TaskQueue, config: dict) -> None:
        self.agent_id = agent_id
        self.task_queue = task_queue
        self.config = config
        self.logger = setup_logger(agent_id, config["log_dir"])
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self.tasks_processed = 0
        self.tasks_failed = 0
        self.last_heartbeat: float = time.time()
        self.status = "stopped"

    # ------------------------------------------------------------------
    # Subclass contract
    # ------------------------------------------------------------------

    @property
    def task_type(self) -> Optional[str]:
        """Return the task type this agent handles, or None to accept any."""
        return None

    @abstractmethod
    def process_task(self, task: Task) -> dict:
        """Process one task and return a result dict."""

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def run(self) -> None:
        self.status = "running"
        self.logger.info("Agent started")
        poll = self.config.get("worker_poll_interval", 2)
        max_retries = self.config.get("max_task_retries", 3)

        while not self._stop_event.is_set():
            self.last_heartbeat = time.time()
            try:
                task = self.task_queue.dequeue(
                    task_type=self.task_type,
                    worker_id=self.agent_id,
                )
                if task is not None:
                    self.logger.info(f"Processing task {task.id} [{task.task_type}]")
                    try:
                        result = self.process_task(task)
                        self.task_queue.complete(task.id, result)  # type: ignore[arg-type]
                        self.tasks_processed += 1
                        self.logger.info(f"Task {task.id} completed | total={self.tasks_processed}")
                    except Exception as exc:
                        self.tasks_failed += 1
                        self.logger.error(f"Task {task.id} error: {exc}")
                        self.task_queue.fail(task.id, str(exc), max_retries)  # type: ignore[arg-type]
                else:
                    self._stop_event.wait(poll)
            except Exception as exc:
                self.logger.error(f"Unexpected loop error: {exc}")
                self._stop_event.wait(poll)

        self.status = "stopped"
        self.logger.info("Agent stopped")

    def start(self) -> None:
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self.run, daemon=True, name=self.agent_id
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
