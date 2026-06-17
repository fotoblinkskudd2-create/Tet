"""A pluggable component architecture inspired by drone flight-controller design:

- Each capability is a small, independently testable ``Module``.
- Modules publish/subscribe to a shared ``DataBus`` instead of calling each
  other directly, so components can be swapped or reordered freely.
- ``RedundancyGroup`` gives fault tolerance: if a primary module fails
  mid-flight (or mid-match), traffic automatically fails over to a backup,
  the same way a drone falls back to a secondary IMU/GPS module.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

from football_simulator.utils.logger import get_logger

logger = get_logger(__name__)


class ModuleStatus(str, Enum):
    ACTIVE = "active"
    DEGRADED = "degraded"
    FAILED = "failed"
    STANDBY = "standby"


class Module(ABC):
    """Base class for a pluggable processing component."""

    def __init__(self, module_id: str, name: str):
        self.module_id = module_id
        self.name = name
        self.status: ModuleStatus = ModuleStatus.ACTIVE
        self.health: float = 100.0
        self.error_count: int = 0

    @abstractmethod
    def process(self, payload: Any) -> Any:
        """Transform input data into output data. Raise on unrecoverable error."""

    def is_healthy(self, health_threshold: float = 40.0) -> bool:
        return (
            self.status in (ModuleStatus.ACTIVE, ModuleStatus.DEGRADED, ModuleStatus.STANDBY)
            and self.health >= health_threshold
        )

    def degrade(self, amount: float = 15.0) -> None:
        self.health = max(0.0, self.health - amount)
        if self.health <= 0.0:
            self.status = ModuleStatus.FAILED
        elif self.health < 60.0:
            self.status = ModuleStatus.DEGRADED

    def recover(self, amount: float = 25.0) -> None:
        self.health = min(100.0, self.health + amount)
        if self.health >= 60.0 and self.status != ModuleStatus.FAILED:
            self.status = ModuleStatus.ACTIVE

    def fail(self) -> None:
        self.health = 0.0
        self.status = ModuleStatus.FAILED

    def safe_process(self, payload: Any) -> Any:
        """Process with built-in fault handling: errors degrade health rather
        than propagate, so a single bad frame doesn't crash the pipeline."""

        if not self.is_healthy():
            raise RuntimeError(f"Module {self.name} ({self.module_id}) is not healthy: {self.status}")
        try:
            result = self.process(payload)
            self.recover(amount=2.0)  # successful runs slowly restore health
            return result
        except Exception:
            self.error_count += 1
            self.degrade(amount=30.0)
            logger.warning("Module %s failed processing (health=%.1f, status=%s)", self.name, self.health, self.status)
            raise


@dataclass
class DataBus:
    """Lightweight publish/subscribe bus for inter-module data flow."""

    _subscribers: Dict[str, List[Callable[[Any], None]]] = field(default_factory=dict)
    _last_message: Dict[str, Any] = field(default_factory=dict)

    def subscribe(self, topic: str, callback: Callable[[Any], None]) -> None:
        self._subscribers.setdefault(topic, []).append(callback)

    def publish(self, topic: str, message: Any) -> None:
        self._last_message[topic] = message
        for callback in self._subscribers.get(topic, []):
            try:
                callback(message)
            except Exception:  # one bad subscriber must not break the bus
                logger.exception("Subscriber to topic '%s' raised an exception", topic)

    def last(self, topic: str) -> Optional[Any]:
        return self._last_message.get(topic)


class RedundancyGroup:
    """A primary module plus ordered backups; auto-fails-over on health loss."""

    def __init__(self, primary: Module, backups: Optional[List[Module]] = None):
        self.primary = primary
        self.backups = backups or []
        for backup in self.backups:
            backup.status = ModuleStatus.STANDBY

    @property
    def active_module(self) -> Optional[Module]:
        if self.primary.is_healthy():
            return self.primary
        for backup in self.backups:
            if backup.is_healthy():
                return backup
        return None

    def process(self, payload: Any) -> Any:
        module = self.active_module
        if module is None:
            raise RuntimeError("No healthy module available in redundancy group "
                                f"(primary={self.primary.name})")
        try:
            return module.safe_process(payload)
        except Exception:
            # Primary just failed this call; immediately retry on the next
            # healthy backup so the caller still gets a result if possible.
            fallback = self.active_module
            if fallback is not None and fallback is not module:
                return fallback.safe_process(payload)
            raise

    def health_report(self) -> Dict[str, Any]:
        return {
            "active_module": self.active_module.name if self.active_module else None,
            "primary": {"name": self.primary.name, "status": self.primary.status, "health": self.primary.health},
            "backups": [
                {"name": b.name, "status": b.status, "health": b.health} for b in self.backups
            ],
        }


class ComponentController:
    """Orchestrates an ordered pipeline of redundancy groups, wiring them
    together through a shared DataBus (camera-tracking -> positioning -> analysis)."""

    def __init__(self, bus: Optional[DataBus] = None):
        self.bus = bus or DataBus()
        self._stages: List[RedundancyGroup] = []
        self._stage_topics: List[str] = []

    def add_stage(self, group: RedundancyGroup, output_topic: str) -> None:
        self._stages.append(group)
        self._stage_topics.append(output_topic)

    def run(self, initial_payload: Any) -> Any:
        payload = initial_payload
        for stage, topic in zip(self._stages, self._stage_topics):
            payload = stage.process(payload)
            self.bus.publish(topic, payload)
        return payload

    def system_health_report(self) -> List[Dict[str, Any]]:
        return [stage.health_report() for stage in self._stages]
