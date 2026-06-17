"""Performance benchmark: single-match latency and sequential vs. parallel
throughput for Monte Carlo batches.

Run with:
    python -m football_simulator.benchmarks.benchmark
"""
from __future__ import annotations

import asyncio
from pathlib import Path

from football_simulator.core.simulator import MatchEngine, SimulationRunner
from football_simulator.utils.config import SimulationConfig
from football_simulator.utils.data_loader import load_teams_from_json
from football_simulator.utils.logger import Stopwatch

DATA_PATH = Path(__file__).parent.parent / "examples" / "sample_data.json"


def benchmark_single_match(home, away, n: int = 200) -> float:
    config = SimulationConfig()
    with Stopwatch() as sw:
        for seed in range(n):
            MatchEngine(config, seed=seed).simulate(home, away)
    return sw.elapsed_seconds


def benchmark_sequential(home, away, n: int, config: SimulationConfig) -> float:
    runner = SimulationRunner(config)
    with Stopwatch() as sw:
        runner.run_many(home, away, n_simulations=n, parallel=False)
    return sw.elapsed_seconds


def benchmark_threaded(home, away, n: int, config: SimulationConfig) -> float:
    runner = SimulationRunner(config)
    with Stopwatch() as sw:
        runner.run_many(home, away, n_simulations=n, parallel=True)
    return sw.elapsed_seconds


def benchmark_multiprocess(home, away, n: int, workers: int) -> float:
    config = SimulationConfig(max_workers=workers, use_multiprocessing=True)
    runner = SimulationRunner(config)
    with Stopwatch() as sw:
        runner.run_many(home, away, n_simulations=n, parallel=True)
    return sw.elapsed_seconds


def benchmark_async(home, away, n: int, config: SimulationConfig) -> float:
    runner = SimulationRunner(config)

    async def run():
        return await runner.run_many_async(home, away, n_simulations=n)

    with Stopwatch() as sw:
        asyncio.run(run())
    return sw.elapsed_seconds


def main() -> None:
    teams = load_teams_from_json(str(DATA_PATH))
    home, away = teams[0], teams[1]

    n_single = 200
    single_elapsed = benchmark_single_match(home, away, n=n_single)
    print(f"Single-match latency: {n_single} matches in {single_elapsed:.4f}s "
          f"({(single_elapsed / n_single) * 1000:.3f} ms/match, "
          f"{n_single / single_elapsed:.1f} matches/sec)")

    n_batch = 400
    for workers in (1, 2, 4, 8):
        config = SimulationConfig(max_workers=workers)
        seq_time = benchmark_sequential(home, away, n_batch, config)
        threaded_time = benchmark_threaded(home, away, n_batch, config)
        speedup = seq_time / threaded_time if threaded_time > 0 else float("inf")
        print(f"workers={workers}: sequential={seq_time:.3f}s "
              f"({n_batch / seq_time:.1f}/s) | threaded={threaded_time:.3f}s "
              f"({n_batch / threaded_time:.1f}/s) | speedup={speedup:.2f}x")

    config = SimulationConfig(max_workers=4)
    async_time = benchmark_async(home, away, n_batch, config)
    print(f"asyncio (4 workers): {async_time:.3f}s ({n_batch / async_time:.1f}/s)")

    n_large = 2000
    seq_large = benchmark_sequential(home, away, n_large, SimulationConfig(max_workers=4))
    mp_large = benchmark_multiprocess(home, away, n_large, workers=4)
    print(f"large batch ({n_large}): sequential={seq_large:.3f}s ({n_large / seq_large:.1f}/s) | "
          f"multiprocessing(4)={mp_large:.3f}s ({n_large / mp_large:.1f}/s) | "
          f"speedup={seq_large / mp_large:.2f}x")


if __name__ == "__main__":
    main()
