#!/usr/bin/env python3
"""
Multi-Agent Autonomous System — main entry point.

Usage:
    python run_system.py              # start with defaults from config.json
    python run_system.py --port 9090  # override dashboard port

Drop a JSON file into tasks/inbox/ to inject tasks at runtime:
    {"type": "math", "payload": {"expression": "2**32"}, "priority": 9}
    {"type": "creative", "payload": {"seed": "foggy harbour at dawn", "medium": "photo"}}
    {"type": "brainstorm", "payload": {"problem": "How to ship faster"}}
    {"type": "panic", "payload": {"context": "feeling overwhelmed at work"}}
"""
from __future__ import annotations

import argparse
import json
import signal
import sys
import time
from pathlib import Path
from typing import List

from core.config import load_config
from core.logger import setup_logger
from core.queue import TaskQueue
from agents.math_agent import MathAgent
from agents.creative_agent import CreativeAgent
from agents.brainstorm_agent import BrainstormAgent
from agents.panic_agent import PanicAgent
from agents.task_generator import TaskGeneratorAgent
from agents.health_agent import HealthAgent
from agents.report_agent import ReportAgent
from dashboard.server import DashboardServer


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Multi-Agent Autonomous System")
    p.add_argument("--port", type=int, help="Dashboard port (overrides config.json)")
    p.add_argument("--no-generator", action="store_true", help="Disable auto task generation")
    p.add_argument("--workers", type=int, help="Workers per agent type (overrides config.json)")
    return p.parse_args()


def _build_workers(config: dict, queue: TaskQueue) -> List:
    n = config.get("num_workers_per_type", 2)
    workers = []
    for i in range(1, n + 1):
        workers.append(MathAgent(f"math_worker_{i}", queue, config))
        workers.append(CreativeAgent(f"creative_worker_{i}", queue, config))
        workers.append(BrainstormAgent(f"brainstorm_worker_{i}", queue, config))
    workers.append(PanicAgent("panic_worker_1", queue, config))
    return workers


def _watch_inbox(inbox: Path, queue: TaskQueue, logger) -> None:
    """Ingest task files dropped into the inbox directory."""
    for task_file in sorted(inbox.glob("*.json")):
        try:
            data = json.loads(task_file.read_text(encoding="utf-8"))
            task_type = data.get("type", "brainstorm")
            payload = data.get("payload", {})
            priority = int(data.get("priority", 8))
            tid = queue.enqueue(task_type, payload, priority)
            logger.info(f"Ingested {task_file.name} → task #{tid} [{task_type}]")
            task_file.unlink()
        except Exception as exc:
            logger.error(f"Failed to ingest {task_file.name}: {exc}")


def main() -> None:
    args = _parse_args()
    config = load_config()

    if args.port:
        config["dashboard_port"] = args.port
    if args.workers:
        config["num_workers_per_type"] = args.workers

    logger = setup_logger("orchestrator", config["log_dir"], config.get("log_level", "INFO"))
    logger.info("=" * 60)
    logger.info("  Multi-Agent Autonomous System  —  starting")
    logger.info("=" * 60)

    # ------------------------------------------------------------------ #
    # Infrastructure
    # ------------------------------------------------------------------ #
    queue = TaskQueue(config["db_path"])
    workers = _build_workers(config, queue)
    health = HealthAgent(queue, config)
    reporter = ReportAgent(queue, config)

    task_gen: TaskGeneratorAgent | None = None
    if not args.no_generator:
        task_gen = TaskGeneratorAgent(queue, config)

    # ------------------------------------------------------------------ #
    # Dashboard
    # ------------------------------------------------------------------ #
    start_time = time.time()

    def get_state() -> dict:
        agent_info: dict = {}
        for w in workers:
            agent_info[w.agent_id] = {
                "alive": w.is_alive(),
                "heartbeat_age": w.heartbeat_age(),
                "tasks_processed": w.tasks_processed,
                "tasks_failed": w.tasks_failed,
                "status": w.status,
            }
        for name, ag in [
            ("task_generator", task_gen),
            ("health_agent", health),
            ("report_agent", reporter),
        ]:
            if ag is None:
                continue
            agent_info[name] = {
                "alive": ag.is_alive(),
                "heartbeat_age": ag.heartbeat_age(),
                "status": ag.status,
            }
        return {
            "uptime": time.time() - start_time,
            "queue_stats": queue.get_stats(),
            "agents": agent_info,
        }

    dashboard = DashboardServer(config["dashboard_port"], get_state, config)

    # ------------------------------------------------------------------ #
    # Register everything with the health agent
    # ------------------------------------------------------------------ #
    for w in workers:
        health.register(w.agent_id, w)
    if task_gen:
        health.register("task_generator", task_gen)
    health.register("report_agent", reporter)

    # ------------------------------------------------------------------ #
    # Start all components
    # ------------------------------------------------------------------ #
    for w in workers:
        w.start()
    if task_gen:
        task_gen.start()
    reporter.start()
    health.start()
    dashboard.start()

    port = config["dashboard_port"]
    logger.info(f"All agents running | Dashboard → http://localhost:{port}/")
    logger.info(f"Inbox → {config['task_inbox']}")
    logger.info("Press Ctrl+C or send SIGTERM to shut down gracefully.")

    # ------------------------------------------------------------------ #
    # Graceful shutdown
    # ------------------------------------------------------------------ #
    def _shutdown(sig: int, _frame: object) -> None:
        logger.info(f"Signal {sig} received — shutting down...")
        health.stop()
        for w in workers:
            w.stop()
        if task_gen:
            task_gen.stop()
        reporter.stop()
        dashboard.stop()
        logger.info("All agents stopped. Goodbye.")
        sys.exit(0)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    # ------------------------------------------------------------------ #
    # Main loop — watch inbox for manually injected tasks
    # ------------------------------------------------------------------ #
    inbox = Path(config["task_inbox"])
    inbox.mkdir(parents=True, exist_ok=True)

    while True:
        try:
            _watch_inbox(inbox, queue, logger)
        except Exception as exc:
            logger.error(f"Inbox watch error: {exc}")
        time.sleep(5)


if __name__ == "__main__":
    main()
