"""Analysis tools: performance indices and historical trend identification.

Acts as the "analysis" stage of the drone-inspired component pipeline,
consuming tracking/match data and producing higher-level signals that the
gambling layer uses for trend-based edge detection.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass
from typing import List, Sequence

from football_simulator.core.match import MatchResult
from football_simulator.core.player import Player, PlayerMatchStats


@dataclass
class PerformanceIndex:
    """A single composite performance number (0-100 scale) for a match."""

    value: float
    components: dict


def compute_performance_index(player: Player, stats: PlayerMatchStats) -> PerformanceIndex:
    """Blend raw match output with the player's underlying skill rating into
    one comparable index, useful for ranking performances across positions."""

    if stats.minutes_played == 0:
        return PerformanceIndex(value=0.0, components={})

    contribution = (
        stats.goals * 10
        + stats.assists * 6
        + stats.key_passes * 1.0
        + stats.tackles_won * 1.2
        + stats.interceptions * 1.2
        + stats.saves * 1.5
        + stats.pass_accuracy() * 10
        - stats.yellow_cards * 3
        - stats.red_cards * 12
    )
    skill_baseline = player.effective_rating() * 0.4
    raw = skill_baseline + contribution
    value = max(0.0, min(100.0, raw))
    components = {
        "skill_baseline": round(skill_baseline, 2),
        "match_contribution": round(contribution, 2),
    }
    return PerformanceIndex(value=round(value, 2), components=components)


@dataclass
class TrendReport:
    series_length: int
    moving_average: float
    slope_per_period: float
    direction: str  # "up" | "down" | "flat"


class TrendAnalyzer:
    """Identifies trends in historical numeric series (form, xG, odds movement, etc.)."""

    @staticmethod
    def moving_average(series: Sequence[float], window: int = 5) -> List[float]:
        if window <= 0:
            raise ValueError("window must be positive")
        result = []
        for i in range(len(series)):
            start = max(0, i - window + 1)
            chunk = series[start: i + 1]
            result.append(sum(chunk) / len(chunk))
        return result

    @staticmethod
    def linear_slope(series: Sequence[float]) -> float:
        """Least-squares slope of ``series`` against its index (no numpy needed)."""

        n = len(series)
        if n < 2:
            return 0.0
        xs = list(range(n))
        mean_x = statistics.mean(xs)
        mean_y = statistics.mean(series)
        numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, series))
        denominator = sum((x - mean_x) ** 2 for x in xs)
        if denominator == 0:
            return 0.0
        return numerator / denominator

    @classmethod
    def analyze(cls, series: Sequence[float], window: int = 5) -> TrendReport:
        if not series:
            raise ValueError("series must be non-empty")
        moving_avg = cls.moving_average(series, window)[-1]
        slope = cls.linear_slope(series)
        if slope > 0.05:
            direction = "up"
        elif slope < -0.05:
            direction = "down"
        else:
            direction = "flat"
        return TrendReport(
            series_length=len(series),
            moving_average=round(moving_avg, 4),
            slope_per_period=round(slope, 5),
            direction=direction,
        )


def head_to_head_goal_trend(results: Sequence[MatchResult], team_id: str) -> TrendReport:
    """Trend of a team's goals-scored across a sequence of historical matches,
    used by the gambling layer to spot teams heating up or cooling off."""

    goals_series = []
    for r in results:
        if r.home_team_id == team_id:
            goals_series.append(r.score.home)
        elif r.away_team_id == team_id:
            goals_series.append(r.score.away)
    return TrendAnalyzer.analyze(goals_series) if goals_series else TrendReport(0, 0.0, 0.0, "flat")
