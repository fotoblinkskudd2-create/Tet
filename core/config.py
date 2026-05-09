from __future__ import annotations

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

DEFAULT_CONFIG: dict = {
    "num_workers_per_type": 2,
    "task_generation_interval": 90,
    "health_check_interval": 30,
    "report_interval": 3600,
    "dashboard_port": 8080,
    "db_path": str(BASE_DIR / "data" / "tasks.db"),
    "log_dir": str(BASE_DIR / "logs"),
    "task_inbox": str(BASE_DIR / "tasks" / "inbox"),
    "reports_dir": str(BASE_DIR / "reports"),
    "max_task_retries": 3,
    "worker_poll_interval": 2,
    "agent_restart_delay": 5,
    "stale_task_timeout": 300,
    "log_level": "INFO",
}


def load_config() -> dict:
    config = dict(DEFAULT_CONFIG)
    config_path = BASE_DIR / "config.json"
    if config_path.exists():
        with open(config_path) as f:
            config.update(json.load(f))
    return config
