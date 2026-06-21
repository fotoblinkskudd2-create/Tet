"""Render a self-contained HTML dashboard from the store.

No JS frameworks, no network assets — a single file you can open on a phone or
commit as a snapshot of where everything stands.
"""
from __future__ import annotations

import html
from datetime import datetime, timezone
from typing import List

from .categories import CATEGORIES
from .store import Item, Store

_PRIORITY_DOT = {5: "🔴", 4: "🟠", 3: "🟡", 2: "🟢", 1: "⚪"}


def _esc(text: str) -> str:
    return html.escape(str(text), quote=True)


def _item_card(item: Item) -> str:
    cat = CATEGORIES.get(item.category)
    cat_label = cat.label if cat else item.category
    dot = _PRIORITY_DOT.get(item.priority, "🟡")
    tags = "".join(f'<span class="tag">{_esc(t)}</span>' for t in item.tags)
    score = f'<span class="score">{item.score:.0f}</span>' if item.score is not None else ""
    body = f'<p class="body">{_esc(item.body)}</p>' if item.body else ""
    status_cls = "done" if item.status in {"done", "closed"} else "open"
    return f"""
      <div class="card {status_cls}">
        <div class="card-top">
          <span class="prio">{dot}</span>
          <span class="title">{_esc(item.title)}</span>
          {score}
        </div>
        <div class="meta">{_esc(cat_label)} · {_esc(item.status)} · #{item.id}</div>
        {body}
        <div class="tags">{tags}</div>
      </div>
    """


def render(store: Store) -> str:
    items = store.list(order_by="priority")
    stats = store.stats()
    generated = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    # Group by category in registry order.
    sections: List[str] = []
    for key, cat in CATEGORIES.items():
        cat_items = [i for i in items if i.category == key]
        if not cat_items:
            continue
        cards = "\n".join(_item_card(i) for i in cat_items)
        sections.append(
            f'<section><h2>{_esc(cat.label)} '
            f'<span class="count">{len(cat_items)}</span></h2>'
            f'<div class="grid">{cards}</div></section>'
        )

    chips = "".join(
        f'<span class="chip">{_esc(CATEGORIES[k].emoji if k in CATEGORIES else "")}'
        f' {_esc(k)}: {v}</span>'
        for k, v in stats["by_category"].items()
    )
    body = "\n".join(sections) or '<p class="empty">No items yet. Add some with the CLI.</p>'

    return f"""<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tet · Personal System</title>
<style>
  :root {{ color-scheme: light dark; }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
         margin: 0; background: #0f1115; color: #e8eaed; line-height: 1.45; }}
  header {{ padding: 24px 20px; background: linear-gradient(120deg,#1b2735,#0d1b2a);
            border-bottom: 1px solid #222; }}
  h1 {{ margin: 0; font-size: 1.6rem; }}
  .sub {{ color: #9aa4b2; font-size: .85rem; margin-top: 4px; }}
  .chips {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }}
  .chip {{ background: #1c2230; border: 1px solid #2a3346; border-radius: 999px;
           padding: 4px 10px; font-size: .78rem; }}
  main {{ padding: 16px 20px 60px; max-width: 1100px; margin: 0 auto; }}
  h2 {{ font-size: 1.05rem; margin: 28px 0 12px; border-left: 3px solid #3b82f6;
        padding-left: 10px; }}
  .count {{ color: #9aa4b2; font-weight: 400; font-size: .85rem; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr));
           gap: 12px; }}
  .card {{ background: #161b24; border: 1px solid #232b38; border-radius: 12px;
           padding: 12px 14px; }}
  .card.done {{ opacity: .55; }}
  .card-top {{ display: flex; align-items: center; gap: 8px; }}
  .title {{ font-weight: 600; flex: 1; }}
  .score {{ background: #1d4ed8; color: #fff; border-radius: 6px; padding: 1px 7px;
            font-size: .78rem; }}
  .meta {{ color: #8b95a5; font-size: .74rem; margin: 4px 0 6px; }}
  .body {{ font-size: .85rem; color: #c3cad6; margin: 6px 0; }}
  .tags {{ display: flex; flex-wrap: wrap; gap: 5px; }}
  .tag {{ background: #222c3c; border-radius: 6px; padding: 1px 7px; font-size: .72rem;
          color: #9fd0ff; }}
  .empty {{ color: #8b95a5; }}
  footer {{ text-align: center; padding: 24px; color:#5b6573; font-size:.75rem; }}
</style>
</head>
<body>
  <header>
    <h1>🧭 Tet — Personal System</h1>
    <div class="sub">{stats['total']} items · generated {generated}</div>
    <div class="chips">{chips}</div>
  </header>
  <main>
    {body}
  </main>
  <footer>Tet personal knowledge system · daily · AI · inventions · patents ·
    workflow · music · video · art · images · concepts · eco ideas · stocks</footer>
</body>
</html>
"""
