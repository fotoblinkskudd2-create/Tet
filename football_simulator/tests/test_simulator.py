import unittest

from football_simulator.core.simulator import MatchEngine, SimulationRunner
from football_simulator.tests.helpers import make_team
from football_simulator.utils.config import SimulationConfig


class TestMatchEngine(unittest.TestCase):
    def setUp(self):
        self.home = make_team("Home FC")
        self.away = make_team("Away FC")
        self.config = SimulationConfig()

    def test_simulate_is_deterministic_given_seed(self):
        engine_a = MatchEngine(self.config, seed=99)
        engine_b = MatchEngine(self.config, seed=99)
        result_a = engine_a.simulate(self.home, self.away)
        result_b = engine_b.simulate(self.home, self.away)
        self.assertEqual(str(result_a.score), str(result_b.score))

    def test_expected_goal_rate_is_clamped(self):
        engine = MatchEngine(self.config)
        self.assertGreaterEqual(engine._expected_goal_rate(200, 10), 0.2)
        self.assertLessEqual(engine._expected_goal_rate(200, 10), 4.5)
        self.assertGreaterEqual(engine._expected_goal_rate(1, 200), 0.2)


class TestSimulationRunner(unittest.TestCase):
    def setUp(self):
        self.home = make_team("Home FC")
        self.away = make_team("Away FC")
        self.config = SimulationConfig(monte_carlo_simulations=40, max_workers=2)
        self.runner = SimulationRunner(self.config)

    def test_run_many_sequential_returns_requested_count(self):
        results = self.runner.run_many(self.home, self.away, n_simulations=20, parallel=False)
        self.assertEqual(len(results), 20)

    def test_run_many_parallel_returns_requested_count(self):
        results = self.runner.run_many(self.home, self.away, n_simulations=20, parallel=True)
        self.assertEqual(len(results), 20)

    def test_aggregate_probabilities_sum_to_one(self):
        results = self.runner.run_many(self.home, self.away, n_simulations=60, parallel=False)
        aggregate = self.runner.aggregate(results, home_team_id=self.home.team_id)
        total = aggregate.home_win_probability + aggregate.draw_probability + aggregate.away_win_probability
        self.assertAlmostEqual(total, 1.0, places=6)

    def test_aggregate_raises_on_empty_results(self):
        with self.assertRaises(ValueError):
            self.runner.aggregate([], home_team_id=self.home.team_id)

    def test_run_many_async_returns_requested_count(self):
        import asyncio

        async def run():
            return await self.runner.run_many_async(self.home, self.away, n_simulations=10)

        results = asyncio.run(run())
        self.assertEqual(len(results), 10)


if __name__ == "__main__":
    unittest.main()
