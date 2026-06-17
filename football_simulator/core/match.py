"""Match data model: events, scoreline and full result container.

This module defines *data* (events, results). The actual minute-by-minute
algorithm lives in ``core.simulator.MatchEngine`` to keep the simulation
logic separate from the structures it produces.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

from football_simulator.core.player import Player, PlayerMatchStats
from football_simulator.core.team import Team


class EventType(str, Enum):
    GOAL = "goal"
    OWN_GOAL = "own_goal"
    YELLOW_CARD = "yellow_card"
    RED_CARD = "red_card"
    INJURY = "injury"
    SUBSTITUTION = "substitution"
    PENALTY_MISS = "penalty_miss"
    PENALTY_SAVE = "penalty_save"


@dataclass
class MatchEvent:
    minute: int
    event_type: EventType
    team_id: str
    player_id: Optional[str] = None
    secondary_player_id: Optional[str] = None  # e.g. assist provider, sub coming on
    description: str = ""


@dataclass
class Score:
    home: int = 0
    away: int = 0

    def __str__(self) -> str:
        return f"{self.home}-{self.away}"


@dataclass
class MatchResult:
    """The complete outcome of a single simulated match."""

    match_id: str = field(default_factory=lambda: f"M-{uuid.uuid4().hex[:10]}")
    home_team_id: str = ""
    away_team_id: str = ""
    home_team_name: str = ""
    away_team_name: str = ""
    score: Score = field(default_factory=Score)
    events: List[MatchEvent] = field(default_factory=list)
    player_stats: Dict[str, PlayerMatchStats] = field(default_factory=dict)
    expected_goals_home: float = 0.0
    expected_goals_away: float = 0.0
    possession_home_pct: float = 50.0
    shots_home: int = 0
    shots_away: int = 0

    def winner_team_id(self) -> Optional[str]:
        if self.score.home > self.score.away:
            return self.home_team_id
        if self.score.away > self.score.home:
            return self.away_team_id
        return None

    def outcome_for(self, team_id: str) -> str:
        """Return 'win' / 'draw' / 'loss' from the perspective of ``team_id``."""

        winner = self.winner_team_id()
        if winner is None:
            return "draw"
        return "win" if winner == team_id else "loss"

    def total_goals(self) -> int:
        return self.score.home + self.score.away

    def both_teams_scored(self) -> bool:
        return self.score.home > 0 and self.score.away > 0


@dataclass
class Match:
    """Orchestrates the simulation of a single fixture between two teams."""

    home_team: Team
    away_team: Team
    config: "football_simulator.utils.config.SimulationConfig" = None  # type: ignore[name-defined]
    seed: Optional[int] = None

    def run(self) -> MatchResult:
        from football_simulator.core.simulator import MatchEngine
        from football_simulator.utils.config import SimulationConfig

        cfg = self.config or SimulationConfig()
        engine = MatchEngine(cfg, seed=self.seed)
        return engine.simulate(self.home_team, self.away_team)
