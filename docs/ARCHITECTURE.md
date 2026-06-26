# Architecture

Tet is built around three small ideas in `tet/core.py` and a folder of
independent solvers in `tet/solvers/`.

## The three core types

### `Solution`
A small dataclass carrying everything needed to *present* an answer: a `kind`
(category), an `answer` (the headline, written to be read aloud), optional
`details`, a `confidence` in `[0, 1]`, and the `source` solver's name. It knows
how to render itself for a terminal (`.format()`) and for machines
(`.to_dict()`).

### `Solver`
The contract a capability implements:

```python
class Solver:
    name: str          # stable id, used in --list and Solution.source
    kind: str          # default category for produced solutions
    description: str    # one-liner for help output

    def solve(self, problem: str) -> Optional[Solution]:
        ...
```

`solve` returns `None` when it doesn't recognise the input, or a `Solution`
with a *calibrated* confidence when it does. A small `make()` helper builds a
solution pre-tagged with the solver's identity.

### `Registry`
A confidence-ranked dispatcher. It runs every registered solver, collects the
non-`None` results, and ranks them by **descending confidence**, breaking ties
by registration order. A misbehaving solver that raises is skipped, never
allowed to sink the whole query.

```
problem ─▶ [ solver, solver, … ] ─▶ rank by confidence ─▶ best / candidates
```

## Why confidence ranking?

The original design tried solvers in a fixed order and returned the first
match. That makes ordering load-bearing and brittle: a greedy solver shadows a
more specific one. Ranking by confidence decouples *registration* from
*precedence*. Each solver simply reports how sure it is, and the engine does
the arbitration. Concretely, the wellbeing solver reports `0.97`, so a sentence
that mentions both panic *and* a number gets the support protocol, not a stray
arithmetic result.

The **brainstorm** fallback matches everything at confidence `0.02`, which
guarantees `solve_problem` never returns `None` while never beating a real
answer.

## Searching on input: the knowledge solver

`tet/solvers/knowledge.py` is a curated, offline knowledge base (physical
constants from CODATA 2022, the full SI prefix set, and defined reference
values). It does not pattern-match a fixed grammar; instead it **ranks every
entry against the query**. The score combines two signals:

1. **Whole-word phrase hits** — an entry term appearing in the query on letter
   boundaries (so "kilo" never matches inside "kilometers").
2. **Typo-tolerant token matching** — `difflib.get_close_matches` over the
   query's meaningful tokens, so "boltzman constant" still finds Boltzmann.

It only emits a `Solution` above a confidence threshold, so it never hijacks an
arithmetic or unit question that merely contains the word "what". The values
are sourced, not remembered — see the commit that introduced it for the CODATA
references.

## Intelligence: did-you-mean dispatch

`tet/intelligence.py` runs when *nothing* matched. It scores the query's tokens
against each capability's vocabulary (again with `difflib` typo tolerance) and,
for any strong intent, appends a concrete, copy-pasteable example to the
brainstorm fallback. This is wired in `tet.solve_problem`: the engine still
returns a `Brainstorm` solution, but an enriched one that says *"Did you mean a
unit conversion? Try: convert 10 km to miles."* A truly open-ended question
("organize my sock drawer") gets no spurious hint and keeps its joyful steps.

## Confidence guide

| Band | Meaning | Example solvers |
| --- | --- | --- |
| `0.95–1.0` | Safety-critical / unambiguous intent | wellbeing |
| `0.84–0.92` | Clear structural match (operators, units, ISO dates) | arithmetic, units, temporal, numeric |
| `0.68–0.9` | Ranked knowledge-base match (phrase hit → fuzzy) | knowledge |
| `0.7` | Recognised shape, partial/empty result | anagram with no match |
| `0.02` | Universal fallback | brainstorm |

## Adding a solver

1. Create `tet/solvers/your_solver.py`:

   ```python
   from ..core import Solution, Solver

   class GreetSolver(Solver):
       name = "greet"
       kind = "Greeting"
       description = "Say hello back."

       def solve(self, problem):
           if "hello" not in problem.lower():
               return None
           return self.make("Hello to you too! 👋", confidence=0.6)
   ```

2. Register it in `tet/solvers/__init__.py` inside `default_registry()` (and
   list it in `all_solvers()` so it shows up under `--list`).

3. Add tests in `tests/`. Prefer testing pure helper functions directly for
   determinism, plus one end-to-end assertion via `tet.solve_problem`.

That's it — no other file needs to change.

## Safety: the arithmetic evaluator

`tet/solvers/arithmetic.py` never calls `eval`. It parses with `ast.parse(...,
mode="eval")` and walks the tree, honouring only an explicit allow-list of
binary/unary operators, a fixed set of pure numeric functions, and three named
constants (`pi`, `e`, `tau`). Anything else — attribute access, unknown names,
non-whitelisted calls — raises `UnsafeExpression`, which the solver turns into
a polite "not for me" (`None`). So `__import__('os').system(...)` simply falls
through to brainstorm.

## Backwards compatibility

`app.py` is now a thin shim that re-exports `Solution`, `solve_problem`,
`candidate_solutions` and `build_creative_prompt` from the package, and wires
`python app.py` to the CLI. Existing imports and invocations are unchanged.
