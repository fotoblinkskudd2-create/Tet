"""
CLI monitoring dashboard for the Tet multi-agent system.
Run in a separate terminal: python monitor.py
"""
from __future__ import annotations
import json
import sys
import time
from datetime import datetime

from state import StateManager


_LEVEL_ICON = {"INFO": "ℹ", "WARNING": "⚠", "ERROR": "✗"}
_STATUS_ICON = {"done": "✅", "failed": "❌", "pending": "⏳", "running": "🔄"}


def _bar(value: int, total: int, width: int = 20) -> str:
    if total == 0:
        return "─" * width
    filled = int(width * value / total)
    return "█" * filled + "░" * (width - filled)


def render(state: StateManager):
    print("\033[2J\033[H", end="")  # clear screen
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    stats = state.get_stats()
    logs = list(state.get_recent_logs(15))
    cycles = list(state.get_cycles(5))

    print(f"╔{'═'*58}╗")
    print(f"║  TET MULTI-AGENT SYSTEM          {now}  ║")
    print(f"╠{'═'*58}╣")

    total = stats["total"] or 1
    print(f"║  Tasks                                                    ║")
    print(f"║  ✅ Done    {stats['done']:3d}  {_bar(stats['done'], total):<20}  {stats['done']/total*100:5.1f}%  ║")
    print(f"║  ❌ Failed  {stats['failed']:3d}  {_bar(stats['failed'], total):<20}  {stats['failed']/total*100:5.1f}%  ║")
    print(f"║  ⏳ Pending {stats['pending']:3d}  {_bar(stats['pending'], total):<20}                ║")
    print(f"║  🔄 Running {stats['running']:3d}                                         ║")

    if cycles:
        print(f"╠{'═'*58}╣")
        print(f"║  Recent Cycles                                            ║")
        for c in cycles[:3]:
            features = json.loads(c["features_added"] or "[]")
            feat_str = ", ".join(features) if features else "—"
            ts = (c["started_at"] or "")[:16]
            print(f"║  #{c['cycle_number']:3d} {ts}  +{c['tasks_completed']} feat  {feat_str[:28]:<28}║")

    print(f"╠{'═'*58}╣")
    print(f"║  Agent Log                                                ║")
    for log in reversed(logs):
        icon = _LEVEL_ICON.get(log["level"], "•")
        ts = (log["timestamp"] or "")[:16]
        agent = log["agent"][:12]
        msg = log["message"][:34]
        print(f"║  {icon} {ts} [{agent:<12}] {msg:<34}║")

    print(f"╚{'═'*58}╝")
    print("  Ctrl+C to exit | refreshing every 10s", end="", flush=True)


def main():
    state = StateManager()
    try:
        while True:
            render(state)
            time.sleep(10)
    except KeyboardInterrupt:
        print("\nMonitor stopped.")


if __name__ == "__main__":
    main()
