"""
Entry point for the 11-hour multi-agent research session.

Usage:
    ANTHROPIC_API_KEY=sk-... python run_agents.py
    ANTHROPIC_API_KEY=sk-... TOTAL_DURATION_HOURS=0.1 python run_agents.py  # quick test (6 min)
"""
from __future__ import annotations

import logging
import sys

from config import ANTHROPIC_API_KEY, TOTAL_DURATION_HOURS


def _setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("memory/orchestrator.log", mode="a"),
        ],
    )


def main() -> int:
    _setup_logging()
    logger = logging.getLogger(__name__)

    if not ANTHROPIC_API_KEY:
        print(
            "ERROR: ANTHROPIC_API_KEY is not set.\n"
            "Export it before running:\n"
            "    export ANTHROPIC_API_KEY=sk-ant-...",
            file=sys.stderr,
        )
        return 1

    logger.info(
        "Starting %g-hour multi-agent research session. "
        "Topics: kunst, musikk, video, forfatter, vibe_code, "
        "nye_oppfinnelser, trender, nye_produkter",
        TOTAL_DURATION_HOURS,
    )

    import os
    os.makedirs("memory", exist_ok=True)

    from agents.supervisor import Supervisor
    supervisor = Supervisor()
    supervisor.run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
