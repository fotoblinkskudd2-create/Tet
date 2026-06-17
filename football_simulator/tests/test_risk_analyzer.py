import unittest

from football_simulator.gambling.betting_engine import Bet, BetStatus, Selection
from football_simulator.gambling.risk_analyzer import (
    BankrollManager,
    edge,
    find_value_bets,
    is_value_bet,
    kelly_fraction,
    recommended_stake,
    simulate_risk_of_ruin,
    variance_of_bets,
)
from football_simulator.utils.config import GamblingConfig


class TestKellyCriterion(unittest.TestCase):
    def test_known_kelly_value(self):
        # f* = (b*p - q) / b ; b=1, p=0.6, q=0.4 -> f* = 0.2
        self.assertAlmostEqual(kelly_fraction(0.6, 2.0), 0.2, places=6)

    def test_negative_edge_returns_zero(self):
        self.assertEqual(kelly_fraction(0.3, 2.0), 0.0)

    def test_invalid_probability_raises(self):
        with self.assertRaises(ValueError):
            kelly_fraction(0.0, 2.0)
        with self.assertRaises(ValueError):
            kelly_fraction(1.0, 2.0)

    def test_recommended_stake_respects_max_fraction_cap(self):
        config = GamblingConfig(kelly_fraction=1.0, max_stake_fraction_of_bankroll=0.05)
        # Strong edge would normally suggest a large Kelly stake; the cap should bind.
        stake = recommended_stake(bankroll=1000.0, probability=0.9, decimal_odds=3.0, config=config)
        self.assertLessEqual(stake, 1000.0 * 0.05 + 1e-6)


class TestEdgeAndValueBets(unittest.TestCase):
    def test_edge_positive_when_true_probability_exceeds_implied(self):
        self.assertGreater(edge(0.5, 2.5), 0.0)  # implied = 0.4

    def test_is_value_bet_threshold(self):
        config = GamblingConfig(min_edge_for_value_bet=0.05)
        self.assertTrue(is_value_bet(0.5, 2.5, config))  # edge = 0.1
        self.assertFalse(is_value_bet(0.42, 2.5, config))  # edge = 0.02

    def test_find_value_bets_filters_and_sorts_by_edge(self):
        selections = [
            Selection("A", "x", 2.5, 0.42),  # edge 0.02, below default threshold (0.02 -> borderline excluded)
            Selection("B", "y", 2.0, 0.6),   # implied 0.5, edge 0.1
            Selection("C", "z", 3.0, 0.2),   # implied 0.333, negative edge
        ]
        config = GamblingConfig(min_edge_for_value_bet=0.05)
        result = find_value_bets(selections, config)
        self.assertEqual([s.selection for s in result], ["y"])

    def test_find_value_bets_skips_unknown_probability(self):
        selections = [Selection("A", "x", 2.0, None)]
        self.assertEqual(find_value_bets(selections), [])


class TestVariance(unittest.TestCase):
    def test_variance_is_nonnegative(self):
        report = variance_of_bets([(0.5, 2.0), (0.4, 2.5), (0.6, 1.8)])
        self.assertGreaterEqual(report.variance, 0.0)
        self.assertGreaterEqual(report.std_dev, 0.0)

    def test_raises_on_empty_input(self):
        with self.assertRaises(ValueError):
            variance_of_bets([])


class TestRiskOfRuin(unittest.TestCase):
    def test_ruin_probability_within_bounds(self):
        result = simulate_risk_of_ruin(
            starting_bankroll=1000.0,
            stake_fraction=0.05,
            probability=0.55,
            decimal_odds=2.0,
            bets_per_run=50,
            trials=200,
            seed=1,
        )
        self.assertGreaterEqual(result.ruin_probability, 0.0)
        self.assertLessEqual(result.ruin_probability, 1.0)

    def test_higher_edge_reduces_ruin_probability(self):
        bad_edge = simulate_risk_of_ruin(1000.0, 0.1, 0.45, 2.0, bets_per_run=80, trials=300, seed=3)
        good_edge = simulate_risk_of_ruin(1000.0, 0.1, 0.65, 2.0, bets_per_run=80, trials=300, seed=3)
        self.assertGreaterEqual(bad_edge.ruin_probability, good_edge.ruin_probability)


class TestBankrollManager(unittest.TestCase):
    def test_max_drawdown_tracks_peak_to_trough(self):
        manager = BankrollManager(starting_bankroll=100.0)
        for value in (120.0, 80.0, 90.0):
            manager.record(value)
        self.assertAlmostEqual(manager.max_drawdown(), (120.0 - 80.0) / 120.0, places=4)

    def test_roi_reflects_net_change(self):
        manager = BankrollManager(starting_bankroll=100.0)
        manager.record(150.0)
        self.assertAlmostEqual(manager.roi(), 0.5, places=6)

    def test_apply_bet_result_updates_history(self):
        manager = BankrollManager(starting_bankroll=100.0)
        bet = Bet(selection=Selection("A", "x", 2.0, 0.5), stake=10.0, status=BetStatus.WON, payout=20.0)
        manager.apply_bet_result(bet)
        self.assertEqual(manager.current_bankroll, 110.0)


if __name__ == "__main__":
    unittest.main()
