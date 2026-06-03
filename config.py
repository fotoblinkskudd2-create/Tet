"""Central configuration for the multi-agent Tet extension system."""
from __future__ import annotations
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

MODEL_FAST = "claude-haiku-4-5-20251001"
MODEL_SMART = "claude-sonnet-4-6"

CYCLE_INTERVAL_SECONDS = int(os.getenv("CYCLE_INTERVAL", "600"))
MAX_TASKS_PER_CYCLE = 2

STATE_DB = str(BASE_DIR / "agent_state.db")
LOG_DIR = str(BASE_DIR / "logs")

GIT_COMMIT_PREFIX = "[agent]"
GIT_BRANCH = "claude/multi-agent-system-J1dzL"

MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 30

APP_FILE = str(BASE_DIR / "app.py")
TESTS_DIR = str(BASE_DIR / "tests")
