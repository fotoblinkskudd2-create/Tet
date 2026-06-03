"""Developer agent - implements a proposed solver in app.py."""
from __future__ import annotations
import json
from pathlib import Path

import anthropic

from .base import BaseAgent
import config

_SYSTEM = """You are an expert Python developer extending a CLI problem-solving app.
Write clean, type-hinted Python that matches the existing style exactly.
Return ONLY the complete updated app.py content — no markdown, no explanations."""

_PROMPT = """Current app.py:

```python
{code}
```

Implement this new solver:
{proposal}

Rules:
1. Add `{name}(problem: str) -> Optional[Solution]` following the exact style of existing solvers.
2. Register it inside `solve_problem()` in the for-loop list (before the brainstorm fallback).
3. Handle edge cases with a try/except that returns None on failure.
4. These test cases MUST pass: {test_cases}

Return the COMPLETE updated app.py. Start with the `\"\"\"` module docstring — no code fences."""


class DeveloperAgent(BaseAgent):
    def __init__(self, client: anthropic.Anthropic):
        super().__init__(client, model=config.MODEL_SMART)

    def run(self, task_data: dict) -> dict:
        proposal = task_data["proposal"]
        code = Path(config.APP_FILE).read_text()

        prompt = _PROMPT.format(
            code=code,
            proposal=json.dumps(proposal, indent=2),
            name=proposal["name"],
            test_cases=json.dumps(proposal.get("test_cases", [])),
        )

        new_code = self.call_claude(
            messages=[{"role": "user", "content": prompt}],
            system=_SYSTEM,
            max_tokens=8192,
        )

        new_code = new_code.strip()
        for fence in ("```python", "```"):
            if new_code.startswith(fence):
                new_code = new_code[len(fence):]
                break
        if new_code.endswith("```"):
            new_code = new_code[:-3]
        new_code = new_code.strip()

        compile(new_code, "app.py", "exec")  # raises SyntaxError if broken

        Path(config.APP_FILE).write_text(new_code)
        self.logger.info("Wrote updated app.py (%d chars)", len(new_code))

        return {**task_data, "code_written": True, "new_code_length": len(new_code)}
