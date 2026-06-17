"""Logging setup and lightweight performance-tracking helpers."""
from __future__ import annotations

import functools
import logging
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Callable, Optional, TypeVar

_CONFIGURED_LOGGERS: set = set()

F = TypeVar("F", bound=Callable[..., Any])


def get_logger(
    name: str,
    level: int = logging.INFO,
    log_file: Optional[str] = None,
) -> logging.Logger:
    """Return a configured logger, attaching handlers only once per name."""

    logger = logging.getLogger(name)
    if name in _CONFIGURED_LOGGERS:
        return logger

    logger.setLevel(level)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    if log_file:
        path = Path(log_file)
        path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = RotatingFileHandler(
            log_file, maxBytes=2_000_000, backupCount=3, encoding="utf-8"
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    logger.propagate = False
    _CONFIGURED_LOGGERS.add(name)
    return logger


def timed(logger: Optional[logging.Logger] = None) -> Callable[[F], F]:
    """Decorator that logs (or returns via attribute) a function's execution time.

    Usage:
        @timed(get_logger(__name__))
        def simulate(...): ...
    """

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start = time.perf_counter()
            result = func(*args, **kwargs)
            elapsed = time.perf_counter() - start
            wrapper.last_duration_seconds = elapsed  # type: ignore[attr-defined]
            if logger is not None:
                logger.debug("%s completed in %.4fs", func.__qualname__, elapsed)
            return result

        wrapper.last_duration_seconds = 0.0  # type: ignore[attr-defined]
        return wrapper  # type: ignore[return-value]

    return decorator


class Stopwatch:
    """Simple context-manager stopwatch for ad-hoc benchmarking blocks."""

    def __init__(self) -> None:
        self.elapsed_seconds: float = 0.0
        self._start: float = 0.0

    def __enter__(self) -> "Stopwatch":
        self._start = time.perf_counter()
        return self

    def __exit__(self, *exc_info: Any) -> None:
        self.elapsed_seconds = time.perf_counter() - self._start
