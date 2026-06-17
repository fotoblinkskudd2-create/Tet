"""The simulation engine: single-match resolution plus parallel/Monte Carlo runs.

Design notes
-------------
``MatchEngine`` resolves one fixture minute-by-minute using a Poisson-style
shot-generation process whose rate and quality are derived from team
strength differentials; each shot is then resolved with the geometric xG
model in ``core.physics`` (distance/angle -> expected goals), which is the
"realistic ball physics" requirement applied at the granularity that
actually matters for outcome probabilities (we are not animating a ball,
we are pricing shots the way real xG-based betting models do).

``SimulationRunner`` runs many independent matches - sequentially, via a
thread/process pool, or via asyncio - to build Monte Carlo probability
distributions that feed the gambling/odds layer.
"""
from __future__ import annotations

import asyncio
import concurrent.futures
import random
from collections import Counter
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional

from football_simulator.core.match import EventType, Match, MatchEvent, MatchResult, Score
from football_simulator.core.physics import expected_goal_value
from football_simulator.core.player import Player, PlayerMatchStats, Position
from football_simulator.core.team import Team
from football_simulator.utils.config import SimulationConfig
from football_simulator.utils.logger import get_logger

logger = get_logger(__name__)

AVG_GOAL_CONVERSION = 0.11  # league-average goals-per-shot, anchors shot volume to xG


class MatchEngine:
    """Simulates a single match minute-by-minute given two teams."""

    def __init__(self, config: Optional[SimulationConfig] = None, seed: Optional[int] = None):
        self.config = config or SimulationConfig()
        self.rng = random.Random(seed if seed is not None else self.config.random_seed)
        self._strength_cache: Dict[str, Dict[str, float]] = {}

    # -- Strength helpers (cached per simulate() call to avoid recompute per minute) --
    def _team_strengths(self, team: Team, lineup: List[Player], is_home: bool) -> Dict[str, float]:
        cache_key = f"{team.team_id}:{is_home}"
        if cache_key in self._strength_cache:
            return self._strength_cache[cache_key]

        home_bonus = (1.0 + self.config.home_advantage) if is_home else 1.0
        strengths = {
            "attack": team.attack_strength(lineup) * home_bonus,
            "midfield": team.midfield_strength(lineup) * home_bonus,
            "defense": team.defense_strength(lineup) * (1.0 if is_home else 1.0),
        }
        self._strength_cache[cache_key] = strengths
        return strengths

    def _expected_goal_rate(self, attack: float, opponent_defense: float) -> float:
        attack_index = attack / 70.0
        defense_index = max(0.4, opponent_defense / 70.0)
        rate = self.config.base_goal_rate_per_90 * (attack_index / defense_index)
        return max(0.2, min(4.5, rate))

    def _shooter_for(self, lineup: List[Player]) -> Player:
        outfield = [p for p in lineup if p.position != Position.GOALKEEPER]
        if not outfield:
            return lineup[0]
        weights = []
        for p in outfield:
            bias = {
                Position.FORWARD: 3.0,
                Position.MIDFIELDER: 1.6,
                Position.DEFENDER: 0.4,
            }[p.position]
            weights.append(bias * max(1.0, p.attributes.shooting))
        return self.rng.choices(outfield, weights=weights, k=1)[0]

    def _passer_for(self, lineup: List[Player], exclude: Player) -> Optional[Player]:
        candidates = [p for p in lineup if p is not exclude and p.position != Position.GOALKEEPER]
        if not candidates:
            return None
        weights = [max(1.0, p.attributes.passing) for p in candidates]
        return self.rng.choices(candidates, weights=weights, k=1)[0]

    def _resolve_shot(
        self,
        shooter: Player,
        opponent_keeper: Optional[Player],
        attack_quality: float,
        stats_by_id: Dict[str, PlayerMatchStats],
    ) -> bool:
        """Resolve one shot attempt; returns True if it results in a goal."""

        quality_bonus = max(0.0, (attack_quality - 70.0) / 10.0)
        distance = self.rng.triangular(5.0, 35.0, max(7.0, 16.0 - quality_bonus))
        angle = self.rng.triangular(0.0, 75.0, max(5.0, 28.0 - quality_bonus))
        is_header = self.rng.random() < 0.12

        xg = expected_goal_value(distance, angle, is_header=is_header)
        shooter_skill_factor = 0.7 + (shooter.attributes.shooting / 99.0) * 0.6
        keeper_factor = 1.0
        if opponent_keeper is not None:
            keeper_factor = 0.7 + (opponent_keeper.attributes.goalkeeping / 99.0) * 0.6

        goal_probability = max(0.01, min(0.95, xg * shooter_skill_factor / keeper_factor))
        on_target_probability = max(0.15, min(0.97, goal_probability * 2.3))
        # P(goal) must equal goal_probability overall; since a goal requires
        # being on target first, the conditional finish rate is the ratio.
        conditional_goal_given_on_target = min(1.0, goal_probability / on_target_probability)

        stats = stats_by_id[shooter.player_id]
        stats.shots += 1
        on_target = self.rng.random() < on_target_probability
        is_goal = False
        if on_target:
            stats.shots_on_target += 1
            is_goal = self.rng.random() < conditional_goal_given_on_target
        if is_goal:
            stats.goals += 1
        return is_goal

    def _maybe_card(self, lineup: List[Player], stats_by_id: Dict[str, PlayerMatchStats], team_id: str, minute: int, events: List[MatchEvent]) -> None:
        outfield = [p for p in lineup if p.position != Position.GOALKEEPER]
        if not outfield or self.rng.random() >= self.config.card_probability_per_foul:
            return
        culprit = self.rng.choice(outfield)
        stats = stats_by_id[culprit.player_id]
        stats.fouls_committed += 1
        if self.rng.random() < 0.12:
            stats.red_cards += 1
            events.append(MatchEvent(minute, EventType.RED_CARD, team_id, culprit.player_id))
        else:
            stats.yellow_cards += 1
            events.append(MatchEvent(minute, EventType.YELLOW_CARD, team_id, culprit.player_id))

    def _maybe_injury(self, lineup: List[Player], stats_by_id: Dict[str, PlayerMatchStats], team_id: str, minute: int, events: List[MatchEvent]) -> None:
        per_minute_prob = self.config.injury_probability_per_match / self.config.match_duration_minutes
        for player in lineup:
            if self.rng.random() < per_minute_prob:
                events.append(MatchEvent(minute, EventType.INJURY, team_id, player.player_id))
                return  # at most one injury check resolution per minute, per team

    def simulate(self, home_team: Team, away_team: Team) -> MatchResult:
        self._strength_cache.clear()
        home_lineup = home_team.starting_eleven()
        away_lineup = away_team.starting_eleven()

        home_strengths = self._team_strengths(home_team, home_lineup, is_home=True)
        away_strengths = self._team_strengths(away_team, away_lineup, is_home=False)

        xg_home_rate = self._expected_goal_rate(home_strengths["attack"], away_strengths["defense"])
        xg_away_rate = self._expected_goal_rate(away_strengths["attack"], home_strengths["defense"])

        shots_home_rate = min(26.0, max(4.0, xg_home_rate / AVG_GOAL_CONVERSION))
        shots_away_rate = min(26.0, max(4.0, xg_away_rate / AVG_GOAL_CONVERSION))

        stats_by_id: Dict[str, PlayerMatchStats] = {
            p.player_id: PlayerMatchStats() for p in (*home_lineup, *away_lineup)
        }
        for p in (*home_lineup, *away_lineup):
            stats_by_id[p.player_id].minutes_played = self.config.match_duration_minutes

        home_keeper = next((p for p in home_lineup if p.position == Position.GOALKEEPER), None)
        away_keeper = next((p for p in away_lineup if p.position == Position.GOALKEEPER), None)

        score = Score()
        events: List[MatchEvent] = []
        minute = 0
        step = max(1, self.config.time_step_minutes)
        duration = self.config.match_duration_minutes

        home_shot_p = shots_home_rate / duration
        away_shot_p = shots_away_rate / duration

        while minute < duration:
            minute += step

            if self.rng.random() < home_shot_p * step:
                shooter = self._shooter_for(home_lineup)
                if self._resolve_shot(shooter, away_keeper, home_strengths["attack"], stats_by_id):
                    score.home += 1
                    assist_provider = self._passer_for(home_lineup, shooter) if self.rng.random() < 0.62 else None
                    if assist_provider is not None:
                        stats_by_id[assist_provider.player_id].assists += 1
                    events.append(
                        MatchEvent(
                            minute, EventType.GOAL, home_team.team_id, shooter.player_id,
                            assist_provider.player_id if assist_provider else None,
                            f"Goal for {home_team.name}",
                        )
                    )

            if self.rng.random() < away_shot_p * step:
                shooter = self._shooter_for(away_lineup)
                if self._resolve_shot(shooter, home_keeper, away_strengths["attack"], stats_by_id):
                    score.away += 1
                    assist_provider = self._passer_for(away_lineup, shooter) if self.rng.random() < 0.62 else None
                    if assist_provider is not None:
                        stats_by_id[assist_provider.player_id].assists += 1
                    events.append(
                        MatchEvent(
                            minute, EventType.GOAL, away_team.team_id, shooter.player_id,
                            assist_provider.player_id if assist_provider else None,
                            f"Goal for {away_team.name}",
                        )
                    )

            self._maybe_card(home_lineup, stats_by_id, home_team.team_id, minute, events)
            self._maybe_card(away_lineup, stats_by_id, away_team.team_id, minute, events)
            self._maybe_injury(home_lineup, stats_by_id, home_team.team_id, minute, events)
            self._maybe_injury(away_lineup, stats_by_id, away_team.team_id, minute, events)

        self._fill_passing_stats(home_lineup, stats_by_id, possession_share=self._possession_share(home_strengths, away_strengths))
        self._fill_passing_stats(away_lineup, stats_by_id, possession_share=1.0 - self._possession_share(home_strengths, away_strengths))
        self._fill_defensive_stats(home_lineup, away_lineup, stats_by_id)
        self._fill_defensive_stats(away_lineup, home_lineup, stats_by_id)

        clean_sheet_home = score.away == 0
        clean_sheet_away = score.home == 0
        for p in home_lineup:
            stats_by_id[p.player_id].clean_sheet = clean_sheet_home
            stats_by_id[p.player_id].goals_conceded = score.away
        for p in away_lineup:
            stats_by_id[p.player_id].clean_sheet = clean_sheet_away
            stats_by_id[p.player_id].goals_conceded = score.home

        possession_home_pct = self._possession_share(home_strengths, away_strengths) * 100.0

        return MatchResult(
            home_team_id=home_team.team_id,
            away_team_id=away_team.team_id,
            home_team_name=home_team.name,
            away_team_name=away_team.name,
            score=score,
            events=sorted(events, key=lambda e: e.minute),
            player_stats=stats_by_id,
            expected_goals_home=round(xg_home_rate, 3),
            expected_goals_away=round(xg_away_rate, 3),
            possession_home_pct=round(possession_home_pct, 1),
            shots_home=sum(stats_by_id[p.player_id].shots for p in home_lineup),
            shots_away=sum(stats_by_id[p.player_id].shots for p in away_lineup),
        )

    @staticmethod
    def _possession_share(home_strengths: Dict[str, float], away_strengths: Dict[str, float]) -> float:
        home_mid = home_strengths["midfield"]
        away_mid = away_strengths["midfield"]
        total = home_mid + away_mid
        if total == 0:
            return 0.5
        return max(0.3, min(0.7, home_mid / total))

    def _fill_passing_stats(self, lineup: List[Player], stats_by_id: Dict[str, PlayerMatchStats], possession_share: float) -> None:
        team_pass_volume = 280 + possession_share * 260  # plausible total team passes
        weights = [max(1.0, p.attributes.passing) for p in lineup]
        total_weight = sum(weights) or 1.0
        for player, weight in zip(lineup, weights):
            stats = stats_by_id[player.player_id]
            attempted = int(team_pass_volume * (weight / total_weight))
            accuracy = 0.6 + (player.attributes.passing / 99.0) * 0.35
            stats.passes_attempted += attempted
            stats.passes_completed += int(attempted * accuracy)
            stats.key_passes += self.rng.randint(0, 3) if player.position != Position.GOALKEEPER else 0

    def _fill_defensive_stats(self, lineup: List[Player], opponents: List[Player], stats_by_id: Dict[str, PlayerMatchStats]) -> None:
        opponent_shots = sum(stats_by_id[p.player_id].shots for p in opponents)
        defenders = [p for p in lineup if p.position in (Position.DEFENDER, Position.MIDFIELDER)]
        if not defenders:
            return
        weights = [max(1.0, p.attributes.defending) for p in defenders]
        total_weight = sum(weights) or 1.0
        defensive_actions = max(8, int(opponent_shots * 2.2))
        for player, weight in zip(defenders, weights):
            stats = stats_by_id[player.player_id]
            share = weight / total_weight
            stats.tackles_won += int(defensive_actions * share * 0.55)
            stats.interceptions += int(defensive_actions * share * 0.3)
            stats.clearances += int(defensive_actions * share * 0.4)

        keeper = next((p for p in lineup if p.position == Position.GOALKEEPER), None)
        if keeper is not None:
            shots_on_target_against = sum(
                1 for p in opponents for _ in range(stats_by_id[p.player_id].shots_on_target)
            )
            goals_against = sum(stats_by_id[p.player_id].goals for p in opponents)
            stats_by_id[keeper.player_id].saves += max(0, shots_on_target_against - goals_against)


@dataclass
class AggregateProbabilities:
    """Monte Carlo-derived probability distribution over match outcomes."""

    simulations: int
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    avg_home_goals: float
    avg_away_goals: float
    both_teams_scored_probability: float
    score_distribution: Dict[str, float] = field(default_factory=dict)
    total_goals_over_2_5_probability: float = 0.0


class SimulationRunner:
    """Runs many independent match simulations, sequentially or in parallel."""

    def __init__(self, config: Optional[SimulationConfig] = None):
        self.config = config or SimulationConfig()

    def run_many(
        self,
        home_team: Team,
        away_team: Team,
        n_simulations: Optional[int] = None,
        parallel: bool = True,
    ) -> List[MatchResult]:
        n = n_simulations or self.config.monte_carlo_simulations
        if not parallel or n <= 1:
            return [self._run_one(home_team, away_team, seed) for seed in range(n)]

        executor_cls = (
            concurrent.futures.ProcessPoolExecutor
            if self.config.use_multiprocessing
            else concurrent.futures.ThreadPoolExecutor
        )
        results: List[MatchResult] = []
        with executor_cls(max_workers=self.config.max_workers) as executor:
            futures = [
                executor.submit(self._run_one, home_team, away_team, seed) for seed in range(n)
            ]
            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())
        return results

    async def run_many_async(
        self,
        home_team: Team,
        away_team: Team,
        n_simulations: Optional[int] = None,
    ) -> List[MatchResult]:
        """Asyncio-based variant: offloads blocking simulations to a thread pool
        while keeping the calling coroutine (e.g. a web request handler) responsive.
        """

        n = n_simulations or self.config.monte_carlo_simulations
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            tasks = [
                loop.run_in_executor(executor, self._run_one, home_team, away_team, seed)
                for seed in range(n)
            ]
            return list(await asyncio.gather(*tasks))

    def _run_one(self, home_team: Team, away_team: Team, seed: int) -> MatchResult:
        engine = MatchEngine(self.config, seed=seed)
        return engine.simulate(home_team, away_team)

    @staticmethod
    def aggregate(results: List[MatchResult], home_team_id: str) -> AggregateProbabilities:
        """Turn a batch of MatchResults into outcome probabilities for the odds layer."""

        n = len(results)
        if n == 0:
            raise ValueError("Cannot aggregate an empty list of results.")

        home_wins = sum(1 for r in results if r.winner_team_id() == home_team_id)
        draws = sum(1 for r in results if r.winner_team_id() is None)
        away_wins = n - home_wins - draws

        btts = sum(1 for r in results if r.both_teams_scored())
        over_2_5 = sum(1 for r in results if r.total_goals() > 2.5)

        score_counts = Counter(str(r.score) for r in results)
        score_distribution = {score: count / n for score, count in score_counts.items()}

        return AggregateProbabilities(
            simulations=n,
            home_win_probability=home_wins / n,
            draw_probability=draws / n,
            away_win_probability=away_wins / n,
            avg_home_goals=sum(r.score.home for r in results) / n,
            avg_away_goals=sum(r.score.away for r in results) / n,
            both_teams_scored_probability=btts / n,
            score_distribution=score_distribution,
            total_goals_over_2_5_probability=over_2_5 / n,
        )
