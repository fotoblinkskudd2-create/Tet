from __future__ import annotations

import json
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Callable

from core.logger import setup_logger


# ---------------------------------------------------------------------------
# HTML template
# ---------------------------------------------------------------------------

def _render_dashboard(state: dict) -> str:
    stats = state.get("queue_stats", {})
    agents = state.get("agents", {})
    uptime_s = state.get("uptime", 0)

    h, rem = divmod(int(uptime_s), 3600)
    m, s = divmod(rem, 60)
    uptime_str = f"{h:02d}h {m:02d}m {s:02d}s"

    agent_rows = ""
    for name, info in sorted(agents.items()):
        alive = info.get("alive", False)
        status_label = "RUNNING" if alive else "DEAD"
        color = "#2ecc71" if alive else "#e74c3c"
        processed = info.get("tasks_processed", "–")
        failed = info.get("tasks_failed", "–")
        hb = f"{info.get('heartbeat_age', 0):.0f}s ago"
        agent_rows += (
            f"<tr>"
            f"<td>{name}</td>"
            f"<td style='color:{color};font-weight:600'>{status_label}</td>"
            f"<td>{processed}</td>"
            f"<td>{failed}</td>"
            f"<td>{hb}</td>"
            f"</tr>"
        )

    by_type = stats.get("by_type", {})
    type_rows = ""
    for ttype, counts in sorted(by_type.items()):
        done = counts.get("completed", 0)
        fail = counts.get("failed", 0)
        pend = counts.get("pending", 0)
        prog = counts.get("in_progress", 0)
        type_rows += (
            f"<tr><td>{ttype}</td>"
            f"<td>{pend}</td><td>{prog}</td>"
            f"<td style='color:#2ecc71'>{done}</td>"
            f"<td style='color:#e74c3c'>{fail}</td></tr>"
        )

    recent_rows = ""
    for t in stats.get("recent", [])[:12]:
        status = t.get("status", "")
        colour = {
            "completed": "#2ecc71",
            "failed": "#e74c3c",
            "in_progress": "#f39c12",
            "pending": "#8b949e",
        }.get(status, "#c9d1d9")
        ts = (t.get("created_at") or "")[:19].replace("T", " ")
        recent_rows += (
            f"<tr>"
            f"<td>{t.get('id')}</td>"
            f"<td>{t.get('task_type')}</td>"
            f"<td style='color:{colour};font-weight:600'>{status}</td>"
            f"<td>{ts}</td>"
            f"</tr>"
        )

    now_utc = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="10">
<title>Multi-Agent Dashboard</title>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'Courier New',monospace;background:#0d1117;color:#c9d1d9;padding:24px}}
  h1{{color:#58a6ff;font-size:1.4rem;border-bottom:1px solid #30363d;padding-bottom:10px;margin-bottom:6px}}
  h2{{color:#79c0ff;font-size:1rem;margin:28px 0 10px}}
  .meta{{color:#8b949e;font-size:.8rem;margin-bottom:20px}}
  .grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:6px}}
  .card{{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;text-align:center}}
  .card .val{{font-size:2.2rem;font-weight:700;color:#58a6ff}}
  .card.ok .val{{color:#2ecc71}}
  .card.err .val{{color:#e74c3c}}
  .card .lbl{{color:#8b949e;font-size:.75rem;margin-top:4px;letter-spacing:.05em;text-transform:uppercase}}
  table{{width:100%;border-collapse:collapse;background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;font-size:.85rem}}
  th{{background:#21262d;color:#79c0ff;padding:9px 12px;text-align:left;font-weight:600}}
  td{{padding:7px 12px;border-top:1px solid #21262d}}
  tr:hover td{{background:#1c2128}}
  .uptime{{float:right;color:#8b949e;font-size:.85rem;font-weight:normal}}
</style>
</head>
<body>
<h1>Multi-Agent System <span class="uptime">Uptime: {uptime_str}</span></h1>
<p class="meta">Auto-refresh every 10 s &nbsp;|&nbsp; {now_utc}</p>

<div class="grid">
  <div class="card"><div class="val">{stats.get('pending',0)}</div><div class="lbl">Pending</div></div>
  <div class="card"><div class="val">{stats.get('in_progress',0)}</div><div class="lbl">In Progress</div></div>
  <div class="card ok"><div class="val">{stats.get('completed',0)}</div><div class="lbl">Completed</div></div>
  <div class="card err"><div class="val">{stats.get('failed',0)}</div><div class="lbl">Failed</div></div>
</div>

<h2>Agents</h2>
<table>
<thead><tr><th>Name</th><th>Status</th><th>Processed</th><th>Failed</th><th>Last heartbeat</th></tr></thead>
<tbody>{agent_rows}</tbody>
</table>

<h2>Throughput by Type</h2>
<table>
<thead><tr><th>Type</th><th>Pending</th><th>Running</th><th>Completed</th><th>Failed</th></tr></thead>
<tbody>{type_rows}</tbody>
</table>

<h2>Recent Tasks</h2>
<table>
<thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Created (UTC)</th></tr></thead>
<tbody>{recent_rows}</tbody>
</table>
</body>
</html>"""


# ---------------------------------------------------------------------------
# HTTP server
# ---------------------------------------------------------------------------

class DashboardServer:
    def __init__(self, port: int, state_fn: Callable[[], dict], config: dict) -> None:
        self.port = port
        self.state_fn = state_fn
        self.config = config
        self.logger = setup_logger("dashboard", config["log_dir"])
        self._server: HTTPServer | None = None
        self._thread: threading.Thread | None = None
        self.status = "stopped"
        self.last_heartbeat: float = time.time()

    def _make_handler(self) -> type:
        state_fn = self.state_fn

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self) -> None:
                self.server.last_req = time.time()  # type: ignore[attr-defined]
                if self.path in ("/api/status", "/status"):
                    body = json.dumps(state_fn(), default=str).encode()
                    self._respond(200, "application/json", body)
                elif self.path == "/health":
                    self._respond(200, "text/plain", b"ok")
                else:
                    body = _render_dashboard(state_fn()).encode()
                    self._respond(200, "text/html; charset=utf-8", body)

            def _respond(self, code: int, ctype: str, body: bytes) -> None:
                self.send_response(code)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *_: object) -> None:  # silence access log
                pass

        return Handler

    def start(self) -> None:
        handler = self._make_handler()
        self._server = HTTPServer(("0.0.0.0", self.port), handler)
        self._thread = threading.Thread(
            target=self._server.serve_forever, daemon=True, name="dashboard"
        )
        self._thread.start()
        self.status = "running"
        self.logger.info(f"Dashboard → http://localhost:{self.port}/")

    def stop(self) -> None:
        if self._server:
            self._server.shutdown()
        self.status = "stopped"

    def is_alive(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def heartbeat_age(self) -> float:
        return time.time() - self.last_heartbeat
