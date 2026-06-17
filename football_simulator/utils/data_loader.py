"""Serialization: load teams/players from JSON, and save/load simulation results."""
from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List

from football_simulator.core.match import MatchResult, Score
from football_simulator.core.player import Player, PlayerAttributes, Position
from football_simulator.core.team import Formation, TacticalStyle, Team


def load_teams_from_json(path: str) -> List[Team]:
    """Load a list of teams (with their squads) from a JSON file.

    Expected schema::

        [
          {
            "name": "...",
            "formation": "4-3-3",
            "tactical_style": "balanced",
            "home_stadium": "...",
            "players": [
              {"name": "...", "position": "FW", "age": 24,
               "attributes": {"pace": 80, "shooting": 84, ...}},
              ...
            ]
          },
          ...
        ]
    """

    with Path(path).open("r", encoding="utf-8") as fh:
        raw = json.load(fh)

    teams: List[Team] = []
    for team_data in raw:
        players = []
        for player_data in team_data.get("players", []):
            attrs = PlayerAttributes(**player_data.get("attributes", {}))
            players.append(
                Player(
                    name=player_data["name"],
                    position=Position(player_data["position"]),
                    attributes=attrs,
                    age=player_data.get("age", 25),
                    nationality=player_data.get("nationality", ""),
                    form=player_data.get("form", 70.0),
                    fitness=player_data.get("fitness", 100.0),
                    morale=player_data.get("morale", 75.0),
                    experience=player_data.get("experience", 0),
                )
            )
        teams.append(
            Team(
                name=team_data["name"],
                players=players,
                formation=Formation(team_data.get("formation", "4-3-3")),
                tactical_style=TacticalStyle(team_data.get("tactical_style", "balanced")),
                home_stadium=team_data.get("home_stadium", ""),
            )
        )
    return teams


def _match_result_to_dict(result: MatchResult) -> Dict[str, Any]:
    data = asdict(result)
    return data


def save_simulation_results(results: List[MatchResult], path: str) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    payload = [_match_result_to_dict(r) for r in results]
    with target.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)


def load_simulation_results(path: str) -> List[Dict[str, Any]]:
    """Load raw simulation result dicts back from disk.

    Returned as plain dicts (not reconstructed ``MatchResult`` objects) since
    results are typically consumed for reporting/analysis rather than
    re-entering the simulation pipeline.
    """

    with Path(path).open("r", encoding="utf-8") as fh:
        return json.load(fh)
