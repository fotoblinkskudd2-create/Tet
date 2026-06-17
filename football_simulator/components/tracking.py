"""Player-tracking component: synthesizes plausible on-pitch positions and
movement metrics from a team's formation and a match's events.

This stands in for a real camera/optical tracking feed (the "camera-tracking"
drone module): given the same inputs, it deterministically reproduces
realistic positional data (heatmaps, distance covered, sprint counts) that
downstream analytics can consume.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from football_simulator.core.physics import PitchZone, Vector2, formation_base_position
from football_simulator.core.player import Player, Position
from football_simulator.core.team import Team


@dataclass
class PlayerTrackingData:
    player_id: str
    positions: List[Vector2] = field(default_factory=list)
    distance_covered_km: float = 0.0
    sprint_count: int = 0
    heatmap: Dict[Tuple[int, int], int] = field(default_factory=dict)

    def record(self, position: Vector2) -> None:
        self.positions.append(position)
        zone = PitchZone.from_position(position)
        key = (zone.column, zone.row)
        self.heatmap[key] = self.heatmap.get(key, 0) + 1


class PlayerTracker:
    """Generates per-minute position samples for a player using a constrained
    random walk around their formation slot - a lightweight stand-in for
    optical/GPS tracking data."""

    def __init__(self, seed: int = None):  # type: ignore[assignment]
        self.rng = random.Random(seed)

    def track_player(
        self,
        player: Player,
        role_index: int,
        attacking_third: bool,
        sample_minutes: int = 90,
    ) -> PlayerTrackingData:
        base = formation_base_position(role_index, player.position.value, attacking_third)
        data = PlayerTrackingData(player_id=player.player_id)

        mobility = 0.4 + (player.attributes.pace / 99.0) * 0.6
        position = base
        previous = base
        total_distance_m = 0.0
        sprint_threshold_m = 4.5 * mobility

        for _ in range(sample_minutes):
            dx = self.rng.uniform(-8, 8) * mobility
            dy = self.rng.uniform(-6, 6) * mobility
            position = Vector2(
                x=min(105.0, max(0.0, base.x + dx)),
                y=min(68.0, max(0.0, base.y + dy)),
            )
            step_distance = previous.distance_to(position)
            total_distance_m += step_distance
            if step_distance > sprint_threshold_m:
                data.sprint_count += 1
            data.record(position)
            previous = position

        data.distance_covered_km = round(total_distance_m / 1000.0, 3)
        return data


class TeamTracker:
    """Aggregates per-player tracking across a full lineup."""

    def __init__(self, seed: int = None):  # type: ignore[assignment]
        self.player_tracker = PlayerTracker(seed=seed)

    def track_team(self, team: Team, lineup: List[Player], attacking_third: bool) -> Dict[str, PlayerTrackingData]:
        results: Dict[str, PlayerTrackingData] = {}
        role_indices: Dict[Position, int] = {pos: 0 for pos in Position}
        for player in lineup:
            idx = role_indices[player.position]
            role_indices[player.position] += 1
            results[player.player_id] = self.player_tracker.track_player(
                player, idx, attacking_third
            )
        return results

    @staticmethod
    def team_heatmap(tracking: Dict[str, PlayerTrackingData]) -> Dict[Tuple[int, int], int]:
        combined: Dict[Tuple[int, int], int] = {}
        for data in tracking.values():
            for zone, count in data.heatmap.items():
                combined[zone] = combined.get(zone, 0) + count
        return combined
