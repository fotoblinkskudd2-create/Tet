"""End-to-end demo: load teams, simulate a match, run a Monte Carlo batch,
price gambling markets, evaluate value bets and run the drone-style
component pipeline (tracking + analytics).

Run with:
    python -m football_simulator.examples.run_example
"""
from __future__ import annotations

from pathlib import Path

from football_simulator.components.analytics import compute_performance_index
from football_simulator.components.drone_modules import (
    ComponentController,
    DataBus,
    Module,
    RedundancyGroup,
)
from football_simulator.components.tracking import TeamTracker
from football_simulator.core.match import Match
from football_simulator.core.player import Position
from football_simulator.core.simulator import SimulationRunner
from football_simulator.gambling.betting_engine import BettingEngine, Selection
from football_simulator.gambling.odds_calculator import OddsCalculator, decimal_odds_from_probability
from football_simulator.gambling.risk_analyzer import (
    find_value_bets,
    recommended_stake,
    simulate_risk_of_ruin,
)
from football_simulator.utils.config import GamblingConfig, ScoringRules, SimulationConfig
from football_simulator.utils.data_loader import load_teams_from_json
from football_simulator.utils.logger import get_logger

logger = get_logger("football_simulator.examples")

DATA_PATH = Path(__file__).parent / "sample_data.json"


class CameraTrackingModule(Module):
    def __init__(self, tracker: TeamTracker):
        super().__init__(module_id="cam-1", name="CameraTracking")
        self.tracker = tracker

    def process(self, payload):
        team, lineup, attacking_third = payload
        return self.tracker.track_team(team, lineup, attacking_third)


class AnalysisModule(Module):
    def process(self, payload):
        tracking = payload
        total_distance = sum(d.distance_covered_km for d in tracking.values())
        total_sprints = sum(d.sprint_count for d in tracking.values())
        return {"total_distance_km": round(total_distance, 2), "total_sprints": total_sprints}


def run_component_pipeline(home_team, lineup) -> None:
    bus = DataBus()
    controller = ComponentController(bus)
    tracking_group = RedundancyGroup(primary=CameraTrackingModule(TeamTracker(seed=1)))
    analysis_group = RedundancyGroup(primary=AnalysisModule(module_id="ana-1", name="Analysis"))
    controller.add_stage(tracking_group, output_topic="tracking.positions")
    controller.add_stage(analysis_group, output_topic="analysis.summary")

    result = controller.run((home_team, lineup, True))
    print(f"  Component pipeline output: {result}")
    print(f"  System health: {controller.system_health_report()}")


def main() -> None:
    teams = load_teams_from_json(str(DATA_PATH))
    home_team, away_team = teams[0], teams[1]

    config = SimulationConfig(monte_carlo_simulations=500, max_workers=4)
    scoring_rules = ScoringRules()
    gambling_config = GamblingConfig()

    print(f"=== {home_team.name} vs {away_team.name} ===")
    print(f"Home squad rating: {home_team.squad_rating():.1f}")
    print(f"Away squad rating: {away_team.squad_rating():.1f}\n")

    # 1) Single deterministic match.
    match = Match(home_team=home_team, away_team=away_team, config=config, seed=42)
    result = match.run()
    print(f"Single simulated result: {result.score} (xG {result.expected_goals_home:.2f} - "
          f"{result.expected_goals_away:.2f}), possession {result.possession_home_pct:.1f}%")

    top_scorer = max(result.player_stats.items(), key=lambda kv: kv[1].goals, default=(None, None))
    if top_scorer[1] and top_scorer[1].goals > 0:
        player = next(p for p in (*home_team.players, *away_team.players) if p.player_id == top_scorer[0])
        points = player.apply_match_result(top_scorer[1], scoring_rules)
        index = compute_performance_index(player, top_scorer[1])
        print(f"Top scorer: {player.name} ({top_scorer[1].goals} goals), "
              f"fantasy points={points}, performance index={index.value}\n")

    # 2) Monte Carlo batch -> outcome probabilities.
    runner = SimulationRunner(config)
    results = runner.run_many(home_team, away_team, n_simulations=300, parallel=True)
    aggregate = runner.aggregate(results, home_team_id=home_team.team_id)
    print(f"Monte Carlo ({aggregate.simulations} sims): "
          f"Home {aggregate.home_win_probability:.1%} / Draw {aggregate.draw_probability:.1%} / "
          f"Away {aggregate.away_win_probability:.1%}")
    print(f"Avg goals: {aggregate.avg_home_goals:.2f} - {aggregate.avg_away_goals:.2f}, "
          f"BTTS {aggregate.both_teams_scored_probability:.1%}, "
          f"Over 2.5 {aggregate.total_goals_over_2_5_probability:.1%}\n")

    # 3) Price gambling markets off the simulated probabilities.
    odds_calc = OddsCalculator(gambling_config)
    outcome_market = odds_calc.match_outcome_market(aggregate)
    ou_market = odds_calc.over_under_market(aggregate.avg_home_goals + aggregate.avg_away_goals)
    btts_market = odds_calc.btts_market(aggregate)
    scorer_market = odds_calc.anytime_scorer_market(home_team.starting_eleven(), aggregate.avg_home_goals)

    print(f"1X2 odds: {outcome_market.decimal_odds}")
    print(f"O/U 2.5 odds: {ou_market.decimal_odds}")
    print(f"BTTS odds: {btts_market.decimal_odds}")
    print(f"Anytime scorer odds (home): {scorer_market.decimal_odds}\n")

    # 4) Betting engine + risk analysis: find value vs a hypothetical market price.
    # The properly-margined market prices above have no value by construction
    # (that's what the overround is for). To demonstrate value-bet detection,
    # pretend a slow-moving "soft book" is still offering close-to-fair odds.
    engine = BettingEngine(starting_bankroll=gambling_config.default_starting_bankroll)
    soft_book_home_odds = decimal_odds_from_probability(aggregate.home_win_probability) * 1.08
    soft_book_btts_odds = decimal_odds_from_probability(aggregate.both_teams_scored_probability) * 1.08
    selections = [
        Selection("Match Outcome", "home", soft_book_home_odds, aggregate.home_win_probability),
        Selection("BTTS", "yes", soft_book_btts_odds, aggregate.both_teams_scored_probability),
    ]
    value_bets = find_value_bets(selections, gambling_config)
    print(f"Value bets found: {[s.selection for s in value_bets]}")

    for selection in value_bets:
        stake = recommended_stake(engine.bankroll, selection.true_probability, selection.decimal_odds, gambling_config)
        if stake > 0:
            bet = engine.place_bet(selection, stake)
            print(f"  Placed {bet.bet_id}: stake={bet.stake}, odds={selection.decimal_odds}, "
                  f"EV={bet.expected_value()}, edge={bet.edge()}")

    if value_bets:
        ruin = simulate_risk_of_ruin(
            starting_bankroll=gambling_config.default_starting_bankroll,
            stake_fraction=0.05,
            probability=value_bets[0].true_probability,
            decimal_odds=value_bets[0].decimal_odds,
            seed=7,
        )
        print(f"Risk of ruin (5% fixed stake, 200 bets, 2000 trials): {ruin.ruin_probability:.2%}\n")

    # 5) Drone-inspired component pipeline demo.
    print("=== Component pipeline (tracking + analysis) ===")
    run_component_pipeline(home_team, home_team.starting_eleven())


if __name__ == "__main__":
    main()
