"""Bankroll management and risk-assessment tools: Kelly staking, variance,
risk-of-ruin simulation and value-bet detection.
"""
from __future__ import annotations

import random
import statistics
from dataclasses import dataclass, field
from typing import List, Optional, Sequence, Tuple

from football_simulator.gambling.betting_engine import Bet, Selection
from football_simulator.utils.config import GamblingConfig


def kelly_fraction(probability: float, decimal_odds: float) -> float:
    """Full-Kelly optimal stake as a fraction of bankroll.

    f* = (b*p - q) / b, where b = decimal_odds - 1, q = 1 - p.
    Returns 0 if there is no positive edge (never recommends a negative stake).
    """

    if not (0.0 < probability < 1.0):
        raise ValueError("probability must be strictly between 0 and 1")
    if decimal_odds <= 1.0:
        raise ValueError("decimal_odds must be > 1.0")

    b = decimal_odds - 1.0
    q = 1.0 - probability
    f_star = (b * probability - q) / b
    return max(0.0, f_star)


def recommended_stake(
    bankroll: float,
    probability: float,
    decimal_odds: float,
    config: Optional[GamblingConfig] = None,
) -> float:
    """Fractional-Kelly stake in currency units, capped by config's safety limits."""

    cfg = config or GamblingConfig()
    f_full = kelly_fraction(probability, decimal_odds)
    f_applied = min(f_full * cfg.kelly_fraction, cfg.max_stake_fraction_of_bankroll)
    return round(bankroll * f_applied, 2)


def edge(probability: float, decimal_odds: float) -> float:
    """Bettor's edge: true probability minus the odds' implied probability."""

    implied = 1.0 / decimal_odds
    return probability - implied


def is_value_bet(probability: float, decimal_odds: float, config: Optional[GamblingConfig] = None) -> bool:
    cfg = config or GamblingConfig()
    return edge(probability, decimal_odds) >= cfg.min_edge_for_value_bet


def find_value_bets(selections: Sequence[Selection], config: Optional[GamblingConfig] = None) -> List[Selection]:
    """Filter a list of priced selections down to those with a positive,
    sufficiently large edge versus the simulator's true-probability estimate."""

    cfg = config or GamblingConfig()
    value_bets = []
    for s in selections:
        if s.true_probability is None:
            continue
        if is_value_bet(s.true_probability, s.decimal_odds, cfg):
            value_bets.append(s)
    return sorted(value_bets, key=lambda s: edge(s.true_probability, s.decimal_odds), reverse=True)  # type: ignore[arg-type]


@dataclass
class VarianceReport:
    mean_return_per_bet: float
    variance: float
    std_dev: float
    sharpe_like_ratio: float  # mean / std_dev, higher is "smoother" profit


def variance_of_bets(outcomes: Sequence[Tuple[float, float]]) -> VarianceReport:
    """Compute variance/std-dev of returns for a sequence of (probability, decimal_odds) bets.

    Each bet's return distribution is Bernoulli: profit ``b = odds - 1`` with
    probability p, loss of ``-1`` (unit stake) with probability ``1-p``.
    """

    if not outcomes:
        raise ValueError("outcomes must be non-empty")

    per_bet_means = []
    per_bet_variances = []
    for probability, decimal_odds in outcomes:
        b = decimal_odds - 1.0
        mean = probability * b - (1.0 - probability)
        variance = probability * (b - mean) ** 2 + (1.0 - probability) * (-1.0 - mean) ** 2
        per_bet_means.append(mean)
        per_bet_variances.append(variance)

    mean_return = statistics.mean(per_bet_means)
    total_variance = statistics.mean(per_bet_variances)
    std_dev = total_variance ** 0.5
    sharpe = mean_return / std_dev if std_dev > 0 else 0.0
    return VarianceReport(
        mean_return_per_bet=round(mean_return, 5),
        variance=round(total_variance, 5),
        std_dev=round(std_dev, 5),
        sharpe_like_ratio=round(sharpe, 5),
    )


@dataclass
class RiskOfRuinResult:
    trials: int
    ruin_count: int
    ruin_probability: float
    median_final_bankroll: float
    worst_case_bankroll: float
    best_case_bankroll: float


def simulate_risk_of_ruin(
    starting_bankroll: float,
    stake_fraction: float,
    probability: float,
    decimal_odds: float,
    bets_per_run: int = 200,
    trials: int = 2000,
    ruin_threshold_fraction: float = 0.1,
    seed: Optional[int] = None,
) -> RiskOfRuinResult:
    """Monte Carlo estimate of the probability of "ruin" (bankroll falling below
    ``ruin_threshold_fraction`` of the starting bankroll) under fixed-fraction staking.
    """

    rng = random.Random(seed)
    ruin_floor = starting_bankroll * ruin_threshold_fraction
    final_balances: List[float] = []
    ruin_count = 0

    for _ in range(trials):
        bankroll = starting_bankroll
        ruined = False
        for _ in range(bets_per_run):
            if bankroll <= ruin_floor:
                ruined = True
                break
            stake = bankroll * stake_fraction
            if rng.random() < probability:
                bankroll += stake * (decimal_odds - 1.0)
            else:
                bankroll -= stake
        if ruined or bankroll <= ruin_floor:
            ruin_count += 1
        final_balances.append(max(0.0, bankroll))

    final_balances.sort()
    return RiskOfRuinResult(
        trials=trials,
        ruin_count=ruin_count,
        ruin_probability=round(ruin_count / trials, 4),
        median_final_bankroll=round(statistics.median(final_balances), 2),
        worst_case_bankroll=round(final_balances[0], 2),
        best_case_bankroll=round(final_balances[-1], 2),
    )


@dataclass
class BankrollManager:
    """Tracks bankroll over time and reports drawdown / growth metrics."""

    starting_bankroll: float
    history: List[float] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.history:
            self.history.append(self.starting_bankroll)

    @property
    def current_bankroll(self) -> float:
        return self.history[-1]

    def record(self, new_balance: float) -> None:
        self.history.append(new_balance)

    def apply_bet_result(self, bet: Bet) -> None:
        delta = bet.payout - bet.stake if bet.status.value in ("won", "lost") else 0.0
        self.record(round(self.current_bankroll + delta, 2))

    def max_drawdown(self) -> float:
        """Largest peak-to-trough decline, as a fraction of the peak."""

        peak = self.history[0]
        max_dd = 0.0
        for value in self.history:
            peak = max(peak, value)
            if peak > 0:
                drawdown = (peak - value) / peak
                max_dd = max(max_dd, drawdown)
        return round(max_dd, 4)

    def roi(self) -> float:
        if self.starting_bankroll == 0:
            return 0.0
        return round((self.current_bankroll - self.starting_bankroll) / self.starting_bankroll, 4)

    def units_staked_total(self, unit_size: float) -> float:
        return round(self.starting_bankroll / unit_size, 2) if unit_size else 0.0
