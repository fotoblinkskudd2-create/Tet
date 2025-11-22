#!/usr/bin/env python3
"""
Fast Task Master - A lightweight, high-performance CLI task manager
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# ANSI color codes for fast terminal output
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'

class TaskMaster:
    def __init__(self, data_file: str = ".tasks.json"):
        self.data_file = Path.home() / data_file if not os.path.isabs(data_file) else Path(data_file)
        self.tasks: List[Dict] = []
        self._load()

    def _load(self):
        """Fast load from JSON file"""
        if self.data_file.exists():
            try:
                with open(self.data_file, 'r') as f:
                    self.tasks = json.load(f)
            except json.JSONDecodeError:
                self.tasks = []
        else:
            self.tasks = []

    def _save(self):
        """Fast save to JSON file"""
        with open(self.data_file, 'w') as f:
            json.dump(self.tasks, f, indent=2)

    def add(self, description: str, priority: str = "medium"):
        """Add a new task"""
        task = {
            "id": len(self.tasks) + 1,
            "description": description,
            "priority": priority,
            "status": "pending",
            "created": datetime.now().isoformat(),
            "completed": None
        }
        self.tasks.append(task)
        self._save()
        print(f"{Colors.GREEN}✓{Colors.RESET} Task #{task['id']} added: {Colors.BOLD}{description}{Colors.RESET}")

    def list(self, filter_status: Optional[str] = None):
        """List all tasks"""
        if not self.tasks:
            print(f"{Colors.YELLOW}No tasks found.{Colors.RESET}")
            return

        filtered_tasks = self.tasks
        if filter_status:
            filtered_tasks = [t for t in self.tasks if t['status'] == filter_status]

        if not filtered_tasks:
            print(f"{Colors.YELLOW}No {filter_status} tasks found.{Colors.RESET}")
            return

        print(f"\n{Colors.BOLD}{'ID':<5} {'Status':<12} {'Priority':<10} {'Description'}{Colors.RESET}")
        print("─" * 80)

        for task in filtered_tasks:
            status_color = Colors.GREEN if task['status'] == 'completed' else Colors.CYAN
            priority_color = (Colors.RED if task['priority'] == 'high'
                            else Colors.YELLOW if task['priority'] == 'medium'
                            else Colors.BLUE)

            status_icon = "✓" if task['status'] == 'completed' else "○"

            print(f"{task['id']:<5} {status_color}{status_icon} {task['status']:<10}{Colors.RESET} "
                  f"{priority_color}{task['priority']:<10}{Colors.RESET} {task['description']}")
        print()

    def complete(self, task_id: int):
        """Mark task as completed"""
        for task in self.tasks:
            if task['id'] == task_id:
                if task['status'] == 'completed':
                    print(f"{Colors.YELLOW}Task #{task_id} already completed.{Colors.RESET}")
                    return
                task['status'] = 'completed'
                task['completed'] = datetime.now().isoformat()
                self._save()
                print(f"{Colors.GREEN}✓ Task #{task_id} completed!{Colors.RESET}")
                return
        print(f"{Colors.RED}✗ Task #{task_id} not found.{Colors.RESET}")

    def delete(self, task_id: int):
        """Delete a task"""
        for i, task in enumerate(self.tasks):
            if task['id'] == task_id:
                desc = task['description']
                self.tasks.pop(i)
                self._save()
                print(f"{Colors.RED}✗{Colors.RESET} Task #{task_id} deleted: {desc}")
                return
        print(f"{Colors.RED}✗ Task #{task_id} not found.{Colors.RESET}")

    def clear_completed(self):
        """Clear all completed tasks"""
        before = len(self.tasks)
        self.tasks = [t for t in self.tasks if t['status'] != 'completed']
        after = len(self.tasks)
        removed = before - after
        self._save()
        print(f"{Colors.GREEN}✓ Removed {removed} completed task(s).{Colors.RESET}")

    def stats(self):
        """Show task statistics"""
        total = len(self.tasks)
        pending = sum(1 for t in self.tasks if t['status'] == 'pending')
        completed = sum(1 for t in self.tasks if t['status'] == 'completed')

        high = sum(1 for t in self.tasks if t['priority'] == 'high' and t['status'] == 'pending')
        medium = sum(1 for t in self.tasks if t['priority'] == 'medium' and t['status'] == 'pending')
        low = sum(1 for t in self.tasks if t['priority'] == 'low' and t['status'] == 'pending')

        print(f"\n{Colors.BOLD}Task Statistics{Colors.RESET}")
        print("─" * 40)
        print(f"Total tasks:      {total}")
        print(f"{Colors.CYAN}Pending:          {pending}{Colors.RESET}")
        print(f"{Colors.GREEN}Completed:        {completed}{Colors.RESET}")
        print(f"\n{Colors.BOLD}Pending by Priority:{Colors.RESET}")
        print(f"{Colors.RED}High:             {high}{Colors.RESET}")
        print(f"{Colors.YELLOW}Medium:           {medium}{Colors.RESET}")
        print(f"{Colors.BLUE}Low:              {low}{Colors.RESET}")
        print()


def main():
    """Fast CLI entry point"""
    tm = TaskMaster()

    if len(sys.argv) < 2:
        print(f"{Colors.BOLD}Fast Task Master{Colors.RESET} - Lightning-fast task management\n")
        print("Usage:")
        print(f"  {Colors.CYAN}python taskmaster.py add <description> [priority]{Colors.RESET}")
        print(f"  {Colors.CYAN}python taskmaster.py list [pending|completed]{Colors.RESET}")
        print(f"  {Colors.CYAN}python taskmaster.py done <task_id>{Colors.RESET}")
        print(f"  {Colors.CYAN}python taskmaster.py delete <task_id>{Colors.RESET}")
        print(f"  {Colors.CYAN}python taskmaster.py clear{Colors.RESET}")
        print(f"  {Colors.CYAN}python taskmaster.py stats{Colors.RESET}")
        print(f"\nPriority: high, medium (default), low")
        return

    command = sys.argv[1].lower()

    if command == "add":
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Description required{Colors.RESET}")
            return
        description = " ".join(sys.argv[2:])
        priority = "medium"

        # Check if last word is a priority
        if sys.argv[-1].lower() in ['high', 'medium', 'low']:
            priority = sys.argv[-1].lower()
            description = " ".join(sys.argv[2:-1])

        tm.add(description, priority)

    elif command == "list" or command == "ls":
        filter_status = sys.argv[2] if len(sys.argv) > 2 else None
        tm.list(filter_status)

    elif command == "done" or command == "complete":
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Task ID required{Colors.RESET}")
            return
        try:
            task_id = int(sys.argv[2])
            tm.complete(task_id)
        except ValueError:
            print(f"{Colors.RED}Error: Invalid task ID{Colors.RESET}")

    elif command == "delete" or command == "rm":
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Task ID required{Colors.RESET}")
            return
        try:
            task_id = int(sys.argv[2])
            tm.delete(task_id)
        except ValueError:
            print(f"{Colors.RED}Error: Invalid task ID{Colors.RESET}")

    elif command == "clear":
        tm.clear_completed()

    elif command == "stats":
        tm.stats()

    else:
        print(f"{Colors.RED}Unknown command: {command}{Colors.RESET}")


if __name__ == "__main__":
    main()
