"""Stock watchlist helpers.

The watchlist itself is stored as ordinary Tet items in the ``stock`` category;
this module adds thesis bookkeeping and an *optional*, best-effort price
refresh. Network access is never assumed: if the fetch fails (offline, blocked
by the environment's network policy, bad ticker) the function degrades
gracefully and returns ``None`` instead of raising.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass
from typing import Any, Dict, Optional
from urllib.request import urlopen


@dataclass
class Quote:
    ticker: str
    price: Optional[float]
    source: str
    raw: Dict[str, Any]


def build_stock_metadata(
    ticker: str,
    thesis: str = "",
    target: Optional[float] = None,
    conviction: int = 3,
) -> Dict[str, Any]:
    """Normalise the metadata stored on a stock item."""

    return {
        "ticker": ticker.strip().upper(),
        "thesis": thesis.strip(),
        "target": float(target) if target is not None else None,
        "conviction": max(1, min(5, int(conviction))),
    }


def fetch_quote(ticker: str, timeout: float = 6.0) -> Optional[Quote]:
    """Best-effort latest price via the Stooq CSV endpoint.

    Returns ``None`` on any failure so callers can stay offline-safe. Stooq
    uses suffixes like ``.us`` for US tickers; we try the bare symbol first and
    fall back to ``.us``.
    """

    symbol = ticker.strip().lower()
    candidates = [symbol]
    if "." not in symbol:
        candidates.append(f"{symbol}.us")

    for candidate in candidates:
        url = f"https://stooq.com/q/l/?s={candidate}&f=sd2t2ohlcv&h&e=csv"
        try:
            with urlopen(url, timeout=timeout) as resp:  # noqa: S310 (trusted host)
                text = resp.read().decode("utf-8", errors="replace")
        except Exception:
            continue

        reader = csv.DictReader(io.StringIO(text))
        row = next(reader, None)
        if not row:
            continue
        close = row.get("Close")
        if not close or close.upper() == "N/D":
            continue
        try:
            price = float(close)
        except ValueError:
            continue
        return Quote(ticker=ticker.upper(), price=price, source=candidate, raw=row)

    return None


def upside(price: Optional[float], target: Optional[float]) -> Optional[float]:
    """Percentage upside from current price to target."""

    if price is None or target is None or price <= 0:
        return None
    return round((target - price) / price * 100, 1)
