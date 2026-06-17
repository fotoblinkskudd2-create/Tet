"""Shared fixtures for the test suite."""
from football_simulator.core.player import Player, PlayerAttributes, Position
from football_simulator.core.team import Formation, Team


def make_squad():
    players = [Player(name="GK1", position=Position.GOALKEEPER, attributes=PlayerAttributes(goalkeeping=80))]
    for i in range(6):
        players.append(Player(name=f"DF{i}", position=Position.DEFENDER, attributes=PlayerAttributes(defending=70)))
    for i in range(6):
        players.append(Player(name=f"MF{i}", position=Position.MIDFIELDER, attributes=PlayerAttributes(passing=70, shooting=60)))
    for i in range(4):
        players.append(Player(name=f"FW{i}", position=Position.FORWARD, attributes=PlayerAttributes(shooting=75, pace=75)))
    return players


def make_team(name="Test FC", formation=Formation.F_4_3_3):
    return Team(name=name, players=make_squad(), formation=formation)
