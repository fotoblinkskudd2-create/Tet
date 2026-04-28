"""
Thread-safe persistent memory store for agent findings.
Each agent writes JSON files; the supervisor reads them for reports.
"""
from __future__ import annotations

import json
import os
import threading
import time
from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class Finding:
    topic: str
    agent_id: str
    cycle: int
    timestamp: float
    opportunity: str
    speed_to_money: int   # 1-10, 10 = fastest
    effort: str           # low / medium / high
    first_action: str
    earning_potential: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class AgentStatus:
    agent_id: str
    status: str          # running / stalled / done / replaced
    last_heartbeat: float
    cycles_completed: int
    topics_covered: list[str] = field(default_factory=list)
    error: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class MemoryStore:
    """Central in-process store plus JSON persistence."""

    def __init__(self, memory_dir: str) -> None:
        self._dir = memory_dir
        self._worker_dir = os.path.join(memory_dir, "workers")
        self._lock = threading.Lock()
        self._findings: list[Finding] = []
        self._agent_statuses: dict[str, AgentStatus] = {}
        os.makedirs(self._worker_dir, exist_ok=True)
        os.makedirs(os.path.join(memory_dir, "checkpoints"), exist_ok=True)

    # ------------------------------------------------------------------ #
    #  Findings
    # ------------------------------------------------------------------ #

    def add_finding(self, finding: Finding) -> None:
        with self._lock:
            self._findings.append(finding)
            self._persist_findings()

    def get_findings(self) -> list[Finding]:
        with self._lock:
            return list(self._findings)

    def _persist_findings(self) -> None:
        path = os.path.join(self._dir, "findings.json")
        data = [f.to_dict() for f in self._findings]
        _atomic_write(path, json.dumps(data, indent=2))

    # ------------------------------------------------------------------ #
    #  Agent status / heartbeat
    # ------------------------------------------------------------------ #

    def heartbeat(self, agent_id: str, cycles: int, topics: list[str]) -> None:
        with self._lock:
            status = self._agent_statuses.get(agent_id)
            if status is None:
                status = AgentStatus(
                    agent_id=agent_id,
                    status="running",
                    last_heartbeat=time.time(),
                    cycles_completed=cycles,
                    topics_covered=topics,
                )
                self._agent_statuses[agent_id] = status
            else:
                status.last_heartbeat = time.time()
                status.cycles_completed = cycles
                status.topics_covered = topics
                status.status = "running"
            self._persist_status(agent_id)

    def mark_done(self, agent_id: str) -> None:
        with self._lock:
            if agent_id in self._agent_statuses:
                self._agent_statuses[agent_id].status = "done"
                self._persist_status(agent_id)

    def mark_stalled(self, agent_id: str) -> None:
        with self._lock:
            if agent_id in self._agent_statuses:
                self._agent_statuses[agent_id].status = "stalled"
                self._persist_status(agent_id)

    def mark_replaced(self, agent_id: str) -> None:
        with self._lock:
            if agent_id in self._agent_statuses:
                self._agent_statuses[agent_id].status = "replaced"
                self._persist_status(agent_id)

    def get_statuses(self) -> dict[str, AgentStatus]:
        with self._lock:
            return dict(self._agent_statuses)

    def _persist_status(self, agent_id: str) -> None:
        path = os.path.join(self._worker_dir, f"{agent_id}.json")
        _atomic_write(path, json.dumps(self._agent_statuses[agent_id].to_dict(), indent=2))

    def load_persisted(self) -> None:
        """Re-hydrate from disk (useful for resuming a crashed run)."""
        findings_path = os.path.join(self._dir, "findings.json")
        if os.path.exists(findings_path):
            with open(findings_path) as fh:
                for item in json.load(fh):
                    self._findings.append(Finding(**item))

        for fname in os.listdir(self._worker_dir):
            if fname.endswith(".json"):
                with open(os.path.join(self._worker_dir, fname)) as fh:
                    data = json.load(fh)
                    self._agent_statuses[data["agent_id"]] = AgentStatus(**data)


def _atomic_write(path: str, content: str) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w") as fh:
        fh.write(content)
    os.replace(tmp, path)
