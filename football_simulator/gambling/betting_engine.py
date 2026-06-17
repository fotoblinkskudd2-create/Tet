"""Bet placement, settlement and accumulator/parlay handling."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Sequence


class BetStatus(str, Enum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"
    VOID = "void"
    CASHED_OUT = "cashed_out"


@dataclass
class Selection:
    """One leg of a bet: a market and the chosen outcome, priced at given odds."""

    market_name: str
    selection: str
    decimal_odds: float
    true_probability: Optional[float] = None  # the simulator's estimate, if known


@dataclass
class Bet:
    """A single (non-combined) bet."""

    selection: Selection
    stake: float
    bet_id: str = field(default_factory=lambda: f"BET-{uuid.uuid4().hex[:10]}")
    status: BetStatus = BetStatus.PENDING
    payout: float = 0.0

    @property
    def potential_payout(self) -> float:
        return round(self.stake * self.selection.decimal_odds, 2)

    @property
    def potential_profit(self) -> float:
        return round(self.potential_payout - self.stake, 2)

    def expected_value(self) -> Optional[float]:
        """EV = stake * (true_probability * decimal_odds - 1). None if probability unknown."""

        if self.selection.true_probability is None:
            return None
        p = self.selection.true_probability
        return round(self.stake * (p * self.selection.decimal_odds - 1.0), 4)

    def edge(self) -> Optional[float]:
        """Bettor's edge over the implied probability of the offered odds."""

        if self.selection.true_probability is None:
            return None
        implied = 1.0 / self.selection.decimal_odds
        return round(self.selection.true_probability - implied, 4)


@dataclass
class BettingSlip:
    """An accumulator/parlay: multiple selections combined into one bet."""

    selections: List[Selection]
    stake: float
    slip_id: str = field(default_factory=lambda: f"SLIP-{uuid.uuid4().hex[:10]}")
    status: BetStatus = BetStatus.PENDING
    leg_results: List[Optional[bool]] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.selections:
            raise ValueError("A betting slip needs at least one selection.")
        if not self.leg_results:
            self.leg_results = [None] * len(self.selections)

    @property
    def combined_odds(self) -> float:
        odds = 1.0
        for s in self.selections:
            odds *= s.decimal_odds
        return round(odds, 4)

    @property
    def potential_payout(self) -> float:
        return round(self.stake * self.combined_odds, 2)

    def combined_true_probability(self) -> Optional[float]:
        """Joint probability assuming leg independence; None if any leg is unknown."""

        probs = [s.true_probability for s in self.selections]
        if any(p is None for p in probs):
            return None
        product = 1.0
        for p in probs:  # type: ignore[union-attr]
            product *= p
        return round(product, 6)

    def expected_value(self) -> Optional[float]:
        p = self.combined_true_probability()
        if p is None:
            return None
        return round(self.stake * (p * self.combined_odds - 1.0), 4)


class BettingEngine:
    """Places and settles bets, tracking a running bankroll."""

    def __init__(self, starting_bankroll: float = 1000.0):
        self.bankroll = starting_bankroll
        self.bet_history: List[Bet] = []
        self.slip_history: List[BettingSlip] = []

    def place_bet(self, selection: Selection, stake: float) -> Bet:
        if stake <= 0:
            raise ValueError("stake must be positive")
        if stake > self.bankroll:
            raise ValueError("stake exceeds available bankroll")
        bet = Bet(selection=selection, stake=stake)
        self.bankroll -= stake
        self.bet_history.append(bet)
        return bet

    def place_accumulator(self, selections: Sequence[Selection], stake: float) -> BettingSlip:
        if stake <= 0:
            raise ValueError("stake must be positive")
        if stake > self.bankroll:
            raise ValueError("stake exceeds available bankroll")
        slip = BettingSlip(selections=list(selections), stake=stake)
        self.bankroll -= stake
        self.slip_history.append(slip)
        return slip

    def settle_bet(self, bet: Bet, won: bool) -> Bet:
        bet.status = BetStatus.WON if won else BetStatus.LOST
        bet.payout = bet.potential_payout if won else 0.0
        self.bankroll += bet.payout
        return bet

    def settle_accumulator(self, slip: BettingSlip, leg_results: Sequence[bool]) -> BettingSlip:
        if len(leg_results) != len(slip.selections):
            raise ValueError("leg_results must match the number of selections")
        slip.leg_results = list(leg_results)
        won = all(leg_results)
        slip.status = BetStatus.WON if won else BetStatus.LOST
        payout = slip.potential_payout if won else 0.0
        self.bankroll += payout
        return slip

    def net_profit(self) -> float:
        settled_bets = [b for b in self.bet_history if b.status in (BetStatus.WON, BetStatus.LOST)]
        settled_slips = [s for s in self.slip_history if s.status in (BetStatus.WON, BetStatus.LOST)]
        profit = sum(b.payout - b.stake for b in settled_bets)
        profit += sum(s.potential_payout - s.stake if s.status == BetStatus.WON else -s.stake for s in settled_slips)
        return round(profit, 2)
