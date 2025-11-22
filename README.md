# Fast Task Master

A lightning-fast, lightweight CLI task management tool built for speed and simplicity.

## Features

- **Fast**: Uses Python standard library only - no external dependencies
- **Lightweight**: Single file, minimal overhead
- **Colorful**: Beautiful terminal output with color-coded priorities
- **Simple**: Intuitive command-line interface
- **Persistent**: JSON-based storage in your home directory

## Installation

No installation required! Just Python 3.6+

```bash
git clone <repository-url>
cd Tet
chmod +x taskmaster.py
```

## Usage

### Add a task
```bash
python taskmaster.py add "Complete project documentation"
python taskmaster.py add "Fix critical bug" high
python taskmaster.py add "Update dependencies" low
```

### List tasks
```bash
# List all tasks
python taskmaster.py list

# List only pending tasks
python taskmaster.py list pending

# List only completed tasks
python taskmaster.py list completed
```

### Complete a task
```bash
python taskmaster.py done 1
```

### Delete a task
```bash
python taskmaster.py delete 2
```

### Clear completed tasks
```bash
python taskmaster.py clear
```

### View statistics
```bash
python taskmaster.py stats
```

## Priority Levels

- **high** - Urgent tasks (red)
- **medium** - Normal tasks (yellow) - default
- **low** - Low priority tasks (blue)

## Quick Examples

```bash
# Add tasks with different priorities
python taskmaster.py add "Emergency fix" high
python taskmaster.py add "Code review"
python taskmaster.py add "Refactor old code" low

# Check your tasks
python taskmaster.py list

# Complete task #1
python taskmaster.py done 1

# See your progress
python taskmaster.py stats

# Clean up completed tasks
python taskmaster.py clear
```

## Data Storage

Tasks are stored in `~/.tasks.json` in your home directory.

## Why Fast Task Master?

- No database setup required
- No external dependencies
- Instant startup time
- Minimal resource usage
- Perfect for quick task tracking

## License

MIT
