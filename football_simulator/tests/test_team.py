import unittest

from football_simulator.core.player import InjurySeverity, Player, PlayerAttributes, Position
from football_simulator.core.team import Formation, TacticalStyle, Team


def make_squad():
    players = [Player(name="GK1", position=Position.GOALKEEPER, attributes=PlayerAttributes(goalkeeping=80))]
    for i in range(6):
        players.append(Player(name=f"DF{i}", position=Position.DEFENDER, attributes=PlayerAttributes(defending=70)))
    for i in range(6):
        players.append(Player(name=f"MF{i}", position=Position.MIDFIELDER, attributes=PlayerAttributes(passing=70)))
    for i in range(4):
        players.append(Player(name=f"FW{i}", position=Position.FORWARD, attributes=PlayerAttributes(shooting=70)))
    return players


class TestTeamSelection(unittest.TestCase):
    def test_starting_eleven_matches_formation_slots(self):
        team = Team(name="Test FC", players=make_squad(), formation=Formation.F_4_3_3)
        lineup = team.starting_eleven()
        self.assertEqual(len(lineup), 11)
        positions = [p.position for p in lineup]
        self.assertEqual(positions.count(Position.GOALKEEPER), 1)
        self.assertEqual(positions.count(Position.DEFENDER), 4)
        self.assertEqual(positions.count(Position.MIDFIELDER), 3)
        self.assertEqual(positions.count(Position.FORWARD), 3)

    def test_starting_eleven_excludes_injured_players(self):
        squad = make_squad()
        squad[1].set_injury("twisted ankle", InjurySeverity.SEVERE)
        team = Team(name="Test FC", players=squad, formation=Formation.F_4_3_3)
        lineup = team.starting_eleven()
        self.assertNotIn(squad[1], lineup)

    def test_starting_eleven_handles_thin_squad_gracefully(self):
        thin_squad = [Player(name="GK", position=Position.GOALKEEPER)] + [
            Player(name=f"MF{i}", position=Position.MIDFIELDER) for i in range(6)
        ]
        team = Team(name="Thin FC", players=thin_squad, formation=Formation.F_4_3_3)
        lineup = team.starting_eleven()
        self.assertLessEqual(len(lineup), 7)
        self.assertGreater(len(lineup), 0)


class TestTeamStrength(unittest.TestCase):
    def test_attacking_style_boosts_attack_over_defense(self):
        squad = make_squad()
        attacking_team = Team(name="A", players=squad, tactical_style=TacticalStyle.ATTACKING)
        defensive_team = Team(name="D", players=squad, tactical_style=TacticalStyle.DEFENSIVE)
        lineup = attacking_team.starting_eleven()
        self.assertGreater(attacking_team.attack_strength(lineup), defensive_team.attack_strength(lineup))
        self.assertLess(attacking_team.defense_strength(lineup), defensive_team.defense_strength(lineup))

    def test_squad_rating_is_positive_for_valid_squad(self):
        team = Team(name="Test FC", players=make_squad())
        self.assertGreater(team.squad_rating(), 0.0)

    def test_squad_rating_zero_for_empty_squad(self):
        team = Team(name="Empty FC", players=[])
        self.assertEqual(team.squad_rating(), 0.0)


if __name__ == "__main__":
    unittest.main()
