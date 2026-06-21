"""Tests for the Tet personal system package."""
import json

import pytest

from tet import scoring
from tet.categories import resolve_category
from tet.cli import main
from tet.store import Item, Store
from tet.stocks import build_stock_metadata, upside


@pytest.fixture()
def store(tmp_path):
    s = Store(tmp_path / "test.db")
    yield s
    s.close()


# -- store --------------------------------------------------------------
def test_add_and_get_roundtrip(store):
    item = store.add(Item("invention", "Solar kettle", tags=["solar", "solar"]))
    assert item.id is not None
    fetched = store.get(item.id)
    assert fetched.title == "Solar kettle"
    assert fetched.category == "invention"
    # Duplicate tags are de-duplicated and normalised.
    assert fetched.tags == ["solar"]


def test_add_requires_title(store):
    with pytest.raises(ValueError):
        store.add(Item("daily", "   "))


def test_priority_is_clamped(store):
    item = store.add(Item("daily", "Clamp me", priority=99))
    assert item.priority == 5


def test_update_merges_metadata(store):
    item = store.add(Item("stock", "AAA", metadata={"ticker": "AAA"}))
    updated = store.update(item.id, metadata={"target": 100})
    assert updated.metadata == {"ticker": "AAA", "target": 100}


def test_list_filters_by_category_and_tag(store):
    store.add(Item("daily", "Task one", tags=["home"]))
    store.add(Item("eco", "Idea one", tags=["circular"]))
    assert len(store.list(category="daily")) == 1
    assert len(store.list(tag="circular")) == 1
    assert store.list(tag="circular")[0].category == "eco"


def test_search_matches_body(store):
    store.add(Item("concept", "Compounding", body="tiny daily logs win"))
    results = store.search("daily logs")
    assert len(results) == 1
    assert results[0].title == "Compounding"


def test_stats_counts(store):
    store.add(Item("daily", "a"))
    store.add(Item("daily", "b"))
    store.add(Item("eco", "c"))
    stats = store.stats()
    assert stats["total"] == 3
    assert stats["by_category"]["daily"] == 2


# -- categories ---------------------------------------------------------
def test_resolve_category_aliases():
    assert resolve_category("todo") == "daily"
    assert resolve_category("aksje") == "stock"
    assert resolve_category("Oppfinnelse") == "invention"


def test_resolve_category_rejects_unknown():
    with pytest.raises(ValueError):
        resolve_category("nonsense")


# -- scoring ------------------------------------------------------------
def test_score_eco_model_ranges():
    result = scoring.score("eco", {"impact": 9, "feasibility": 8, "market": 7,
                                    "defensibility": 6, "timing": 8})
    assert 0 <= result.total <= 100
    assert result.total > 50
    assert "impact" in result.breakdown


def test_score_missing_factor_defaults_neutral():
    result = scoring.score("invention", {"novelty": 10})
    assert any("not provided" in n for n in result.notes)


def test_rank_orders_by_total():
    ranked = scoring.rank("eco", [
        ("weak", {"impact": 1, "feasibility": 1, "market": 1}),
        ("strong", {"impact": 10, "feasibility": 10, "market": 10}),
    ])
    assert ranked[0][0] == "strong"


# -- stocks -------------------------------------------------------------
def test_build_stock_metadata_normalises():
    meta = build_stock_metadata("aapl", "thesis", 200, 9)
    assert meta["ticker"] == "AAPL"
    assert meta["conviction"] == 5  # clamped


def test_upside_calculation():
    assert upside(100, 150) == 50.0
    assert upside(None, 150) is None


# -- cli end to end -----------------------------------------------------
def test_cli_add_list_and_stats(tmp_path, capsys):
    db = str(tmp_path / "cli.db")
    assert main(["--db", db, "add", "eco", "Tool library", "-t", "circular", "-p", "4"]) == 0
    capsys.readouterr()  # discard output from the add command
    assert main(["--db", db, "list", "--json"]) == 0
    out = capsys.readouterr().out
    data = json.loads(out)
    assert len(data) == 1
    assert data[0]["title"] == "Tool library"


def test_cli_seed_and_dashboard(tmp_path):
    db = str(tmp_path / "seed.db")
    assert main(["--db", db, "seed"]) == 0
    out_file = tmp_path / "dash.html"
    assert main(["--db", db, "dashboard", "-o", str(out_file)]) == 0
    html = out_file.read_text(encoding="utf-8")
    assert "Tet" in html
    assert "tool library" in html.lower()


def test_cli_score_saves_to_item(tmp_path):
    db = str(tmp_path / "score.db")
    main(["--db", db, "add", "eco", "Scored idea"])
    assert main(["--db", db, "score", "eco", "impact=9", "feasibility=8", "--id", "1"]) == 0
    store = Store(db)
    assert store.get(1).score is not None
    store.close()
