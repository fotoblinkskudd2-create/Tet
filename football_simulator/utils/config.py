"""Configuration objects for the simulator, gambling engine and scoring rules.

Centralizing tunable parameters here means simulation behaviour can be
adjusted (or A/B tested) without touching engine code.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field, fields
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import yaml  # type: ignore

    _HAS_YAML = True
except ImportError:  # pragma: no cover - yaml is an optional convenience
    _HAS_YAML = False


@dataclass
class SimulationConfig:
    """Tunable parameters for the match/season simulation engine."""

    match_duration_minutes: int = 90
    time_step_minutes: int = 1
    extra_time_minutes: int = 0
    home_advantage: float = 0.12
    """Fractional boost applied to the home team's effective strength."""

    base_goal_rate_per_90: float = 1.35
    """League-average expected goals per team per 90 minutes, used to scale xG."""

    finishing_variance: float = 0.18
    """Std-dev style noise applied to shot quality to keep outcomes unpredictable."""

    injury_probability_per_match: float = 0.015
    """Probability that a given outfield player suffers an injury in a match."""

    card_probability_per_foul: float = 0.22
    random_seed: Optional[int] = None
    monte_carlo_simulations: int = 1000
    max_workers: int = 4
    use_multiprocessing: bool = False
    """If False, parallel runs use threads (safer for sandboxed envs)."""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SimulationConfig":
        valid_keys = {f.name for f in fields(cls)}
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)


@dataclass
class ScoringRules:
    """Pre-defined point-scoring rules used to turn match stats into gambling points.

    Mirrors a typical fantasy/DFS scoring sheet. Values are points awarded
    per occurrence and can be tuned per competition/operator.
    """

    goal_forward: float = 4.0
    goal_midfielder: float = 5.0
    goal_defender: float = 6.0
    goal_goalkeeper: float = 10.0
    assist: float = 3.0
    clean_sheet_defender: float = 4.0
    clean_sheet_goalkeeper: float = 4.0
    clean_sheet_midfielder: float = 1.0
    shot_on_target: float = 0.5
    key_pass: float = 0.3
    successful_tackle: float = 0.3
    interception: float = 0.3
    save: float = 0.5
    penalty_save: float = 5.0
    yellow_card: float = -1.0
    red_card: float = -3.0
    own_goal: float = -2.0
    penalty_miss: float = -2.0
    goals_conceded_per_2_gk: float = -1.0
    appearance: float = 1.0
    full_match_bonus: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ScoringRules":
        valid_keys = {f.name for f in fields(cls)}
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)


@dataclass
class GamblingConfig:
    """Parameters controlling the odds/risk layer."""

    bookmaker_margin: float = 0.06
    """Overround applied on top of fair (no-vig) probabilities."""

    kelly_fraction: float = 0.5
    """Fractional Kelly multiplier (1.0 = full Kelly, lower = more conservative)."""

    min_edge_for_value_bet: float = 0.02
    max_stake_fraction_of_bankroll: float = 0.1
    default_starting_bankroll: float = 1000.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "GamblingConfig":
        valid_keys = {f.name for f in fields(cls)}
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)


@dataclass
class AppConfig:
    """Top-level configuration bundle covering every tunable subsystem."""

    simulation: SimulationConfig = field(default_factory=SimulationConfig)
    scoring: ScoringRules = field(default_factory=ScoringRules)
    gambling: GamblingConfig = field(default_factory=GamblingConfig)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "simulation": self.simulation.to_dict(),
            "scoring": self.scoring.to_dict(),
            "gambling": self.gambling.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AppConfig":
        return cls(
            simulation=SimulationConfig.from_dict(data.get("simulation", {})),
            scoring=ScoringRules.from_dict(data.get("scoring", {})),
            gambling=GamblingConfig.from_dict(data.get("gambling", {})),
        )


def save_config(config: AppConfig, path: str) -> None:
    """Persist an AppConfig to disk as JSON or YAML, inferred from the extension."""

    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    data = config.to_dict()
    if target.suffix in (".yaml", ".yml"):
        if not _HAS_YAML:
            raise RuntimeError("PyYAML is not installed; use a .json path instead.")
        with target.open("w", encoding="utf-8") as fh:
            yaml.safe_dump(data, fh, sort_keys=False)
    else:
        with target.open("w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)


def load_config(path: str) -> AppConfig:
    """Load an AppConfig from a JSON or YAML file."""

    target = Path(path)
    with target.open("r", encoding="utf-8") as fh:
        if target.suffix in (".yaml", ".yml"):
            if not _HAS_YAML:
                raise RuntimeError("PyYAML is not installed; use a .json path instead.")
            data = yaml.safe_load(fh) or {}
        else:
            data = json.load(fh)
    return AppConfig.from_dict(data)
