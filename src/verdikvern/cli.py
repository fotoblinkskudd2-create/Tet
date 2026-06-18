"""Command-line interface for the KUTT24 Value Engine.

Usage examples (mock mode is the default; nothing leaves the machine):

    python -m verdikvern selftest
    python -m verdikvern tasks
    python -m verdikvern tasks --category drone_civil
    python -m verdikvern run "Write a 24h operator runbook"
    python -m verdikvern run-task T001
    python -m verdikvern run-task T001 --json

Enabling the live Claude backend requires an explicit --live flag *and*
ANTHROPIC_API_KEY in the environment. There is no implicit live mode.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import List, Optional

from .contracts import Verdict
from .run_loop import EngineConfig, LoopReport, ValueEngine
from .task_bank import TaskBank

_VERDICT_MARK = {
    Verdict.PASS: "PASS  ✓",
    Verdict.REWORK: "REWORK ↻",
    Verdict.BLOCK: "BLOCK  ✗",
}


def _engine(args: argparse.Namespace) -> ValueEngine:
    return ValueEngine(EngineConfig(live=getattr(args, "live", False)))


def _print_report(report: LoopReport, as_json: bool) -> None:
    if as_json:
        print(json.dumps({
            "final_verdict": report.final_verdict.value if report.final_verdict else None,
            "attempts": report.attempts,
            "cycles": [c.to_dict() for c in report.cycles],
        }, indent=2))
        return

    for i, cycle in enumerate(report.cycles, 1):
        j = cycle.judgement
        print(f"\n── cycle {i} (attempt {cycle.card.attempt}) ──")
        print(f"objective : {cycle.card.objective.splitlines()[0]}")
        print(f"memory    : {len(cycle.context.records)} record(s) bound")
        print(f"verdict   : {_VERDICT_MARK.get(j.verdict, j.verdict.value)}  score={j.score}")
        for reason in j.reasons:
            print(f"  reason  : {reason}")
        for note in j.rework_notes:
            print(f"  rework  : {note}")
    final = report.final_verdict.value if report.final_verdict else "NONE"
    print(f"\n=> final: {final} after {report.attempts} attempt(s)")


def cmd_selftest(args: argparse.Namespace) -> int:
    engine = _engine(args)
    bank = TaskBank()
    print(f"backend       : {engine.backend_name}")
    print(f"task bank     : {len(bank)} tasks across {len(bank.categories())} categories")
    print(f"memory store  : {engine.config.memory_path} ({len(engine.memory)} records)")
    # Run one safe task end-to-end to prove the wiring.
    report = engine.run_task("T001")
    ok = report.final_verdict in (Verdict.PASS, Verdict.REWORK)
    print(f"smoke cycle   : T001 -> {report.final_verdict.value if report.final_verdict else 'NONE'}")
    print("selftest      : OK" if ok else "selftest      : FAILED")
    return 0 if ok else 1


def cmd_tasks(args: argparse.Namespace) -> int:
    bank = TaskBank()
    tasks = bank.by_category(args.category) if args.category else bank.all()
    if args.category and not tasks:
        print(f"No such category: {args.category}. Known: {', '.join(bank.categories())}")
        return 1
    for t in tasks:
        print(f"{t.id}  [{t.category:11}]  {t.title}")
    print(f"\n{len(tasks)} task(s).")
    return 0


def cmd_run(args: argparse.Namespace) -> int:
    engine = _engine(args)
    report = engine.run_text(args.text)
    _print_report(report, args.json)
    return 0 if report.final_verdict is not Verdict.BLOCK else 2


def cmd_run_task(args: argparse.Namespace) -> int:
    engine = _engine(args)
    try:
        report = engine.run_task(args.task_id)
    except KeyError as exc:
        print(str(exc))
        return 1
    _print_report(report, args.json)
    return 0 if report.final_verdict is not Verdict.BLOCK else 2


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="verdikvern", description="KUTT24 Memory-Bound Value Engine")
    p.add_argument("--live", action="store_true", help="Use the live Claude backend (requires ANTHROPIC_API_KEY).")
    sub = p.add_subparsers(dest="command", required=True)

    sp = sub.add_parser("selftest", help="Verify wiring in mock mode.")
    sp.set_defaults(func=cmd_selftest)

    sp = sub.add_parser("tasks", help="List the task bank.")
    sp.add_argument("--category", help="Filter by category.")
    sp.set_defaults(func=cmd_tasks)

    sp = sub.add_parser("run", help="Run free-text input through the engine.")
    sp.add_argument("text", help="The objective text.")
    sp.add_argument("--json", action="store_true", help="Emit JSON.")
    sp.set_defaults(func=cmd_run)

    sp = sub.add_parser("run-task", help="Run a task from the bank by id.")
    sp.add_argument("task_id", help="Task id, e.g. T001.")
    sp.add_argument("--json", action="store_true", help="Emit JSON.")
    sp.set_defaults(func=cmd_run_task)

    return p


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv if argv is not None else sys.argv[1:])
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
