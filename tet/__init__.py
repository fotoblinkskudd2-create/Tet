"""Tet — a personal system for daily life, AI, inventions, patents, workflow,
music, video, art, images, concepts, eco/economic ideas and stocks.

Everything is captured as :class:`tet.store.Item` records in a single SQLite
database and organised by :mod:`tet.categories`. The package is dependency-free
and runs anywhere Python runs.
"""
from __future__ import annotations

from .categories import CATEGORIES, Category
from .store import Item, Store

__version__ = "0.1.0"

__all__ = ["CATEGORIES", "Category", "Item", "Store", "__version__"]
