"""Odds pricing engine: probability <-> odds conversions and betting markets.

Probabilities normally come from ``core.simulator.SimulationRunner.aggregate``
(Monte Carlo simulation results), which this module turns into bookmaker-style
markets with a configurable overround (margin).
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Dict, List, Optional

from football_simulator.core.match import MatchResult
from football_simulator.core.player import Player, Position
from football_simulator.core.simulator import AggregateProbabilities
from football_simulator.utils.config import GamblingConfig

# ---------------------------------------------------------------------------
# Probability <-> odds conversions
# ---------------------------------------------------------------------------


def decimal_odds_from_probability(probability: float) -> float:
    """Fair (no-margin) decimal odds implied by a probability."""

    if probability <= 0:
        raise ValueError("probability must be > 0 to produce finite odds")
    return 1.0 / probability


def probability_from_decimal_odds(decimal_odds: float) -> float:
    if decimal_odds <= 1.0:
        raise ValueError("decimal_odds must be > 1.0")
    return 1.0 / decimal_odds


def decimal_to_american(decimal_odds: float) -> int:
    if decimal_odds <= 1.0:
        raise ValueError("decimal_odds must be > 1.0")
    if decimal_odds >= 2.0:
        return round((decimal_odds - 1) * 100)
    return round(-100 / (decimal_odds - 1))


def american_to_decimal(american_odds: int) -> float:
    if american_odds == 0:
        raise ValueError("american_odds cannot be 0")
    if american_odds > 0:
        return 1.0 + american_odds / 100.0
    return 1.0 - 100.0 / american_odds


def decimal_to_fractional(decimal_odds: float, max_denominator: int = 100) -> str:
    fraction = Fraction(decimal_odds - 1).limit_denominator(max_denominator)
    return f"{fraction.numerator}/{fraction.denominator}"


def fractional_to_decimal(numerator: int, denominator: int) -> float:
    if denominator == 0:
        raise ValueError("denominator cannot be 0")
    return 1.0 + numerator / denominator


def apply_overround(probabilities: Dict[str, float], margin: float) -> Dict[str, float]:
    """Scale a set of mutually exclusive fair probabilities to include a bookmaker margin.

    The result no longer sums to 1.0; it sums to ``1 + margin``, matching how
    real sportsbooks price a market (the "vig").
    """

    total = sum(probabilities.values())
    if total <= 0:
        raise ValueError("probabilities must sum to a positive value")
    return {k: (v / total) * (1.0 + margin) for k, v in probabilities.items()}


def market_odds(probabilities: Dict[str, float], margin: float) -> Dict[str, float]:
    """Decimal odds for each outcome in a market, after applying the margin."""

    inflated = apply_overround(probabilities, margin)
    return {k: round(1.0 / v, 3) for k, v in inflated.items()}


def overround_of(decimal_odds: Dict[str, float]) -> float:
    """Recover the margin embedded in a set of published decimal odds."""

    return sum(1.0 / o for o in decimal_odds.values()) - 1.0


# ---------------------------------------------------------------------------
# Poisson helpers (no scipy/numpy dependency)
# ---------------------------------------------------------------------------


def poisson_pmf(k: int, lam: float) -> float:
    if lam < 0:
        raise ValueError("lam must be >= 0")
    return math.exp(-lam) * (lam ** k) / math.factorial(k)


def poisson_cdf(k: int, lam: float) -> float:
    return sum(poisson_pmf(i, lam) for i in range(0, k + 1))


def poisson_over_probability(line: float, lam: float) -> float:
    """P(X > line) for integer-valued X ~ Poisson(lam); line is typically X.5."""

    threshold = math.floor(line)
    return 1.0 - poisson_cdf(threshold, lam)


# ---------------------------------------------------------------------------
# Markets
# ---------------------------------------------------------------------------


@dataclass
class Market:
    name: str
    fair_probabilities: Dict[str, float]
    decimal_odds: Dict[str, float] = field(default_factory=dict)

    def price(self, margin: float) -> "Market":
        self.decimal_odds = market_odds(self.fair_probabilities, margin)
        return self


class OddsCalculator:
    """Builds priced betting markets from simulated match probabilities."""

    def __init__(self, config: Optional[GamblingConfig] = None):
        self.config = config or GamblingConfig()

    # -- Match outcome (1X2) -------------------------------------------------
    def match_outcome_market(self, aggregate: AggregateProbabilities) -> Market:
        probabilities = {
            "home": aggregate.home_win_probability,
            "draw": aggregate.draw_probability,
            "away": aggregate.away_win_probability,
        }
        return Market(name="Match Outcome (1X2)", fair_probabilities=probabilities).price(
            self.config.bookmaker_margin
        )

    # -- Over/Under total goals ----------------------------------------------
    def over_under_market(self, expected_total_goals: float, line: float = 2.5) -> Market:
        over_p = poisson_over_probability(line, expected_total_goals)
        under_p = 1.0 - over_p
        probabilities = {f"over_{line}": over_p, f"under_{line}": under_p}
        return Market(name=f"Total Goals O/U {line}", fair_probabilities=probabilities).price(
            self.config.bookmaker_margin
        )

    # -- Both teams to score ---------------------------------------------------
    def btts_market(self, aggregate: AggregateProbabilities) -> Market:
        probabilities = {
            "yes": aggregate.both_teams_scored_probability,
            "no": 1.0 - aggregate.both_teams_scored_probability,
        }
        return Market(name="Both Teams To Score", fair_probabilities=probabilities).price(
            self.config.bookmaker_margin
        )

    # -- Correct score ----------------------------------------------------------
    def correct_score_market(self, aggregate: AggregateProbabilities, top_n: int = 8) -> Market:
        sorted_scores = sorted(aggregate.score_distribution.items(), key=lambda kv: kv[1], reverse=True)
        top_scores = dict(sorted_scores[:top_n])
        return Market(name="Correct Score", fair_probabilities=top_scores).price(
            self.config.bookmaker_margin
        )

    # -- Player props: anytime goal scorer --------------------------------------
    def anytime_scorer_probability(self, player: Player, team_expected_goals: float, lineup: List[Player]) -> float:
        """Estimate P(player scores >= 1) via a Poisson share-of-team-xG model."""

        weights = {
            Position.FORWARD: 3.0,
            Position.MIDFIELDER: 1.4,
            Position.DEFENDER: 0.35,
            Position.GOALKEEPER: 0.02,
        }
        outfield = [p for p in lineup if p.position != Position.GOALKEEPER]
        total_weight = sum(weights[p.position] * max(1.0, p.attributes.shooting) for p in outfield) or 1.0
        player_weight = weights[player.position] * max(1.0, player.attributes.shooting)
        player_share = player_weight / total_weight
        player_lambda = team_expected_goals * player_share
        return 1.0 - poisson_pmf(0, player_lambda)

    def anytime_scorer_market(
        self, lineup: List[Player], team_expected_goals: float, top_n: int = 6
    ) -> Market:
        probabilities = {
            p.name: self.anytime_scorer_probability(p, team_expected_goals, lineup)
            for p in lineup
            if p.position != Position.GOALKEEPER
        }
        # Anytime-scorer markets are independent (not mutually exclusive), so we
        # price each selection off its own probability rather than normalizing
        # the whole set to 1.0.
        top_selections = dict(sorted(probabilities.items(), key=lambda kv: kv[1], reverse=True)[:top_n])
        odds = {name: round(1.0 / (p * (1.0 + self.config.bookmaker_margin)), 3) for name, p in top_selections.items()}
        market = Market(name="Anytime Goalscorer", fair_probabilities=top_selections)
        market.decimal_odds = odds
        return market
