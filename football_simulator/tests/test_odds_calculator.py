import unittest

from football_simulator.core.simulator import AggregateProbabilities
from football_simulator.gambling.odds_calculator import (
    OddsCalculator,
    american_to_decimal,
    apply_overround,
    decimal_odds_from_probability,
    decimal_to_american,
    decimal_to_fractional,
    fractional_to_decimal,
    market_odds,
    overround_of,
    poisson_cdf,
    poisson_over_probability,
    poisson_pmf,
    probability_from_decimal_odds,
)
from football_simulator.utils.config import GamblingConfig


class TestOddsConversions(unittest.TestCase):
    def test_probability_decimal_roundtrip(self):
        probability = 0.4
        odds = decimal_odds_from_probability(probability)
        self.assertAlmostEqual(probability_from_decimal_odds(odds), probability, places=9)

    def test_decimal_american_roundtrip_favorite_and_underdog(self):
        for decimal_odds in (1.5, 2.0, 3.5, 10.0):
            american = decimal_to_american(decimal_odds)
            back_to_decimal = american_to_decimal(american)
            self.assertAlmostEqual(back_to_decimal, decimal_odds, delta=0.02)

    def test_decimal_fractional_roundtrip(self):
        decimal_odds = 3.0  # exactly 2/1
        fractional = decimal_to_fractional(decimal_odds)
        numerator, denominator = (int(x) for x in fractional.split("/"))
        self.assertAlmostEqual(fractional_to_decimal(numerator, denominator), decimal_odds, places=6)

    def test_invalid_probability_raises(self):
        with self.assertRaises(ValueError):
            decimal_odds_from_probability(0.0)


class TestOverround(unittest.TestCase):
    def test_apply_overround_sums_to_one_plus_margin(self):
        probabilities = {"home": 0.5, "draw": 0.3, "away": 0.2}
        inflated = apply_overround(probabilities, margin=0.06)
        self.assertAlmostEqual(sum(inflated.values()), 1.06, places=6)

    def test_market_odds_overround_recoverable(self):
        probabilities = {"home": 0.5, "draw": 0.3, "away": 0.2}
        odds = market_odds(probabilities, margin=0.08)
        self.assertAlmostEqual(overround_of(odds), 0.08, delta=0.005)


class TestPoissonHelpers(unittest.TestCase):
    def test_pmf_sums_close_to_one_over_wide_range(self):
        lam = 1.5
        total = sum(poisson_pmf(k, lam) for k in range(0, 30))
        self.assertAlmostEqual(total, 1.0, places=6)

    def test_cdf_matches_cumulative_pmf(self):
        lam = 2.0
        manual = sum(poisson_pmf(k, lam) for k in range(0, 4))
        self.assertAlmostEqual(poisson_cdf(3, lam), manual, places=9)

    def test_over_probability_decreases_as_line_increases(self):
        lam = 2.5
        p_over_1_5 = poisson_over_probability(1.5, lam)
        p_over_3_5 = poisson_over_probability(3.5, lam)
        self.assertGreater(p_over_1_5, p_over_3_5)


class TestMarkets(unittest.TestCase):
    def setUp(self):
        self.calc = OddsCalculator(GamblingConfig(bookmaker_margin=0.05))
        self.aggregate = AggregateProbabilities(
            simulations=1000,
            home_win_probability=0.45,
            draw_probability=0.27,
            away_win_probability=0.28,
            avg_home_goals=1.6,
            avg_away_goals=1.2,
            both_teams_scored_probability=0.52,
            score_distribution={"1-0": 0.12, "1-1": 0.1},
            total_goals_over_2_5_probability=0.5,
        )

    def test_match_outcome_market_has_positive_overround(self):
        market = self.calc.match_outcome_market(self.aggregate)
        self.assertAlmostEqual(overround_of(market.decimal_odds), 0.05, delta=0.005)

    def test_btts_market_odds_keys(self):
        market = self.calc.btts_market(self.aggregate)
        self.assertEqual(set(market.decimal_odds.keys()), {"yes", "no"})

    def test_over_under_market_respects_custom_line(self):
        market = self.calc.over_under_market(2.8, line=3.5)
        self.assertIn("over_3.5", market.decimal_odds)
        self.assertIn("under_3.5", market.decimal_odds)


if __name__ == "__main__":
    unittest.main()
