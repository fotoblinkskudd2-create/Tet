#!/usr/bin/env python3
"""
Simple Time Tracker - Track your tasks effortlessly
"""
import json
import time
from datetime import datetime, timedelta
from pathlib import Path

DATA_FILE = Path.home() / '.timetrack.json'

def load_data():
    """Load task data from file"""
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'tasks': [], 'current': None}

def save_data(data):
    """Save task data to file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def start_task(task_name):
    """Start tracking a new task"""
    data = load_data()

    if data['current']:
        print(f"⚠️  Already tracking: {data['current']['name']}")
        print("Stop current task first with: python timetrack.py stop")
        return

    data['current'] = {
        'name': task_name,
        'start': time.time(),
        'started_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    save_data(data)
    print(f"✓ Started tracking: {task_name}")

def stop_task():
    """Stop tracking current task"""
    data = load_data()

    if not data['current']:
        print("No active task to stop")
        return

    current = data['current']
    duration = time.time() - current['start']

    task = {
        'name': current['name'],
        'started_at': current['started_at'],
        'ended_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'duration_seconds': int(duration),
        'duration_formatted': format_duration(duration)
    }

    data['tasks'].append(task)
    data['current'] = None
    save_data(data)

    print(f"✓ Stopped: {task['name']}")
    print(f"  Duration: {task['duration_formatted']}")

def status():
    """Show current status"""
    data = load_data()

    if data['current']:
        current = data['current']
        elapsed = time.time() - current['start']
        print(f"⏱️  Currently tracking: {current['name']}")
        print(f"   Started: {current['started_at']}")
        print(f"   Elapsed: {format_duration(elapsed)}")
    else:
        print("No active task")

def list_tasks():
    """List recent tasks"""
    data = load_data()

    if not data['tasks']:
        print("No completed tasks yet")
        return

    print("\n📋 Recent Tasks:")
    print("-" * 60)

    # Show last 10 tasks
    for task in reversed(data['tasks'][-10:]):
        print(f"{task['name']}")
        print(f"  {task['started_at']} → {task['ended_at']}")
        print(f"  Duration: {task['duration_formatted']}\n")

def format_duration(seconds):
    """Format seconds into human-readable duration"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)

    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 or not parts:
        parts.append(f"{secs}s")

    return " ".join(parts)

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python timetrack.py start <task-name>  - Start tracking a task")
        print("  python timetrack.py stop               - Stop current task")
        print("  python timetrack.py status             - Show current status")
        print("  python timetrack.py list               - List recent tasks")
        sys.exit(1)

    command = sys.argv[1]

    if command == 'start':
        if len(sys.argv) < 3:
            print("Error: Please provide a task name")
            sys.exit(1)
        task_name = ' '.join(sys.argv[2:])
        start_task(task_name)

    elif command == 'stop':
        stop_task()

    elif command == 'status':
        status()

    elif command == 'list':
        list_tasks()

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
