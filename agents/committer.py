"""Committer agent - stages, commits, and pushes approved changes."""
from __future__ import annotations
import subprocess
import time
from pathlib import Path

import anthropic

from .base import BaseAgent
import config


def _git(args: list[str], cwd: str) -> subprocess.CompletedProcess:
    return subprocess.run(args, capture_output=True, text=True, cwd=cwd)


class CommitterAgent(BaseAgent):
    def __init__(self, client: anthropic.Anthropic):
        super().__init__(client, model=config.MODEL_FAST)

    def run(self, task_data: dict) -> dict:
        proposal = task_data.get("proposal", {})
        base_dir = str(Path(config.APP_FILE).parent)

        # Stage app.py
        add = _git(["git", "add", "app.py"], base_dir)
        if add.returncode != 0:
            raise RuntimeError(f"git add failed: {add.stderr}")

        # Nothing staged?
        diff = _git(["git", "diff", "--staged", "--stat"], base_dir)
        if not diff.stdout.strip():
            self.logger.info("Nothing staged to commit.")
            return {**task_data, "committed": False, "reason": "nothing to commit"}

        # Commit
        msg = (
            f"{config.GIT_COMMIT_PREFIX} Add {proposal.get('name', 'solver')}: "
            f"{proposal.get('description', '')}"
        )
        commit = _git(["git", "commit", "-m", msg], base_dir)
        if commit.returncode != 0:
            raise RuntimeError(f"git commit failed: {commit.stderr}")
        self.logger.info("Committed: %s", commit.stdout.strip())

        # Push with exponential-backoff retry
        push_result = None
        for attempt in range(4):
            push_result = _git(
                ["git", "push", "-u", "origin", config.GIT_BRANCH], base_dir
            )
            if push_result.returncode == 0:
                break
            wait = 2 ** (attempt + 1)
            self.logger.warning("Push failed (attempt %d/4). Retrying in %ds.", attempt + 1, wait)
            time.sleep(wait)

        pushed = push_result.returncode == 0 if push_result else False
        if not pushed:
            self.logger.error("Push failed after retries: %s", push_result.stderr if push_result else "")

        return {
            **task_data,
            "committed": True,
            "pushed": pushed,
            "commit_message": msg,
            "push_stderr": push_result.stderr[:500] if push_result else "",
        }
