#!/usr/bin/env bash
# setup.sh — bootstrap and start the multi-agent system
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=============================================="
echo "  Multi-Agent Autonomous System — Setup"
echo "=============================================="
echo ""

# ── 1. Python check ──────────────────────────────
PYTHON=$(command -v python3 || command -v python || true)
if [[ -z "$PYTHON" ]]; then
  echo "ERROR: Python 3.9+ is required but not found." >&2
  exit 1
fi
PY_VER=$("$PYTHON" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Python: $PYTHON ($PY_VER)"

# ── 2. Create required directories ───────────────
mkdir -p data logs reports tasks/inbox
echo "Directories: data/ logs/ reports/ tasks/inbox/ — OK"

# ── 3. Smoke-test imports ────────────────────────
"$PYTHON" -c "
import sqlite3, threading, http.server, json, logging, pathlib, signal, ast, operator
print('stdlib imports: OK')
"

# ── 4. Verify module imports ─────────────────────
"$PYTHON" -c "
import sys; sys.path.insert(0, '.')
from core.config  import load_config
from core.queue   import TaskQueue
from core.logger  import setup_logger
from agents.base_agent      import BaseAgent
from agents.math_agent      import MathAgent
from agents.creative_agent  import CreativeAgent
from agents.brainstorm_agent import BrainstormAgent
from agents.panic_agent     import PanicAgent
from agents.task_generator  import TaskGeneratorAgent
from agents.health_agent    import HealthAgent
from agents.report_agent    import ReportAgent
from dashboard.server       import DashboardServer
print('module imports: OK')
"

echo ""
echo "=============================================="
echo "  Setup complete — ready to launch"
echo "=============================================="
echo ""
echo "Start the system:"
echo "  python run_system.py"
echo ""
echo "Override dashboard port:"
echo "  python run_system.py --port 9090"
echo ""
echo "Submit tasks:"
echo "  python submit_task.py math \"355 / 113\""
echo "  python submit_task.py creative \"foggy harbour\" --medium photo"
echo "  python submit_task.py brainstorm \"How to ship faster\""
echo "  python submit_task.py panic \"feeling overwhelmed\""
echo "  python submit_task.py status"
echo ""
echo "Or drop a JSON file into tasks/inbox/:"
echo '  echo '"'"'{"type":"math","payload":{"expression":"2**20"},"priority":9}'"'"' > tasks/inbox/my_task.json'
echo ""
echo "Dashboard: http://localhost:8080/"
echo "Health endpoint: http://localhost:8080/health"
echo "JSON API: http://localhost:8080/api/status"
echo ""

# ── 5. Optional: auto-start ───────────────────────
if [[ "${AUTO_START:-}" == "1" ]]; then
  echo "AUTO_START=1 — launching system..."
  exec "$PYTHON" run_system.py "$@"
fi
