import unittest

from football_simulator.gambling.betting_engine import BettingEngine, BetStatus, Selection


class TestBet(unittest.TestCase):
    def test_potential_payout_and_profit(self):
        engine = BettingEngine(starting_bankroll=100.0)
        bet = engine.place_bet(Selection("1X2", "home", 2.5, 0.4), stake=20.0)
        self.assertEqual(bet.potential_payout, 50.0)
        self.assertEqual(bet.potential_profit, 30.0)

    def test_expected_value_and_edge(self):
        engine = BettingEngine(starting_bankroll=100.0)
        bet = engine.place_bet(Selection("1X2", "home", 2.5, 0.5), stake=10.0)
        # EV = stake * (p*odds - 1) = 10 * (0.5*2.5 - 1) = 2.5
        self.assertAlmostEqual(bet.expected_value(), 2.5, places=6)
        # edge = true_prob - implied_prob = 0.5 - 0.4 = 0.1
        self.assertAlmostEqual(bet.edge(), 0.1, places=6)

    def test_expected_value_none_without_true_probability(self):
        engine = BettingEngine(starting_bankroll=100.0)
        bet = engine.place_bet(Selection("1X2", "home", 2.5, None), stake=10.0)
        self.assertIsNone(bet.expected_value())
        self.assertIsNone(bet.edge())


class TestBettingEngine(unittest.TestCase):
    def test_place_bet_reduces_bankroll(self):
        engine = BettingEngine(starting_bankroll=100.0)
        engine.place_bet(Selection("1X2", "home", 2.0, 0.5), stake=30.0)
        self.assertEqual(engine.bankroll, 70.0)

    def test_place_bet_raises_when_stake_exceeds_bankroll(self):
        engine = BettingEngine(starting_bankroll=50.0)
        with self.assertRaises(ValueError):
            engine.place_bet(Selection("1X2", "home", 2.0, 0.5), stake=100.0)

    def test_settle_bet_won_credits_payout(self):
        engine = BettingEngine(starting_bankroll=100.0)
        bet = engine.place_bet(Selection("1X2", "home", 2.0, 0.5), stake=20.0)
        engine.settle_bet(bet, won=True)
        self.assertEqual(bet.status, BetStatus.WON)
        self.assertEqual(engine.bankroll, 100.0 - 20.0 + 40.0)

    def test_settle_bet_lost_credits_nothing(self):
        engine = BettingEngine(starting_bankroll=100.0)
        bet = engine.place_bet(Selection("1X2", "home", 2.0, 0.5), stake=20.0)
        engine.settle_bet(bet, won=False)
        self.assertEqual(bet.status, BetStatus.LOST)
        self.assertEqual(engine.bankroll, 80.0)

    def test_net_profit_tracks_settled_bets(self):
        engine = BettingEngine(starting_bankroll=100.0)
        won_bet = engine.place_bet(Selection("1X2", "home", 2.0, 0.5), stake=10.0)
        lost_bet = engine.place_bet(Selection("1X2", "away", 2.0, 0.3), stake=10.0)
        engine.settle_bet(won_bet, won=True)
        engine.settle_bet(lost_bet, won=False)
        self.assertEqual(engine.net_profit(), 0.0)  # +10 won, -10 lost


class TestAccumulator(unittest.TestCase):
    def test_combined_odds_is_product_of_legs(self):
        engine = BettingEngine(starting_bankroll=100.0)
        slip = engine.place_accumulator(
            [Selection("A", "x", 2.0, 0.5), Selection("B", "y", 1.5, 0.6)], stake=10.0
        )
        self.assertAlmostEqual(slip.combined_odds, 3.0, places=6)
        self.assertAlmostEqual(slip.potential_payout, 30.0, places=6)

    def test_combined_true_probability_is_joint_probability(self):
        engine = BettingEngine(starting_bankroll=100.0)
        slip = engine.place_accumulator(
            [Selection("A", "x", 2.0, 0.5), Selection("B", "y", 1.5, 0.4)], stake=10.0
        )
        self.assertAlmostEqual(slip.combined_true_probability(), 0.2, places=6)

    def test_settle_accumulator_requires_all_legs_to_win(self):
        engine = BettingEngine(starting_bankroll=100.0)
        slip = engine.place_accumulator(
            [Selection("A", "x", 2.0, 0.5), Selection("B", "y", 1.5, 0.4)], stake=10.0
        )
        engine.settle_accumulator(slip, leg_results=[True, False])
        self.assertEqual(slip.status, BetStatus.LOST)

    def test_settle_accumulator_wrong_leg_count_raises(self):
        engine = BettingEngine(starting_bankroll=100.0)
        slip = engine.place_accumulator([Selection("A", "x", 2.0, 0.5)], stake=10.0)
        with self.assertRaises(ValueError):
            engine.settle_accumulator(slip, leg_results=[True, True])


if __name__ == "__main__":
    unittest.main()
