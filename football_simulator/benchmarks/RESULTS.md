# Performance Benchmarks

Measured on a 4-core sandboxed container (`os.cpu_count() == 4`), pure
stdlib Python 3.11, no numpy/compiled extensions. Reproduce with:

```bash
python -m football_simulator.benchmarks.benchmark
```

## Single-match latency

| Metric | Value |
|---|---|
| Matches simulated | 200 |
| Total time | 0.241 s |
| Latency per match | 1.21 ms |
| Throughput | ~829 matches/sec |

## Monte Carlo batch throughput (400 simulations)

| Workers | Sequential | Threaded (`ThreadPoolExecutor`) | Speedup |
|---|---|---|---|
| 1 | 821/s | 770/s | 0.94x |
| 2 | 800/s | 751/s | 0.94x |
| 4 | 824/s | 770/s | 0.93x |
| 8 | 822/s | 772/s | 0.94x |

| Mode | Throughput |
|---|---|
| asyncio (4 worker thread pool) | ~662/s |

## Large batch (2000 simulations), process-based parallelism

| Mode | Time | Throughput | Speedup |
|---|---|---|---|
| Sequential | 2.667 s | 750/s | 1.00x |
| `ProcessPoolExecutor` (4 workers) | 2.131 s | 939/s | 1.25x |

## Interpretation

- The match engine is CPU-bound pure Python, so **threads do not help**
  (the GIL serializes execution and adds scheduling overhead) - threaded
  throughput is consistently *below* sequential. `SimulationRunner` still
  defaults to threads (`use_multiprocessing=False`) because they are the
  safe default in sandboxed/restricted environments and are the right
  choice once the workload becomes I/O-bound (e.g. fetching odds from a
  remote feed between simulations).
- `asyncio` here just offloads the same blocking work onto a thread pool,
  so it inherits the same GIL-bound ceiling. Its value is keeping a calling
  event loop (e.g. a web server handling other requests) responsive while
  a Monte Carlo batch runs, not raw throughput.
- `ProcessPoolExecutor` (`use_multiprocessing=True`) gets real parallelism
  and shows a genuine speedup once the batch is large enough to amortize
  process start-up cost (~1.25x with 4 workers on a 4-core box for 2000
  simulations; the ceiling is below 4x because of per-task serialization
  overhead for the `Team`/`Player` payloads and the fixed cost of spinning
  up worker processes).
- For typical gambling use (a few hundred to a few thousand Monte Carlo
  simulations to price one fixture), single-threaded throughput of
  ~800 matches/sec is already fast enough to price a market in well under
  a second; multiprocessing is most useful when running many fixtures'
  batches concurrently (e.g. pricing a full match day).
