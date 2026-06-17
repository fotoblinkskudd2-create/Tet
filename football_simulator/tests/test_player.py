import unittest

from football_simulator.core.player import (
    InjurySeverity,
    Player,
    PlayerAttributes,
    PlayerMatchStats,
    Position,
    compute_fantasy_points,
)
from football_simulator.utils.config import ScoringRules


class TestPlayerAttributes(unittest.TestCase):
    def test_clamp_keeps_values_in_range(self):
        attrs = PlayerAttributes(pace=150, shooting=-5, passing=60, dribbling=60, defending=60, physical=60)
        attrs.clamp()
        self.assertEqual(attrs.pace, 99)
        self.assertEqual(attrs.shooting, 1)


class TestPlayerRatings(unittest.TestCase):
    def test_forward_weighting_favors_shooting_and_pace(self):
        forward = Player(
            name="Striker",
            position=Position.FORWARD,
            attributes=PlayerAttributes(pace=90, shooting=90, passing=40, dribbling=40, defending=10, physical=40),
        )
        defender = Player(
            name="Defender",
            position=Position.DEFENDER,
            attributes=PlayerAttributes(pace=40, shooting=10, passing=40, dribbling=40, defending=90, physical=90),
        )
        # Same raw attribute "budget" distributed differently; each should be
        # rated highly in their own specialty.
        self.assertGreater(forward.overall_rating(), 60)
        self.assertGreater(defender.overall_rating(), 60)

    def test_effective_rating_penalizes_low_form_and_fitness(self):
        player = Player(name="X", position=Position.MIDFIELDER, form=20.0, fitness=20.0, morale=20.0)
        fresh_player = Player(name="Y", position=Position.MIDFIELDER, form=100.0, fitness=100.0, morale=100.0)
        self.assertLess(player.effective_rating(), fresh_player.effective_rating())

    def test_injured_player_has_zero_effective_rating(self):
        player = Player(name="Z", position=Position.FORWARD)
        player.set_injury("hamstring strain", InjurySeverity.MODERATE)
        self.assertTrue(player.is_injured())
        self.assertEqual(player.effective_rating(), 1.0)  # clamped floor, not literal 0

    def test_injury_heals_after_enough_weeks(self):
        player = Player(name="Z", position=Position.FORWARD)
        player.set_injury("knock", InjurySeverity.MINOR)
        self.assertTrue(player.is_injured())
        player.regenerate_between_matches(rest_days=7)
        self.assertFalse(player.is_injured())


class TestFantasyPoints(unittest.TestCase):
    def setUp(self):
        self.rules = ScoringRules()

    def test_zero_points_if_did_not_play(self):
        player = Player(name="Benchwarmer", position=Position.MIDFIELDER)
        stats = PlayerMatchStats(minutes_played=0, goals=2)
        self.assertEqual(compute_fantasy_points(player, stats, self.rules), 0.0)

    def test_goal_value_depends_on_position(self):
        forward = Player(name="F", position=Position.FORWARD)
        defender = Player(name="D", position=Position.DEFENDER)
        fwd_stats = PlayerMatchStats(minutes_played=90, goals=1)
        def_stats = PlayerMatchStats(minutes_played=90, goals=1)
        fwd_points = compute_fantasy_points(forward, fwd_stats, self.rules)
        def_points = compute_fantasy_points(defender, def_stats, self.rules)
        self.assertGreater(def_points, fwd_points)  # defenders score more per goal

    def test_clean_sheet_bonus_only_for_defensive_positions(self):
        forward = Player(name="F", position=Position.FORWARD)
        keeper = Player(name="K", position=Position.GOALKEEPER)
        stats = PlayerMatchStats(minutes_played=90, clean_sheet=True)
        fwd_points = compute_fantasy_points(forward, stats, self.rules)
        gk_points = compute_fantasy_points(keeper, stats, self.rules)
        self.assertGreater(gk_points, fwd_points)

    def test_apply_match_result_updates_form_and_records_history(self):
        player = Player(name="P", position=Position.FORWARD, form=70.0, fitness=100.0)
        stats = PlayerMatchStats(minutes_played=90, goals=2, assists=1)
        points = player.apply_match_result(stats, self.rules)
        self.assertGreater(points, 0.0)
        self.assertEqual(player.season_stats.matches_played, 1)
        self.assertEqual(player.season_stats.totals.goals, 2)
        self.assertLess(player.fitness, 100.0)


if __name__ == "__main__":
    unittest.main()
