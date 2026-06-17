"""Team model: squad management, formations and aggregate strength ratings."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

from football_simulator.core.player import Player, Position


class Formation(str, Enum):
    F_4_4_2 = "4-4-2"
    F_4_3_3 = "4-3-3"
    F_3_5_2 = "3-5-2"
    F_4_2_3_1 = "4-2-3-1"
    F_5_3_2 = "5-3-2"


# Required outfield slots per formation: (defenders, midfielders, forwards). +1 GK always.
_FORMATION_SLOTS: Dict[Formation, Dict[str, int]] = {
    Formation.F_4_4_2: {"DF": 4, "MF": 4, "FW": 2},
    Formation.F_4_3_3: {"DF": 4, "MF": 3, "FW": 3},
    Formation.F_3_5_2: {"DF": 3, "MF": 5, "FW": 2},
    Formation.F_4_2_3_1: {"DF": 4, "MF": 5, "FW": 1},
    Formation.F_5_3_2: {"DF": 5, "MF": 3, "FW": 2},
}


class TacticalStyle(str, Enum):
    BALANCED = "balanced"
    ATTACKING = "attacking"
    DEFENSIVE = "defensive"
    POSSESSION = "possession"
    COUNTER_ATTACK = "counter_attack"


# Multiplicative effect of tactical style on (attack, midfield, defense) strength.
_STYLE_MODIFIERS: Dict[TacticalStyle, Dict[str, float]] = {
    TacticalStyle.BALANCED: {"attack": 1.0, "midfield": 1.0, "defense": 1.0},
    TacticalStyle.ATTACKING: {"attack": 1.12, "midfield": 1.0, "defense": 0.88},
    TacticalStyle.DEFENSIVE: {"attack": 0.85, "midfield": 0.97, "defense": 1.15},
    TacticalStyle.POSSESSION: {"attack": 1.02, "midfield": 1.1, "defense": 0.98},
    TacticalStyle.COUNTER_ATTACK: {"attack": 1.08, "midfield": 0.92, "defense": 1.02},
}


@dataclass
class Team:
    """A football club/squad with players, a formation and a tactical identity."""

    name: str
    players: List[Player] = field(default_factory=list)
    formation: Formation = Formation.F_4_3_3
    tactical_style: TacticalStyle = TacticalStyle.BALANCED
    home_stadium: str = ""
    team_id: str = field(default_factory=lambda: f"T-{uuid.uuid4().hex[:8]}")

    def players_by_position(self, position: Position) -> List[Player]:
        return [p for p in self.players if p.position == position]

    def available_players(self) -> List[Player]:
        """Players fit to play (not injured)."""

        return [p for p in self.players if not p.is_injured()]

    def starting_eleven(self) -> List[Player]:
        """Select a starting XI matching the team's formation, best-available first.

        Falls back gracefully (filling slots with whoever is left) if there
        are not enough fit players in a given position, rather than crashing
        - squads can be thin due to injuries.
        """

        slots = _FORMATION_SLOTS[self.formation]
        available = sorted(self.available_players(), key=lambda p: p.effective_rating(), reverse=True)
        selected: List[Player] = []

        keepers = [p for p in available if p.position == Position.GOALKEEPER]
        if keepers:
            selected.append(keepers[0])

        remaining_pool = [p for p in available if p not in selected]
        for pos_code, count in slots.items():
            position = Position(pos_code)
            candidates = [p for p in remaining_pool if p.position == position][:count]
            selected.extend(candidates)
            for c in candidates:
                remaining_pool.remove(c)

        needed = 11 - len(selected)
        if needed > 0:
            filler = remaining_pool[:needed]
            selected.extend(filler)

        return selected[:11]

    def _line_strength(self, players: List[Player], positions: List[Position]) -> float:
        line_players = [p for p in players if p.position in positions]
        if not line_players:
            return 50.0
        return sum(p.effective_rating() for p in line_players) / len(line_players)

    def attack_strength(self, lineup: Optional[List[Player]] = None) -> float:
        lineup = lineup if lineup is not None else self.starting_eleven()
        base = self._line_strength(lineup, [Position.FORWARD, Position.MIDFIELDER])
        return base * _STYLE_MODIFIERS[self.tactical_style]["attack"]

    def midfield_strength(self, lineup: Optional[List[Player]] = None) -> float:
        lineup = lineup if lineup is not None else self.starting_eleven()
        base = self._line_strength(lineup, [Position.MIDFIELDER])
        return base * _STYLE_MODIFIERS[self.tactical_style]["midfield"]

    def defense_strength(self, lineup: Optional[List[Player]] = None) -> float:
        lineup = lineup if lineup is not None else self.starting_eleven()
        base = self._line_strength(lineup, [Position.DEFENDER, Position.GOALKEEPER])
        return base * _STYLE_MODIFIERS[self.tactical_style]["defense"]

    def squad_rating(self) -> float:
        """Single overall number summarizing the available squad's quality."""

        lineup = self.starting_eleven()
        if not lineup:
            return 0.0
        return sum(p.effective_rating() for p in lineup) / len(lineup)

    def regenerate_between_matches(self, rest_days: int) -> None:
        for p in self.players:
            p.regenerate_between_matches(rest_days)
