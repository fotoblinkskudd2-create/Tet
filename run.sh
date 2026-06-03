#!/usr/bin/env bash
# run.sh — Start the Tet multi-agent extension system
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- Validate environment ---
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "ERROR: ANTHROPIC_API_KEY is not set."
    echo "  export ANTHROPIC_API_KEY=sk-ant-..."
    exit 1
fi

# --- Install dependencies ---
echo "Installing dependencies..."
pip install -q "anthropic>=0.40.0"

# --- Ensure we're on the right branch ---
BRANCH="claude/multi-agent-system-J1dzL"
CURRENT=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
if [[ "$CURRENT" != "$BRANCH" ]]; then
    echo "Switching to branch $BRANCH..."
    git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH"
fi

# --- Create log directory ---
mkdir -p logs

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  Tet Multi-Agent System Starting     ║"
echo "║  Branch: $BRANCH"
echo "║  Monitor: python monitor.py          ║"
echo "║  Logs:    ./logs/                    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Run in background if --daemon flag is passed
if [[ "${1:-}" == "--daemon" ]]; then
    LOG_FILE="logs/orchestrator_$(date +%Y%m%d_%H%M%S).log"
    echo "Running as daemon. Logs: $LOG_FILE"
    nohup python orchestrator.py > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > logs/orchestrator.pid
    echo "Started PID $PID"
else
    exec python orchestrator.py
fi
