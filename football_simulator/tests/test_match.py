import unittest

from football_simulator.core.match import Match
from football_simulator.tests.helpers import make_team
from football_simulator.utils.config import SimulationConfig


class TestMatch(unittest.TestCase):
    def setUp(self):
        self.home = make_team("Home FC")
        self.away = make_team("Away FC")
        self.config = SimulationConfig(monte_carlo_simulations=10)

    def test_run_produces_consistent_result_for_same_seed(self):
        match_a = Match(home_team=self.home, away_team=self.away, config=self.config, seed=123)
        match_b = Match(home_team=self.home, away_team=self.away, config=self.config, seed=123)
        result_a = match_a.run()
        result_b = match_b.run()
        self.assertEqual(str(result_a.score), str(result_b.score))
        self.assertEqual(len(result_a.events), len(result_b.events))

    def test_different_seeds_can_produce_different_results(self):
        seeds_scores = set()
        for seed in range(10):
            match = Match(home_team=self.home, away_team=self.away, config=self.config, seed=seed)
            result = match.run()
            seeds_scores.add(str(result.score))
        self.assertGreater(len(seeds_scores), 1)

    def test_player_stats_present_for_every_lineup_player(self):
        match = Match(home_team=self.home, away_team=self.away, config=self.config, seed=5)
        result = match.run()
        lineup_ids = {p.player_id for p in self.home.starting_eleven()} | {
            p.player_id for p in self.away.starting_eleven()
        }
        self.assertTrue(lineup_ids.issubset(result.player_stats.keys()))

    def test_outcome_for_and_winner_team_id_consistent(self):
        match = Match(home_team=self.home, away_team=self.away, config=self.config, seed=5)
        result = match.run()
        if result.score.home > result.score.away:
            self.assertEqual(result.winner_team_id(), self.home.team_id)
            self.assertEqual(result.outcome_for(self.home.team_id), "win")
            self.assertEqual(result.outcome_for(self.away.team_id), "loss")
        elif result.score.home < result.score.away:
            self.assertEqual(result.winner_team_id(), self.away.team_id)
        else:
            self.assertIsNone(result.winner_team_id())
            self.assertEqual(result.outcome_for(self.home.team_id), "draw")


if __name__ == "__main__":
    unittest.main()
