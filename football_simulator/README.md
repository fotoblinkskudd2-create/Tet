# football_simulator

A modular football match simulator with a gambling-analytics layer: Monte
Carlo match simulation, xG-based shot resolution, odds pricing, bankroll/
risk management and a drone-inspired pluggable component architecture for
player tracking and analytics.

Pure Python standard library - no numpy/scipy/pytest required - so it runs
anywhere Python 3.9+ runs. `PyYAML` is an optional convenience for YAML
config files (JSON works without it).

> **Responsible use.** This is an analytics/simulation toolkit (xG modeling,
> probability estimation, bankroll math). It does not place real bets or
> connect to any betting operator. If you build a real product on top of
> it, make sure it complies with the gambling regulations of your
> jurisdiction and includes responsible-gambling safeguards.

## Architecture

```
football_simulator/
├── core/               # simulation engine, data model, physics
│   ├── player.py        Player, attributes, form/fitness/injury, fantasy scoring
│   ├── team.py           Team, formations, tactical styles, strength ratings
│   ├── physics.py        ball/shot geometry (xG), pitch coordinates
│   ├── match.py           Match/MatchResult/MatchEvent data model
│   └── simulator.py       MatchEngine (single match) + SimulationRunner (Monte Carlo, parallel)
├── gambling/            # odds pricing and risk tools
│   ├── odds_calculator.py  probability<->odds conversions, betting markets, Poisson helpers
│   ├── betting_engine.py   Bet/BettingSlip, accumulators, EV/edge, bankroll tracking
│   └── risk_analyzer.py    Kelly staking, variance, risk-of-ruin Monte Carlo, value-bet detection
├── components/          # drone-inspired pluggable component architecture
│   ├── drone_modules.py    Module/DataBus/RedundancyGroup/ComponentController (fault tolerance)
│   ├── tracking.py          synthetic player position/heatmap tracking
│   └── analytics.py         performance index + historical trend analysis
├── utils/
│   ├── config.py            SimulationConfig / ScoringRules / GamblingConfig (JSON/YAML)
│   ├── logger.py             logging setup + timing decorator/Stopwatch
│   └── data_loader.py        load teams from JSON, save/load simulation results
├── examples/             sample two-team dataset + end-to-end demo script
├── benchmarks/           throughput benchmark + recorded results
└── tests/                unittest suite (104 tests) covering every module
```

### Design notes

- **Simulation engine.** `MatchEngine.simulate()` resolves a match minute by
  minute: shot *volume* is derived from each team's attack/defense strength
  differential, and each shot's *quality* (on-target probability, goal
  probability) comes from `core.physics.expected_goal_value` - a compact xG
  model driven by shot distance/angle, the same inputs real xG-based pricing
  models use. Team strength lookups are cached per `simulate()` call so a
  90-minute loop doesn't recompute squad ratings every minute.
- **Parallel/Monte Carlo runs.** `SimulationRunner.run_many()` runs N
  independent matches sequentially, via `ThreadPoolExecutor`/
  `ProcessPoolExecutor` (`SimulationConfig.use_multiprocessing`), or via
  `run_many_async()` for asyncio-based callers. See
  `benchmarks/RESULTS.md` for measured throughput and why threads don't
  help this particular CPU-bound workload (the GIL) while processes do.
- **Gambling layer.** `OddsCalculator` turns `SimulationRunner.aggregate()`
  probabilities into priced markets (1X2, over/under, BTTS, correct score,
  anytime scorer) with a configurable bookmaker margin. `risk_analyzer`
  implements fractional Kelly staking, edge/value-bet detection, variance
  and a Monte Carlo risk-of-ruin simulator.
- **Drone-inspired components.** `components/drone_modules.py` models each
  capability (camera-tracking, positioning, analysis) as a `Module` with a
  health score; `RedundancyGroup` automatically fails over to a backup
  module if the primary degrades or fails, and a `DataBus` decouples stages
  via publish/subscribe instead of direct calls - the same pattern used in
  drone flight-controller firmware for sensor redundancy.

## Quick start

```bash
cd football_simulator
python -m examples.run_example          # from inside football_simulator/
# or, from the repo root:
python -m football_simulator.examples.run_example
```

This loads `examples/sample_data.json` (two 16-player squads), simulates a
single match, runs a 300-fixture Monte Carlo batch, prices four betting
markets, finds value bets against a synthetic "soft book" price, runs a
risk-of-ruin simulation, and exercises the drone-style tracking/analytics
pipeline.

### Minimal usage

```python
from football_simulator.utils.data_loader import load_teams_from_json
from football_simulator.core.match import Match
from football_simulator.core.simulator import SimulationRunner
from football_simulator.gambling.odds_calculator import OddsCalculator
from football_simulator.utils.config import SimulationConfig

home, away = load_teams_from_json("examples/sample_data.json")

# One deterministic match (same seed -> same result, useful for tests/replay):
result = Match(home_team=home, away_team=away, seed=42).run()
print(result.score, result.events[:3])

# Monte Carlo probabilities feeding the odds engine:
runner = SimulationRunner(SimulationConfig(monte_carlo_simulations=1000))
results = runner.run_many(home, away)
aggregate = runner.aggregate(results, home_team_id=home.team_id)

market = OddsCalculator().match_outcome_market(aggregate)
print(market.decimal_odds)  # {'home': 1.97, 'draw': 3.45, 'away': 3.82}
```

## Configuration

All tunable parameters live in `utils.config`:

- `SimulationConfig` - match length, home advantage, base goal rate, injury/
  card probabilities, Monte Carlo batch size, worker count, threads vs.
  processes.
- `ScoringRules` - the fantasy/gambling point values per stat (goals by
  position, assists, cards, clean sheets, etc.), used by
  `core.player.compute_fantasy_points`.
- `GamblingConfig` - bookmaker margin, Kelly fraction, minimum edge for a
  "value bet", max stake as a fraction of bankroll.

```python
from football_simulator.utils.config import AppConfig, save_config, load_config

save_config(AppConfig(), "my_config.json")  # or .yaml, with PyYAML installed
config = load_config("my_config.json")
```

## Extending the simulator

- **New betting market**: add a method to `OddsCalculator` that turns an
  `AggregateProbabilities` (or a custom probability dict) into a `Market`
  via `Market(...).price(margin)`.
- **New player attribute/role**: extend `PlayerAttributes` and the
  `_POSITION_WEIGHTS` table in `core/player.py`; `effective_rating()` and
  the match engine pick it up automatically.
- **New pluggable component**: subclass `components.drone_modules.Module`,
  implement `process()`, and wire it into a `RedundancyGroup` /
  `ComponentController` stage - no changes needed elsewhere.
- **New formation/tactic**: add an entry to `Formation`/`TacticalStyle` and
  the corresponding slot/modifier tables in `core/team.py`.

## Tests

Pure `unittest`, no extra dependencies:

```bash
python -m unittest discover -s football_simulator/tests -t .
```

104 tests cover ratings/fantasy scoring, formation selection, deterministic
match simulation, Monte Carlo aggregation, odds conversions/markets, bet
settlement and accumulators, Kelly staking and risk-of-ruin, the drone
component fault-tolerance/failover behavior, tracking and config/data
serialization round-trips.

## Benchmarks

```bash
python -m football_simulator.benchmarks.benchmark
```

See `benchmarks/RESULTS.md` for recorded numbers (~800 matches/sec single-
threaded; why threads don't help a CPU-bound engine; ~1.25x speedup from
process-based parallelism on a 4-core box for large batches).
