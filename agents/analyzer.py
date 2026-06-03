"""Analyzer agent - reads app.py and proposes concrete new solver features."""
from __future__ import annotations
import json
from pathlib import Path

import anthropic

from .base import BaseAgent
import config

_SYSTEM = """You are a senior Python developer analyzing a CLI problem-solving app.
Propose self-contained, testable solver extensions. Output only valid JSON arrays."""

_PROMPT = """Current app.py:

```python
{code}
```

Propose exactly 3 new solver functions to add. Each must be:
- A `_solve_*` function returning `Optional[Solution]`
- Detected via regex on the user's input string
- Self-contained (no network calls, no random output)
- Fully deterministic so tests are reliable

Good ideas: unit converter, base converter (binary/hex/octal), roman numerals,
palindrome checker, word counter, caesar cipher, factorial/fibonacci.
Bad ideas: weather, currency rates, random jokes, passwords.

Return a JSON array of exactly 3 objects:
[
  {{
    "name": "_solve_unit_converter",
    "description": "Convert between common units (km/miles, kg/lbs, C/F)",
    "trigger_patterns": ["5 km to miles", "100 fahrenheit to celsius"],
    "test_cases": [
      {{"input": "5 km to miles", "expected_contains": "3.1"}},
      {{"input": "100 fahrenheit to celsius", "expected_contains": "37.7"}}
    ]
  }}
]

Return ONLY the JSON array. No markdown, no explanation."""


class AnalyzerAgent(BaseAgent):
    def __init__(self, client: anthropic.Anthropic):
        super().__init__(client, model=config.MODEL_FAST)

    def run(self, task_data: dict) -> dict:
        code = Path(config.APP_FILE).read_text()
        prompt = _PROMPT.format(code=code)

        raw = self.call_claude(
            messages=[{"role": "user", "content": prompt}],
            system=_SYSTEM,
            max_tokens=2048,
        )

        text = raw.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.rsplit("```", 1)[0]

        proposals = json.loads(text.strip())
        self.logger.info("Proposed %d features: %s", len(proposals), [p["name"] for p in proposals])

        return {"proposals": proposals}
