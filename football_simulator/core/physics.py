"""Lightweight physics models for ball trajectories and on-pitch positioning.

These are intentionally simplified (no full rigid-body engine) but capture
the variables that matter for shot-quality and movement realism: distance,
angle, drag-adjusted flight time and pitch geometry. Pure stdlib `math`,
no numpy required.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

PITCH_LENGTH_M = 105.0
PITCH_WIDTH_M = 68.0
GOAL_WIDTH_M = 7.32
GRAVITY = 9.81
AIR_DRAG_COEFFICIENT = 0.05  # simplified linear drag factor on horizontal velocity


@dataclass(frozen=True)
class Vector2:
    x: float
    y: float

    def distance_to(self, other: "Vector2") -> float:
        return math.hypot(self.x - other.x, self.y - other.y)

    def __add__(self, other: "Vector2") -> "Vector2":
        return Vector2(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar: float) -> "Vector2":
        return Vector2(self.x * scalar, self.y * scalar)


GOAL_HOME = Vector2(0.0, PITCH_WIDTH_M / 2)
GOAL_AWAY = Vector2(PITCH_LENGTH_M, PITCH_WIDTH_M / 2)


@dataclass
class ShotPhysics:
    """Resolves a single shot attempt into a flight time and on-target probability
    contribution, based on distance/angle to goal and shot power.
    """

    origin: Vector2
    target_goal: Vector2
    power_m_per_s: float  # initial ball speed
    accuracy: float       # 0-1, player shooting/technique driven

    def distance_to_goal(self) -> float:
        return self.origin.distance_to(self.target_goal)

    def shot_angle_degrees(self) -> float:
        """Angle (0-90) between the shot line and the goal-mouth, narrower
        angle (closer to the byline) makes scoring harder."""

        dx = abs(self.target_goal.x - self.origin.x)
        dy = abs(self.target_goal.y - self.origin.y)
        if dx == 0:
            return 90.0
        return math.degrees(math.atan2(dy, dx))

    def flight_time_seconds(self) -> float:
        """Time for the ball to cover the distance under simplified linear drag."""

        distance = self.distance_to_goal()
        effective_speed = max(1.0, self.power_m_per_s - AIR_DRAG_COEFFICIENT * distance)
        return distance / effective_speed

    def on_target_probability(self) -> float:
        """Probability the shot is on target, combining distance, angle and accuracy."""

        distance = self.distance_to_goal()
        angle = self.shot_angle_degrees()
        distance_factor = math.exp(-distance / 28.0)
        angle_factor = max(0.05, 1.0 - (angle / 110.0))
        raw = distance_factor * angle_factor * self.accuracy
        return max(0.0, min(1.0, raw))


def expected_goal_value(distance_m: float, angle_degrees: float, is_header: bool = False) -> float:
    """A compact xG (expected goals) model driven purely by shot geometry.

    Calibrated so close, central, non-headed chances approach ~0.8 xG while
    long-range/tight-angle efforts trend toward 0.02-0.05, matching typical
    real-world xG distributions used in betting markets.
    """

    distance_term = math.exp(-distance_m / 9.0)
    angle_term = max(0.1, 1.0 - (angle_degrees / 130.0))
    header_penalty = 0.55 if is_header else 1.0
    xg = distance_term * angle_term * header_penalty
    return max(0.01, min(0.95, xg))


@dataclass(frozen=True)
class PitchZone:
    """A coarse 6x4 tactical grid zone used for positioning/heatmaps."""

    column: int  # 0-5 (own goal -> opponent goal)
    row: int     # 0-3 (left touchline -> right touchline)

    @classmethod
    def from_position(cls, position: Vector2) -> "PitchZone":
        column = min(5, max(0, int(position.x / (PITCH_LENGTH_M / 6))))
        row = min(3, max(0, int(position.y / (PITCH_WIDTH_M / 4))))
        return cls(column=column, row=row)


def formation_base_position(role_index: int, role: str, attacking_third: bool) -> Vector2:
    """Return a baseline pitch coordinate for a role, used to seed tracking data.

    ``role`` is one of GK/DF/MF/FW. This is not meant to be tactically
    perfect, only plausible and deterministic given a role + slot index.
    """

    x_by_role = {"GK": 6.0, "DF": 22.0, "MF": 52.0, "FW": 82.0}
    base_x = x_by_role.get(role, 52.0)
    if attacking_third:
        base_x = PITCH_LENGTH_M - base_x
    spread = PITCH_WIDTH_M / 5.0
    y = spread * (role_index + 1)
    return Vector2(x=base_x, y=min(PITCH_WIDTH_M - 2.0, max(2.0, y)))
