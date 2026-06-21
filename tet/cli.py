"""Unified command-line interface for the Tet personal system.

Run ``python -m tet --help`` to explore. The CLI is the single entry point for
capturing and organising everything: daily tasks, AI experiments, inventions,
patents, workflows, creative media, concepts, eco/economic ideas and stocks.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

from . import scoring
from . import stocks as stock_tools
from .categories import CATEGORIES, CATEGORY_KEYS, resolve_category
from .creative import prompt_for_category
from .dashboard import render
from .store import Item, Store


# --- formatting helpers ------------------------------------------------
_PRIORITY_DOT = {5: "🔴", 4: "🟠", 3: "🟡", 2: "🟢", 1: "⚪"}


def _fmt_item_line(item: Item) -> str:
    cat = CATEGORIES.get(item.category)
    emoji = cat.emoji if cat else "•"
    dot = _PRIORITY_DOT.get(item.priority, "🟡")
    score = f" [{item.score:.0f}]" if item.score is not None else ""
    tags = f"  {' '.join('#' + t for t in item.tags)}" if item.tags else ""
    status = "" if item.status == "open" else f" ({item.status})"
    return f"{dot} #{item.id:<4} {emoji} {item.title}{score}{status}{tags}"


def _fmt_item_full(item: Item) -> str:
    cat = CATEGORIES.get(item.category)
    cat_label = cat.label if cat else item.category
    lines = [
        f"#{item.id} · {cat_label}",
        f"Title    : {item.title}",
        f"Status   : {item.status}   Priority: {item.priority}/5"
        + (f"   Score: {item.score:.0f}/100" if item.score is not None else ""),
    ]
    if item.tags:
        lines.append(f"Tags     : {', '.join(item.tags)}")
    if item.body:
        lines.append(f"Body     : {item.body}")
    if item.metadata:
        lines.append("Metadata :")
        for key, value in item.metadata.items():
            lines.append(f"  {key}: {value}")
    lines.append(f"Created  : {item.created_at}")
    lines.append(f"Updated  : {item.updated_at}")
    return "\n".join(lines)


def _parse_meta(pairs: Optional[List[str]]) -> Dict[str, str]:
    meta: Dict[str, str] = {}
    for pair in pairs or []:
        if "=" not in pair:
            raise SystemExit(f"--meta expects key=value, got '{pair}'")
        key, value = pair.split("=", 1)
        meta[key.strip()] = value.strip()
    return meta


def _parse_factors(pairs: Optional[List[str]]) -> Dict[str, float]:
    factors: Dict[str, float] = {}
    for pair in pairs or []:
        if "=" not in pair:
            raise SystemExit(f"factors expect key=value, got '{pair}'")
        key, value = pair.split("=", 1)
        try:
            factors[key.strip()] = float(value)
        except ValueError:
            raise SystemExit(f"factor '{key}' must be a number, got '{value}'")
    return factors


# --- command handlers --------------------------------------------------
def cmd_add(store: Store, args: argparse.Namespace) -> int:
    item = Item(
        category=args.category,
        title=" ".join(args.title),
        body=args.body or "",
        tags=args.tag or [],
        priority=args.priority,
        metadata=_parse_meta(args.meta),
    )
    saved = store.add(item)
    print(f"✅ Added #{saved.id}")
    print(_fmt_item_line(saved))
    return 0


def cmd_list(store: Store, args: argparse.Namespace) -> int:
    category = resolve_category(args.category) if args.category else None
    items = store.list(
        category=category,
        status=args.status,
        tag=args.tag,
        order_by=args.sort,
    )
    if args.json:
        print(json.dumps([i.to_dict() for i in items], ensure_ascii=False, indent=2))
        return 0
    if not items:
        print("No matching items. Capture something with: python -m tet add <category> <title>")
        return 0
    for item in items:
        print(_fmt_item_line(item))
    print(f"\n{len(items)} item(s).")
    return 0


def cmd_show(store: Store, args: argparse.Namespace) -> int:
    item = store.get(args.id)
    if item is None:
        print(f"No item with id {args.id}")
        return 1
    if args.json:
        print(json.dumps(item.to_dict(), ensure_ascii=False, indent=2))
    else:
        print(_fmt_item_full(item))
    return 0


def cmd_search(store: Store, args: argparse.Namespace) -> int:
    items = store.search(" ".join(args.query))
    if not items:
        print("No matches.")
        return 0
    for item in items:
        print(_fmt_item_line(item))
    print(f"\n{len(items)} match(es).")
    return 0


def cmd_edit(store: Store, args: argparse.Namespace) -> int:
    changes: Dict[str, object] = {}
    if args.title:
        changes["title"] = " ".join(args.title)
    if args.body is not None:
        changes["body"] = args.body
    if args.status:
        changes["status"] = args.status
    if args.priority is not None:
        changes["priority"] = args.priority
    if args.category:
        changes["category"] = args.category
    if args.tag:
        changes["tags"] = args.tag
    if args.meta:
        changes["metadata"] = _parse_meta(args.meta)
    if not changes:
        print("Nothing to change. Pass at least one field.")
        return 1
    try:
        item = store.update(args.id, **changes)
    except KeyError:
        print(f"No item with id {args.id}")
        return 1
    print(f"✏️  Updated #{item.id}")
    print(_fmt_item_line(item))
    return 0


def cmd_done(store: Store, args: argparse.Namespace) -> int:
    try:
        item = store.update(args.id, status="done")
    except KeyError:
        print(f"No item with id {args.id}")
        return 1
    print(f"✅ Marked #{item.id} done.")
    return 0


def cmd_rm(store: Store, args: argparse.Namespace) -> int:
    if store.delete(args.id):
        print(f"🗑️  Deleted #{args.id}")
        return 0
    print(f"No item with id {args.id}")
    return 1


def cmd_stats(store: Store, args: argparse.Namespace) -> int:
    stats = store.stats()
    if args.json:
        print(json.dumps(stats, ensure_ascii=False, indent=2))
        return 0
    print(f"📊 {stats['total']} items total\n")
    print("By category:")
    for key, count in stats["by_category"].items():
        cat = CATEGORIES.get(key)
        label = cat.label if cat else key
        print(f"  {label}: {count}")
    print("\nBy status:")
    for key, count in stats["by_status"].items():
        print(f"  {key}: {count}")
    if stats["tags"]:
        print("\nTop tags:")
        for tag, count in list(stats["tags"].items())[:12]:
            print(f"  #{tag}: {count}")
    return 0


def cmd_score(store: Store, args: argparse.Namespace) -> int:
    factors = _parse_factors(args.factor)
    result = scoring.score(args.model, factors)
    print(result.format())
    if args.id is not None:
        try:
            store.update(args.id, score=result.total)
            print(f"\n💾 Saved score {result.total:.0f} to #{args.id}.")
        except KeyError:
            print(f"\nNo item with id {args.id} to save score onto.")
            return 1
    return 0


def cmd_prompt(store: Store, args: argparse.Namespace) -> int:
    seed = " ".join(args.seed)
    category = resolve_category(args.category) if args.category else "art"
    solution = prompt_for_category(category, seed)
    print(solution.format())
    if args.save:
        item = store.add(
            Item(
                category=category,
                title=seed[:80],
                body=solution.answer,
                tags=["prompt"],
            )
        )
        print(f"\n💾 Saved as #{item.id}.")
    return 0


def cmd_stock(store: Store, args: argparse.Namespace) -> int:
    if args.stock_cmd == "add":
        meta = stock_tools.build_stock_metadata(
            ticker=args.ticker,
            thesis=args.thesis or "",
            target=args.target,
            conviction=args.conviction,
        )
        item = store.add(
            Item(
                category="stock",
                title=meta["ticker"],
                body=meta["thesis"],
                tags=["stock"],
                priority=args.conviction,
                metadata=meta,
            )
        )
        print(f"📈 Added {meta['ticker']} as #{item.id}.")
        return 0

    # list / refresh
    items = store.list(category="stock", order_by="priority")
    if not items:
        print("Watchlist empty. Add one: python -m tet stock add TICKER --thesis ...")
        return 0
    for item in items:
        meta = item.metadata
        ticker = meta.get("ticker", item.title)
        target = meta.get("target")
        line = f"📈 #{item.id} {ticker}  conviction {meta.get('conviction', item.priority)}/5"
        if target:
            line += f"  target {target}"
        if args.refresh:
            quote = stock_tools.fetch_quote(ticker)
            if quote and quote.price is not None:
                up = stock_tools.upside(quote.price, target)
                line += f"  now {quote.price}"
                if up is not None:
                    line += f"  ({up:+.1f}% to target)"
            else:
                line += "  (price unavailable)"
        print(line)
        if item.body:
            print(f"      {item.body}")
    if args.refresh:
        print("\nPrices are best-effort via Stooq and may be blocked by the network policy.")
    return 0


def cmd_dashboard(store: Store, args: argparse.Namespace) -> int:
    out = Path(args.out)
    out.write_text(render(store), encoding="utf-8")
    print(f"🧭 Dashboard written to {out.resolve()}")
    return 0


def cmd_categories(store: Store, args: argparse.Namespace) -> int:
    for key, cat in CATEGORIES.items():
        print(f"{cat.emoji} {key:<10} {cat.label_en} / {cat.label_no}")
        print(f"    {cat.description}")
    return 0


def cmd_seed(store: Store, args: argparse.Namespace) -> int:
    """Populate the store with starter items so the system is usable on day one."""

    samples = [
        Item("daily", "Review inbox and plan top 3 tasks", tags=["routine"], priority=4),
        Item("ai", "Try an agent that drafts patent claims from an idea",
             body="Feed invention notes, get a first-draft independent claim.",
             tags=["agent", "patent"], priority=4,
             metadata={"model": "claude", "prompt": "Draft claim 1 from: <idea>"}),
        Item("invention", "Self-tensioning bike chain",
             body="Passive mechanism keeps chain tension without a derailleur.",
             tags=["mechanical"], priority=3,
             metadata={"problem": "chain slack", "novelty": "passive tensioner"}),
        Item("patent", "File provisional for self-tensioning chain",
             tags=["filing"], priority=3,
             metadata={"claim": "A chain tensioner comprising...", "status_office": "draft"}),
        Item("workflow", "Weekly idea triage",
             body="Every Sunday: score new eco/invention items, archive the weak ones.",
             tags=["routine"], priority=4,
             metadata={"trigger": "Sunday 18:00", "tools": "tet score"}),
        Item("music", "Hopeful synthwave for launch video",
             tags=["synthwave"], priority=2,
             metadata={"bpm": "110", "key": "A minor"}),
        Item("video", "60s explainer for the eco idea",
             tags=["explainer"], priority=2, metadata={"length": "60s", "aspect": "9:16"}),
        Item("art", "Cover art: aurora over fjord, risograph style",
             tags=["cover"], priority=2, metadata={"medium": "risograph", "palette": "teal/coral"}),
        Item("image", "Hero image: hands holding a sprouting seed, soft light",
             tags=["hero"], priority=2, metadata={"lighting": "soft window light"}),
        Item("concept", "Personal compounding: tiny daily logs beat big rare efforts",
             tags=["framework"], priority=3),
        Item("eco", "Neighborhood tool library as a service",
             body="Shared tools cut waste and cost; subscription + deposit model.",
             tags=["circular"], priority=4,
             metadata={"impact": "waste down", "market": "urban renters"}),
        Item("stock", "RENEW", body="Renewable infra with long contracted cashflows.",
             tags=["stock"], priority=3,
             metadata=stock_tools.build_stock_metadata("RENEW", "Contracted cashflows", None, 3)),
    ]
    added = 0
    for sample in samples:
        store.add(sample)
        added += 1
    print(f"🌱 Seeded {added} starter items across all categories.")
    print("Run:  python -m tet list     or     python -m tet dashboard")
    return 0


# --- parser ------------------------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="tet",
        description="Tet — a personal system for daily life, AI, inventions, "
        "patents, workflow, music, video, art, images, concepts, eco ideas and stocks.",
    )
    parser.add_argument("--db", help="Path to the SQLite database (default ~/.tet/tet.db).")
    sub = parser.add_subparsers(dest="command", required=True)

    p_add = sub.add_parser("add", help="Capture a new item.")
    p_add.add_argument("category", help=f"One of: {', '.join(CATEGORY_KEYS)}")
    p_add.add_argument("title", nargs="+", help="Short title for the item.")
    p_add.add_argument("-b", "--body", help="Longer description.")
    p_add.add_argument("-t", "--tag", action="append", help="Tag (repeatable).")
    p_add.add_argument("-p", "--priority", type=int, default=3, help="1-5 (default 3).")
    p_add.add_argument("-m", "--meta", action="append", help="key=value metadata (repeatable).")
    p_add.set_defaults(func=cmd_add)

    p_list = sub.add_parser("list", help="List items.")
    p_list.add_argument("category", nargs="?", help="Filter by category.")
    p_list.add_argument("-s", "--status", help="Filter by status.")
    p_list.add_argument("-t", "--tag", help="Filter by tag.")
    p_list.add_argument("--sort", choices=["priority", "recent", "created", "score"],
                        default="priority")
    p_list.add_argument("--json", action="store_true", help="Output JSON.")
    p_list.set_defaults(func=cmd_list)

    p_show = sub.add_parser("show", help="Show one item in full.")
    p_show.add_argument("id", type=int)
    p_show.add_argument("--json", action="store_true")
    p_show.set_defaults(func=cmd_show)

    p_search = sub.add_parser("search", help="Full-text search across items.")
    p_search.add_argument("query", nargs="+")
    p_search.set_defaults(func=cmd_search)

    p_edit = sub.add_parser("edit", help="Edit fields on an item.")
    p_edit.add_argument("id", type=int)
    p_edit.add_argument("--title", nargs="+")
    p_edit.add_argument("-b", "--body")
    p_edit.add_argument("-s", "--status")
    p_edit.add_argument("-p", "--priority", type=int)
    p_edit.add_argument("-c", "--category")
    p_edit.add_argument("-t", "--tag", action="append")
    p_edit.add_argument("-m", "--meta", action="append")
    p_edit.set_defaults(func=cmd_edit)

    p_done = sub.add_parser("done", help="Mark an item done.")
    p_done.add_argument("id", type=int)
    p_done.set_defaults(func=cmd_done)

    p_rm = sub.add_parser("rm", help="Delete an item.")
    p_rm.add_argument("id", type=int)
    p_rm.set_defaults(func=cmd_rm)

    p_stats = sub.add_parser("stats", help="Show counts and top tags.")
    p_stats.add_argument("--json", action="store_true")
    p_stats.set_defaults(func=cmd_stats)

    p_score = sub.add_parser("score", help="Score an idea/invention/stock 0-100.")
    p_score.add_argument("model", choices=list(scoring.MODELS.keys()),
                         help="Scoring model to use.")
    p_score.add_argument("factor", nargs="*", help="key=value factors 0-10.")
    p_score.add_argument("--id", type=int, help="Save the resulting score onto this item.")
    p_score.set_defaults(func=cmd_score)

    p_prompt = sub.add_parser("prompt", help="Generate a creative brief.")
    p_prompt.add_argument("category", help="music | video | art | image | concept")
    p_prompt.add_argument("seed", nargs="+", help="A few words to shape.")
    p_prompt.add_argument("--save", action="store_true", help="Save the brief as an item.")
    p_prompt.set_defaults(func=cmd_prompt)

    p_stock = sub.add_parser("stock", help="Manage the stock watchlist.")
    stock_sub = p_stock.add_subparsers(dest="stock_cmd", required=True)
    s_add = stock_sub.add_parser("add", help="Add a ticker to the watchlist.")
    s_add.add_argument("ticker")
    s_add.add_argument("--thesis", help="Why you own/want it.")
    s_add.add_argument("--target", type=float, help="Price target.")
    s_add.add_argument("--conviction", type=int, default=3, help="1-5.")
    s_list = stock_sub.add_parser("list", help="Show the watchlist.")
    s_list.add_argument("--refresh", action="store_true",
                        help="Best-effort live prices (needs network).")
    p_stock.set_defaults(func=cmd_stock)

    p_dash = sub.add_parser("dashboard", help="Render an HTML dashboard.")
    p_dash.add_argument("-o", "--out", default="tet-dashboard.html")
    p_dash.set_defaults(func=cmd_dashboard)

    p_cats = sub.add_parser("categories", help="List all categories.")
    p_cats.set_defaults(func=cmd_categories)

    p_seed = sub.add_parser("seed", help="Add starter items across every category.")
    p_seed.set_defaults(func=cmd_seed)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv if argv is not None else sys.argv[1:])
    store = Store(args.db)
    try:
        return args.func(store, args)
    finally:
        store.close()


if __name__ == "__main__":
    raise SystemExit(main())
