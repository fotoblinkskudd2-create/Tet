from __future__ import annotations

import random
import threading
import time

from core.logger import setup_logger
from core.queue import TaskQueue

_MATH_EXPRS = [
    "2 ** 10",
    "355 / 113",
    "12 * 13 + 7",
    "100 - 37 * 2",
    "2 ** 8 - 1",
    "1024 / 32",
    "17 ** 2",
    "999 % 7",
    "(3 + 5) * (9 - 4)",
    "7 ** 3 - 100",
    "256 / 16 + 13",
    "49 ** 0.5",
]

_CREATIVE_SEEDS = [
    ("misty mountain valley at dawn", "photo"),
    ("minimalist city skyline at midnight", "art"),
    ("upbeat indie pop for a morning commute", "music"),
    ("timelapse of flowers blooming in rain", "video"),
    ("the silence between words in winter", "poem"),
    ("coastal cliffs in golden hour light", "photo"),
    ("geometric pattern inspired by waves", "art"),
    ("lo-fi hip-hop for late-night study sessions", "music"),
    ("a drone reveal of an ancient forest", "video"),
    ("haiku about the last train leaving the station", "poem"),
]

_BRAINSTORM_PROBLEMS = [
    "How to maintain focus during long work sessions",
    "Building effective daily habits with minimal willpower",
    "Reducing decision fatigue in a busy schedule",
    "Learning a complex new skill in under 30 days",
    "Organising a multi-stakeholder project with unclear scope",
    "Improving team communication across time zones",
    "Balancing depth and speed in creative work",
    "Breaking through a creative block productively",
]


class TaskGeneratorAgent:
    """Continuously generates synthetic tasks to keep the system active."""

    def __init__(self, task_queue: TaskQueue, config: dict) -> None:
        self.task_queue = task_queue
        self.config = config
        self.logger = setup_logger("task_generator", config["log_dir"])
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self.generated_count = 0
        self.status = "stopped"
        self.last_heartbeat: float = time.time()

    def _pick_and_enqueue(self) -> None:
        kind = random.choices(
            ["math", "creative", "brainstorm"], weights=[3, 4, 3]
        )[0]

        if kind == "math":
            expr = random.choice(_MATH_EXPRS)
            self.task_queue.enqueue("math", {"expression": expr}, priority=3)
            self.logger.info(f"Generated math task: {expr}")

        elif kind == "creative":
            seed, medium = random.choice(_CREATIVE_SEEDS)
            self.task_queue.enqueue("creative", {"seed": seed, "medium": medium}, priority=3)
            self.logger.info(f"Generated creative task [{medium}]: {seed}")

        else:
            problem = random.choice(_BRAINSTORM_PROBLEMS)
            self.task_queue.enqueue("brainstorm", {"problem": problem}, priority=2)
            self.logger.info(f"Generated brainstorm task: {problem}")

        self.generated_count += 1

    def run(self) -> None:
        self.status = "running"
        interval = self.config.get("task_generation_interval", 90)
        self.logger.info(f"Task generator started (interval={interval}s)")

        # Seed the queue with an initial batch
        for _ in range(5):
            self._pick_and_enqueue()

        while not self._stop_event.is_set():
            self.last_heartbeat = time.time()
            self._stop_event.wait(interval)
            if not self._stop_event.is_set():
                self._pick_and_enqueue()

        self.status = "stopped"
        self.logger.info("Task generator stopped")

    def start(self) -> None:
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self.run, daemon=True, name="task_generator"
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
