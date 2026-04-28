"""
Supervisor: spawns worker agents, monitors heartbeats every 30 min,
replaces stalled agents, and triggers checkpoints at hours 5, 8, 11.
"""
from __future__ import annotations

import logging
import os
import threading
import time

from config import (
    AGENT_TOPICS,
    CHECKPOINT_SECONDS,
    MEMORY_DIR,
    PROGRESS_FILE,
    SUPERVISOR_CHECK_INTERVAL_SEC,
    TOTAL_DURATION_SEC,
    WORKER_CYCLE_INTERVAL_SEC,
)
from config import ANTHROPIC_API_KEY
from agents.memory_store import MemoryStore
from agents.reporter import build_final_report, build_interim_report, save_report

# Use mock workers when no real API key is configured
if ANTHROPIC_API_KEY and ANTHROPIC_API_KEY not in ("mock", ""):
    from agents.worker import WorkerAgent as _WorkerClass
else:
    from agents.mock_worker import MockWorkerAgent as _WorkerClass  # type: ignore[assignment]
    logger_pre = logging.getLogger(__name__)
    logger_pre.warning("No real ANTHROPIC_API_KEY found — using MockWorkerAgent for testing.")

logger = logging.getLogger(__name__)

# Maximum seconds without a heartbeat before an agent is considered stalled
STALL_THRESHOLD_SEC: int = WORKER_CYCLE_INTERVAL_SEC * 3


class Supervisor:
    """Manages the full 11-hour research session."""

    def __init__(self) -> None:
        self.store = MemoryStore(MEMORY_DIR)
        self.start_time = time.time()
        self._global_stop = threading.Event()
        self._workers: dict[str, WorkerAgent] = {}
        self._worker_stops: dict[str, threading.Event] = {}
        self._spawn_counter: dict[str, int] = {}  # base_id -> replacement count
        self._checkpoints_done: set[float] = set()
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ #
    #  Public API
    # ------------------------------------------------------------------ #

    def run(self) -> None:
        logger.info("Supervisor starting. Total duration: %.1f h", TOTAL_DURATION_SEC / 3600)
        self.store.load_persisted()
        self._spawn_all_initial()
        self._loop()
        self._finalize()

    # ------------------------------------------------------------------ #
    #  Spawn helpers
    # ------------------------------------------------------------------ #

    def _spawn_all_initial(self) -> None:
        for agent_id, topics in AGENT_TOPICS.items():
            self._spawn_worker(agent_id, topics)

    def _spawn_worker(self, agent_id: str, topics: list[str]) -> WorkerAgent:
        stop_event = threading.Event()
        worker = _WorkerClass(
            agent_id=agent_id,
            topics=topics,
            store=self.store,
            stop_event=stop_event,
        )
        with self._lock:
            self._worker_stops[agent_id] = stop_event
            self._workers[agent_id] = worker
        worker.start()
        logger.info("Spawned worker: %s  topics=%s", agent_id, topics)
        return worker

    def _replace_stalled(self, agent_id: str) -> None:
        topics = AGENT_TOPICS.get(agent_id, [])
        self.store.mark_replaced(agent_id)

        # Kill old thread's stop event
        with self._lock:
            old_stop = self._worker_stops.pop(agent_id, None)
        if old_stop:
            old_stop.set()

        # Create replacement with a versioned ID
        count = self._spawn_counter.get(agent_id, 0) + 1
        self._spawn_counter[agent_id] = count
        new_id = f"{agent_id}_r{count}"
        logger.warning("Replacing stalled agent %s → %s", agent_id, new_id)
        self._spawn_worker(new_id, topics)

    # ------------------------------------------------------------------ #
    #  Main loop
    # ------------------------------------------------------------------ #

    def _loop(self) -> None:
        while not self._global_stop.is_set():
            elapsed = time.time() - self.start_time

            # Stop everything at 11 hours
            if elapsed >= TOTAL_DURATION_SEC:
                logger.info("Total duration reached. Stopping all workers.")
                self._global_stop.set()
                break

            # Check for missed checkpoints
            for cp_sec in CHECKPOINT_SECONDS:
                if elapsed >= cp_sec and cp_sec not in self._checkpoints_done:
                    self._do_checkpoint(cp_sec)

            # Supervisor health check
            self._check_workers()

            # Sleep until next check or termination
            time_to_end = self.start_time + TOTAL_DURATION_SEC - time.time()
            sleep_for = min(SUPERVISOR_CHECK_INTERVAL_SEC, max(time_to_end, 0))
            if sleep_for <= 0:
                break
            self._global_stop.wait(timeout=sleep_for)

    # ------------------------------------------------------------------ #
    #  Health check
    # ------------------------------------------------------------------ #

    def _check_workers(self) -> None:
        now = time.time()
        statuses = self.store.get_statuses()
        with self._lock:
            active_ids = set(self._workers.keys())

        for agent_id in list(active_ids):
            status = statuses.get(agent_id)
            if status is None:
                continue
            if status.status in ("stalled", "replaced"):
                continue
            if status.status == "done":
                continue
            stale = now - status.last_heartbeat
            if stale > STALL_THRESHOLD_SEC:
                logger.warning(
                    "Agent %s stalled (no heartbeat for %ds). Replacing.",
                    agent_id,
                    int(stale),
                )
                self.store.mark_stalled(agent_id)
                self._replace_stalled(agent_id)
            else:
                logger.info(
                    "Agent %s OK — cycles=%d  last_heartbeat=%.0fs ago",
                    agent_id,
                    status.cycles_completed,
                    stale,
                )

        # Also check for agents defined in config that never got a status entry
        for base_id in AGENT_TOPICS:
            if base_id not in statuses and base_id not in active_ids:
                logger.warning("Agent %s never started — spawning now.", base_id)
                self._spawn_worker(base_id, AGENT_TOPICS[base_id])

    # ------------------------------------------------------------------ #
    #  Checkpoints
    # ------------------------------------------------------------------ #

    def _do_checkpoint(self, cp_sec: float) -> None:
        self._checkpoints_done.add(cp_sec)
        label = f"Hour {cp_sec / 3600:.0f}"
        logger.info("=== CHECKPOINT %s ===", label)
        report = build_interim_report(self.store, self.start_time, label)
        cp_path = os.path.join(MEMORY_DIR, "checkpoints", f"checkpoint_{int(cp_sec // 3600)}h.md")
        save_report(report, cp_path)
        # Also update the rolling progress file
        save_report(report, PROGRESS_FILE)
        logger.info("Checkpoint report saved: %s", cp_path)

    # ------------------------------------------------------------------ #
    #  Finalize
    # ------------------------------------------------------------------ #

    def _finalize(self) -> None:
        logger.info("Stopping all workers...")
        with self._lock:
            stops = list(self._worker_stops.values())
        for stop in stops:
            stop.set()

        with self._lock:
            workers = list(self._workers.values())
        for w in workers:
            w.join(timeout=30)

        final = build_final_report(self.store, self.start_time)
        save_report(final, PROGRESS_FILE)
        print("\n" + "=" * 70)
        print(final)
        print("=" * 70)
        logger.info("Final report written to %s", PROGRESS_FILE)
