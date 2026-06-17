import unittest

from football_simulator.components.analytics import TrendAnalyzer, compute_performance_index
from football_simulator.core.player import PlayerMatchStats
from football_simulator.tests.helpers import make_team


class TestPerformanceIndex(unittest.TestCase):
    def test_zero_minutes_gives_zero_index(self):
        team = make_team()
        player = team.players[0]
        stats = PlayerMatchStats(minutes_played=0)
        index = compute_performance_index(player, stats)
        self.assertEqual(index.value, 0.0)

    def test_goals_and_assists_increase_index(self):
        team = make_team()
        player = team.players[-1]  # a forward
        baseline = PlayerMatchStats(minutes_played=90)
        productive = PlayerMatchStats(minutes_played=90, goals=2, assists=1)
        baseline_index = compute_performance_index(player, baseline)
        productive_index = compute_performance_index(player, productive)
        self.assertGreater(productive_index.value, baseline_index.value)


class TestTrendAnalyzer(unittest.TestCase):
    def test_moving_average_length_matches_series(self):
        series = [1, 2, 3, 4, 5]
        averages = TrendAnalyzer.moving_average(series, window=2)
        self.assertEqual(len(averages), len(series))

    def test_linear_slope_positive_for_increasing_series(self):
        series = [1, 2, 3, 4, 5]
        self.assertGreater(TrendAnalyzer.linear_slope(series), 0)

    def test_linear_slope_negative_for_decreasing_series(self):
        series = [5, 4, 3, 2, 1]
        self.assertLess(TrendAnalyzer.linear_slope(series), 0)

    def test_analyze_direction_labels(self):
        up = TrendAnalyzer.analyze([1, 2, 3, 4, 5, 6])
        down = TrendAnalyzer.analyze([6, 5, 4, 3, 2, 1])
        flat = TrendAnalyzer.analyze([3, 3, 3, 3, 3])
        self.assertEqual(up.direction, "up")
        self.assertEqual(down.direction, "down")
        self.assertEqual(flat.direction, "flat")

    def test_analyze_raises_on_empty_series(self):
        with self.assertRaises(ValueError):
            TrendAnalyzer.analyze([])


if __name__ == "__main__":
    unittest.main()
