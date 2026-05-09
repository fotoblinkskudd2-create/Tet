#!/usr/bin/env python3
"""
Submit a task to the running multi-agent system.

Examples:
    python submit_task.py math "2 ** 32 - 1"
    python submit_task.py creative "misty harbour at dusk" --medium photo
    python submit_task.py brainstorm "How to ship a product in 2 weeks"
    python submit_task.py panic "feeling overwhelmed"
    python submit_task.py status
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from core.config import load_config
from core.queue import TaskQueue


def _status(queue: TaskQueue) -> None:
    stats = queue.get_stats()
    print(f"\n{'='*50}")
    print(f"  Queue Status")
    print(f"{'='*50}")
    print(f"  Pending    : {stats['pending']}")
    print(f"  In progress: {stats['in_progress']}")
    print(f"  Completed  : {stats['completed']}")
    print(f"  Failed     : {stats['failed']}")
    print(f"\n  By type:")
    for t, counts in stats.get("by_type", {}).items():
        done = counts.get("completed", 0)
        fail = counts.get("failed", 0)
        pend = counts.get("pending", 0)
        print(f"    {t:<15} pend={pend} done={done} fail={fail}")
    print(f"\n  Recent tasks:")
    for t in stats.get("recent", [])[:8]:
        ts = (t.get("created_at") or "")[:19]
        print(f"    #{t['id']:>4} [{t['task_type']:<12}] {t['status']:<12} {ts}")
    print()


def main() -> None:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd")

    m = sub.add_parser("math", help="Submit a math expression")
    m.add_argument("expression")
    m.add_argument("--priority", type=int, default=8)

    c = sub.add_parser("creative", help="Submit a creative prompt task")
    c.add_argument("seed")
    c.add_argument("--medium", choices=["photo", "video", "music", "art", "poem"], default="art")
    c.add_argument("--priority", type=int, default=8)

    b = sub.add_parser("brainstorm", help="Submit a brainstorm task")
    b.add_argument("problem")
    b.add_argument("--priority", type=int, default=7)

    pk = sub.add_parser("panic", help="Submit a panic-support task")
    pk.add_argument("context", nargs="?", default="General support requested")
    pk.add_argument("--priority", type=int, default=10)

    sub.add_parser("status", help="Show queue status")

    args = p.parse_args()
    if not args.cmd:
        p.print_help()
        sys.exit(1)

    config = load_config()
    queue = TaskQueue(config["db_path"])

    if args.cmd == "status":
        _status(queue)
        return

    if args.cmd == "math":
        tid = queue.enqueue("math", {"expression": args.expression}, args.priority)
        print(f"Submitted math task #{tid}: {args.expression}")

    elif args.cmd == "creative":
        tid = queue.enqueue("creative", {"seed": args.seed, "medium": args.medium}, args.priority)
        print(f"Submitted creative task #{tid} [{args.medium}]: {args.seed}")

    elif args.cmd == "brainstorm":
        tid = queue.enqueue("brainstorm", {"problem": args.problem}, args.priority)
        print(f"Submitted brainstorm task #{tid}: {args.problem}")

    elif args.cmd == "panic":
        tid = queue.enqueue("panic", {"context": args.context}, args.priority)
        print(f"Submitted panic task #{tid}: {args.context}")


if __name__ == "__main__":
    main()
