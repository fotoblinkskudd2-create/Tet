"""Player data model: attributes, skill ratings, form/injury tracking and stats.

The module intentionally avoids any I/O or simulation logic; it only models
*what a player is* and *how their numbers translate into a rating or
gambling points*. The simulation engine (``core.simulator``) consumes these
objects but does not mutate their static definitions directly - it goes
through the explicit update methods below so changes stay auditable.
"""
from __future__ import annotations

import itertools
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

from football_simulator.utils.config import ScoringRules

_id_counter = itertools.count(1)


class Position(str, Enum):
    GOALKEEPER = "GK"
    DEFENDER = "DF"
    MIDFIELDER = "MF"
    FORWARD = "FW"


class InjurySeverity(str, Enum):
    MINOR = "minor"      # ~1 week
    MODERATE = "moderate"  # ~3-4 weeks
    SEVERE = "severe"     # ~8+ weeks


_INJURY_WEEKS: Dict[InjurySeverity, int] = {
    InjurySeverity.MINOR: 1,
    InjurySeverity.MODERATE: 4,
    InjurySeverity.SEVERE: 10,
}


@dataclass
class Injury:
    """An active injury and its expected recovery timeline."""

    description: str
    severity: InjurySeverity
    weeks_remaining: float

    @classmethod
    def new(cls, description: str, severity: InjurySeverity) -> "Injury":
        return cls(description=description, severity=severity, weeks_remaining=float(_INJURY_WEEKS[severity]))

    def advance_week(self) -> bool:
        """Reduce remaining recovery time by one week; return True if healed."""

        self.weeks_remaining = max(0.0, self.weeks_remaining - 1.0)
        return self.weeks_remaining <= 0.0


@dataclass
class PlayerAttributes:
    """Core 1-99 skill attributes used to derive position-specific ratings."""

    pace: int = 60
    shooting: int = 60
    passing: int = 60
    dribbling: int = 60
    defending: int = 60
    physical: int = 60
    goalkeeping: int = 40

    def clamp(self) -> None:
        for attr_name in ("pace", "shooting", "passing", "dribbling", "defending", "physical", "goalkeeping"):
            setattr(self, attr_name, max(1, min(99, int(round(getattr(self, attr_name))))))


# Position-specific attribute weights used for the single "overall rating" figure.
# Weights sum to 1.0 per position.
_POSITION_WEIGHTS: Dict[Position, Dict[str, float]] = {
    Position.GOALKEEPER: {
        "goalkeeping": 0.6,
        "physical": 0.15,
        "passing": 0.1,
        "pace": 0.05,
        "defending": 0.1,
    },
    Position.DEFENDER: {
        "defending": 0.4,
        "physical": 0.2,
        "pace": 0.15,
        "passing": 0.15,
        "dribbling": 0.05,
        "shooting": 0.05,
    },
    Position.MIDFIELDER: {
        "passing": 0.3,
        "dribbling": 0.2,
        "defending": 0.15,
        "physical": 0.1,
        "shooting": 0.15,
        "pace": 0.1,
    },
    Position.FORWARD: {
        "shooting": 0.35,
        "pace": 0.2,
        "dribbling": 0.2,
        "physical": 0.1,
        "passing": 0.1,
        "defending": 0.05,
    },
}


@dataclass
class PlayerMatchStats:
    """Counting stats accumulated for a single match."""

    minutes_played: int = 0
    goals: int = 0
    assists: int = 0
    shots: int = 0
    shots_on_target: int = 0
    key_passes: int = 0
    passes_attempted: int = 0
    passes_completed: int = 0
    tackles_won: int = 0
    interceptions: int = 0
    clearances: int = 0
    saves: int = 0
    penalty_saves: int = 0
    fouls_committed: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    own_goals: int = 0
    penalty_misses: int = 0
    goals_conceded: int = 0
    distance_covered_km: float = 0.0
    clean_sheet: bool = False

    def pass_accuracy(self) -> float:
        if self.passes_attempted == 0:
            return 0.0
        return self.passes_completed / self.passes_attempted

    def merge(self, other: "PlayerMatchStats") -> None:
        """Accumulate another stats slice into this one (used during live sim)."""

        for f in self.__dataclass_fields__:  # type: ignore[attr-defined]
            if f == "clean_sheet":
                self.clean_sheet = self.clean_sheet or other.clean_sheet
                continue
            setattr(self, f, getattr(self, f) + getattr(other, f))


@dataclass
class PlayerSeasonStats:
    """Season-long aggregation, kept separate from per-match stats."""

    matches_played: int = 0
    totals: PlayerMatchStats = field(default_factory=PlayerMatchStats)
    fantasy_points_history: List[float] = field(default_factory=list)

    def record_match(self, match_stats: PlayerMatchStats, fantasy_points: float) -> None:
        self.matches_played += 1
        self.totals.merge(match_stats)
        self.fantasy_points_history.append(fantasy_points)

    def average_fantasy_points(self) -> float:
        if not self.fantasy_points_history:
            return 0.0
        return sum(self.fantasy_points_history) / len(self.fantasy_points_history)


@dataclass
class Player:
    """A football player: static attributes plus dynamic season-tracking state."""

    name: str
    position: Position
    attributes: PlayerAttributes = field(default_factory=PlayerAttributes)
    age: int = 25
    nationality: str = ""
    player_id: str = field(default_factory=lambda: f"P{next(_id_counter):05d}-{uuid.uuid4().hex[:6]}")

    # Dynamic state, updated by the simulator/season engine over time.
    form: float = 70.0          # 0-100, recent performance trend
    fitness: float = 100.0      # 0-100, drained by minutes played, regenerates with rest
    morale: float = 75.0        # 0-100
    experience: int = 0         # appearances made (career)
    injury: Optional[Injury] = None

    season_stats: PlayerSeasonStats = field(default_factory=PlayerSeasonStats)

    def __post_init__(self) -> None:
        self.attributes.clamp()

    # -- Ratings ---------------------------------------------------------
    def overall_rating(self) -> float:
        """Position-weighted base skill rating on a 1-99 scale."""

        weights = _POSITION_WEIGHTS[self.position]
        return sum(getattr(self.attributes, attr) * w for attr, w in weights.items())

    def experience_modifier(self) -> float:
        """Small multiplicative bonus for seasoned players, capped at +6%."""

        return min(0.06, 0.002 * self.experience)

    def effective_rating(self) -> float:
        """Overall rating adjusted for current form, fitness and experience.

        This is what the match simulator should use, instead of the static
        ``overall_rating``, so that fatigue/morale/form actually matter.
        """

        base = self.overall_rating() * (1.0 + self.experience_modifier())
        form_factor = 0.85 + 0.3 * (self.form / 100.0)       # 0.85 - 1.15
        fitness_factor = 0.7 + 0.3 * (self.fitness / 100.0)  # 0.70 - 1.00
        morale_factor = 0.9 + 0.2 * (self.morale / 100.0)    # 0.90 - 1.10
        rating = base * form_factor * fitness_factor * morale_factor
        if self.is_injured():
            rating *= 0.0
        return max(1.0, min(99.0, rating))

    def is_injured(self) -> bool:
        return self.injury is not None and self.injury.weeks_remaining > 0

    # -- Dynamic updates ---------------------------------------------------
    def apply_match_result(self, stats: PlayerMatchStats, scoring_rules: ScoringRules) -> float:
        """Update form/fitness/experience from a match and return fantasy points earned."""

        self.experience += 1 if stats.minutes_played > 0 else 0
        self._update_form(stats)
        self._update_fitness(stats)
        points = compute_fantasy_points(self, stats, scoring_rules)
        self.season_stats.record_match(stats, points)
        return points

    def _update_form(self, stats: PlayerMatchStats) -> None:
        if stats.minutes_played == 0:
            return
        performance_delta = (
            stats.goals * 6
            + stats.assists * 4
            + stats.tackles_won * 0.5
            + stats.interceptions * 0.5
            + stats.saves * 0.7
            - stats.yellow_cards * 2
            - stats.red_cards * 8
            - stats.own_goals * 5
        )
        # Form drifts toward a baseline plus the match performance delta, clamped.
        self.form = max(0.0, min(100.0, self.form * 0.85 + 15.0 + performance_delta))

    def _update_fitness(self, stats: PlayerMatchStats) -> None:
        drain = (stats.minutes_played / 90.0) * 18.0
        self.fitness = max(10.0, min(100.0, self.fitness - drain))

    def regenerate_between_matches(self, rest_days: int) -> None:
        """Recover fitness (and tick down injuries) during a rest period."""

        self.fitness = min(100.0, self.fitness + rest_days * 6.0)
        if self.injury is not None:
            healed = self.injury.advance_week()
            if healed:
                self.injury = None

    def set_injury(self, description: str, severity: InjurySeverity) -> None:
        self.injury = Injury.new(description, severity)


def compute_fantasy_points(
    player: Player, stats: PlayerMatchStats, rules: ScoringRules
) -> float:
    """Translate a single match's stats into gambling/fantasy points.

    Position affects goal value (defenders/keepers score fewer goals but get
    rewarded more per goal) following standard DFS-style scoring sheets.
    """

    if stats.minutes_played <= 0:
        return 0.0

    goal_points = {
        Position.FORWARD: rules.goal_forward,
        Position.MIDFIELDER: rules.goal_midfielder,
        Position.DEFENDER: rules.goal_defender,
        Position.GOALKEEPER: rules.goal_goalkeeper,
    }[player.position]

    points = rules.appearance
    if stats.minutes_played >= 60:
        points += rules.full_match_bonus
    points += stats.goals * goal_points
    points += stats.assists * rules.assist
    points += stats.shots_on_target * rules.shot_on_target
    points += stats.key_passes * rules.key_pass
    points += stats.tackles_won * rules.successful_tackle
    points += stats.interceptions * rules.interception
    points += stats.saves * rules.save
    points += stats.penalty_saves * rules.penalty_save
    points += stats.yellow_cards * rules.yellow_card
    points += stats.red_cards * rules.red_card
    points += stats.own_goals * rules.own_goal
    points += stats.penalty_misses * rules.penalty_miss

    if stats.clean_sheet:
        if player.position == Position.GOALKEEPER:
            points += rules.clean_sheet_goalkeeper
        elif player.position == Position.DEFENDER:
            points += rules.clean_sheet_defender
        elif player.position == Position.MIDFIELDER:
            points += rules.clean_sheet_midfielder

    if player.position == Position.GOALKEEPER and stats.goals_conceded >= 2:
        points += (stats.goals_conceded // 2) * rules.goals_conceded_per_2_gk

    return round(points, 2)
