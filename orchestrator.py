"""
Multi-agent orchestrator for the Tet extension system.

Pipeline per cycle:
  AnalyzerAgent → proposals → DeveloperAgent → TesterAgent → ReviewerAgent → CommitterAgent
"""
from __future__ import annotations
import logging
import logging.handlers
import sys
import time
from datetime import datetime
from pathlib import Path

import anthropic

import config
from state import StateManager
from agents.analyzer import AnalyzerAgent
from agents.developer import DeveloperAgent
from agents.tester import TesterAgent
from agents.reviewer import ReviewerAgent
from agents.committer import CommitterAgent


def _setup_logging():
    Path(config.LOG_DIR).mkdir(exist_ok=True)
    log_file = Path(config.LOG_DIR) / f"orchestrator_{datetime.now().strftime('%Y%m%d')}.log"
    fmt = "%(asctime)s %(name)-22s %(levelname)-8s %(message)s"
    handlers = [
        logging.StreamHandler(sys.stdout),
        logging.handlers.RotatingFileHandler(log_file, maxBytes=10 * 1024 * 1024, backupCount=5),
    ]
    logging.basicConfig(level=logging.INFO, format=fmt, handlers=handlers)


def _run_pipeline(
    state: StateManager,
    task_id: int,
    task_data: dict,
    developer: DeveloperAgent,
    tester: TesterAgent,
    reviewer: ReviewerAgent,
    committer: CommitterAgent,
    logger: logging.Logger,
) -> str:
    """Run dev→test→review→commit for one proposal. Returns 'done' or 'failed'."""
    proposal = task_data["proposal"]
    name = proposal.get("name", "unknown")
    app_backup = Path(config.APP_FILE).read_text()

    try:
        logger.info("  [develop ] %s", name)
        state.update_task(task_id, "running")
        dev_data = developer.run(task_data)

        logger.info("  [test    ] %s", name)
        test_data = tester.run(dev_data)
        if not test_data.get("all_passed"):
            raise RuntimeError(
                f"Tests failed — pytest={test_data.get('pytest_passed')} "
                f"smoke={test_data.get('smoke_passed')}\n"
                f"{test_data.get('pytest_output', '')[-800:]}"
            )

        logger.info("  [review  ] %s", name)
        review_data = reviewer.run(test_data)
        if not review_data.get("approved"):
            issues = review_data.get("review", {}).get("issues", [])
            raise RuntimeError(f"Review rejected: {issues}")

        logger.info("  [commit  ] %s", name)
        final_data = committer.run(review_data)
        state.update_task(task_id, "done", final_data)
        state.log_agent_event("orchestrator", "INFO", f"Feature added: {name}")
        logger.info("  ✅ Done: %s", name)
        return "done"

    except Exception as exc:
        Path(config.APP_FILE).write_text(app_backup)  # rollback
        logger.error("  ❌ Failed: %s — %s", name, exc)
        state.log_agent_event("orchestrator", "ERROR", f"Feature failed: {name}: {exc}")

        task = state.get_task(task_id)
        state.increment_retries(task_id)
        if task and task.retries + 1 >= config.MAX_RETRIES:
            state.update_task(task_id, "failed", error=str(exc))
        else:
            state.update_task(task_id, "pending", error=str(exc))
        return "failed"


def run_cycle(
    state: StateManager,
    cycle_num: int,
    analyzer: AnalyzerAgent,
    developer: DeveloperAgent,
    tester: TesterAgent,
    reviewer: ReviewerAgent,
    committer: CommitterAgent,
    logger: logging.Logger,
):
    logger.info("═══ Cycle %d starting ═══", cycle_num)
    cycle_id = state.create_cycle(cycle_num)
    completed = failed = 0
    features_added: list[str] = []

    # --- Analysis phase ---
    pending_analyses = state.get_pending_tasks("analyze")
    if not pending_analyses:
        tid = state.create_task("analyze", {})
        pending_analyses = [state.get_task(tid)]
        logger.info("[analyze ] Created task #%d", tid)

    for analysis_task in pending_analyses[:1]:
        state.update_task(analysis_task.id, "running")
        try:
            result = analyzer.run(analysis_task.data)
            state.update_task(analysis_task.id, "done", result)
            proposals = result.get("proposals", [])
            logger.info("[analyze ] Got %d proposals", len(proposals))

            for p in proposals[: config.MAX_TASKS_PER_CYCLE]:
                tid = state.create_task("develop", {"proposal": p})
                logger.info("[analyze ] Queued develop task #%d: %s", tid, p.get("name"))

        except Exception as exc:
            logger.error("[analyze ] Analyzer failed: %s", exc, exc_info=True)
            state.update_task(analysis_task.id, "failed", error=str(exc))
            failed += 1

    # --- Development pipeline ---
    dev_tasks = state.get_pending_tasks("develop")
    logger.info("[pipeline] %d develop tasks queued", len(dev_tasks))

    for task in dev_tasks[: config.MAX_TASKS_PER_CYCLE]:
        name = task.data.get("proposal", {}).get("name", "?")
        logger.info("[pipeline] Processing task #%d: %s", task.id, name)
        outcome = _run_pipeline(
            state, task.id, task.data,
            developer, tester, reviewer, committer, logger
        )
        if outcome == "done":
            completed += 1
            features_added.append(name)
        else:
            failed += 1

    state.complete_cycle(cycle_id, completed, failed, features_added)
    stats = state.get_stats()
    logger.info(
        "═══ Cycle %d done: +%d features, %d failed | DB: %s ═══",
        cycle_num, completed, failed, stats,
    )


def main():
    _setup_logging()
    logger = logging.getLogger("orchestrator")

    if not config.ANTHROPIC_API_KEY:
        logger.error("ANTHROPIC_API_KEY not set. Export it before running.")
        sys.exit(1)

    logger.info("🚀 Tet multi-agent system starting")
    logger.info("   Branch:   %s", config.GIT_BRANCH)
    logger.info("   Interval: %ds", config.CYCLE_INTERVAL_SECONDS)
    logger.info("   Models:   fast=%s  smart=%s", config.MODEL_FAST, config.MODEL_SMART)

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    state = StateManager()

    analyzer = AnalyzerAgent(client)
    developer = DeveloperAgent(client)
    tester = TesterAgent(client)
    reviewer = ReviewerAgent(client)
    committer = CommitterAgent(client)

    cycle_num = 0
    while True:
        cycle_num += 1
        try:
            run_cycle(state, cycle_num, analyzer, developer, tester, reviewer, committer, logger)
        except KeyboardInterrupt:
            logger.info("Interrupted. Shutting down.")
            break
        except Exception as exc:
            logger.error("Cycle %d crashed unexpectedly: %s", cycle_num, exc, exc_info=True)

        logger.info("Sleeping %ds...", config.CYCLE_INTERVAL_SECONDS)
        try:
            time.sleep(config.CYCLE_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            logger.info("Interrupted during sleep. Shutting down.")
            break


if __name__ == "__main__":
    main()
