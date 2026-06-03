"""Reviewer agent - checks code quality and style consistency."""
from __future__ import annotations
import json
from pathlib import Path

import anthropic

from .base import BaseAgent
import config

_SYSTEM = "You are a Python code reviewer. Be concise. Output only valid JSON."

_PROMPT = """Review the new solver `{name}` added to app.py.

Tail of updated app.py (where the new code lives):
```python
{tail}
```

Check:
1. Does `{name}` return `Optional[Solution]`?
2. Is it added to the `solve_problem()` solver list?
3. Does it handle exceptions gracefully (returns None on failure)?
4. Does it match the existing code style?

Return: {{"approved": true/false, "issues": ["..."], "summary": "one line"}}
Return ONLY JSON."""


class ReviewerAgent(BaseAgent):
    def __init__(self, client: anthropic.Anthropic):
        super().__init__(client, model=config.MODEL_FAST)

    def run(self, task_data: dict) -> dict:
        proposal = task_data.get("proposal", {})
        name = proposal.get("name", "unknown")
        code = Path(config.APP_FILE).read_text()
        tail = code[-3500:]

        raw = self.call_claude(
            messages=[{"role": "user", "content": _PROMPT.format(name=name, tail=tail)}],
            system=_SYSTEM,
            max_tokens=512,
        )

        text = raw.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.rsplit("```", 1)[0]

        review = json.loads(text.strip())
        approved = review.get("approved", False)
        self.logger.info("Review for %s: approved=%s  %s", name, approved, review.get("summary", ""))

        return {**task_data, "review": review, "approved": approved}
