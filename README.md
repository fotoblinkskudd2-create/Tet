# Tet - Simple Time Tracker

A lightweight command-line time tracking tool that's quick and easy to use.

## Features

- ⏱️ Start/stop task timers
- 📊 View current task status
- 📋 List recent completed tasks
- 💾 Automatic task history persistence

## Usage

```bash
# Start tracking a task
python timetrack.py start "Writing documentation"

# Check current status
python timetrack.py status

# Stop the current task
python timetrack.py stop

# List recent tasks
python timetrack.py list
```

## Example Session

```bash
$ python timetrack.py start "Fix bug in login"
✓ Started tracking: Fix bug in login

$ python timetrack.py status
⏱️  Currently tracking: Fix bug in login
   Started: 2025-12-11 14:30:15
   Elapsed: 5m 23s

$ python timetrack.py stop
✓ Stopped: Fix bug in login
  Duration: 15m 47s

$ python timetrack.py list
📋 Recent Tasks:
------------------------------------------------------------
Fix bug in login
  2025-12-11 14:30:15 → 2025-12-11 14:46:02
  Duration: 15m 47s
```

## Data Storage

Tasks are saved to `~/.timetrack.json` in your home directory.

## Why I Like This Tool

- **Fast**: Single command to start/stop tracking
- **Minimal**: No complex setup or dependencies
- **Portable**: Just one Python file
- **Private**: Data stays local on your machine
