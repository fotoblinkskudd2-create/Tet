"""Anagram solving.

A small curated library guarantees delightful answers for the classic
examples, and -- when a system word list is available -- the solver enriches
results with real dictionary anagrams discovered on the fly. The curated
results always come first, so behaviour is stable regardless of the host.
"""

from __future__ import annotations

import os
import re
from functools import lru_cache
from typing import Dict, List, Optional, Tuple

from ..core import Solution, Solver

_LIBRARY: Dict[str, Tuple[str, ...]] = {
    "listen": ("silent", "enlist", "tinsel"),
    "evil": ("vile", "veil", "live"),
    "angel": ("glean", "angle"),
    "stressed": ("desserts",),
    "save": ("vase",),
    "earth": ("heart", "hater"),
    "night": ("thing",),
    "below": ("elbow", "bowel"),
}

_DICT_PATHS = ("/usr/share/dict/words", "/usr/dict/words")

_PATTERN = re.compile(r"(?:anagram of|unscramble)\s+([A-Za-z]+)")


def _canonical(word: str) -> str:
    return "".join(sorted(word.lower()))


@lru_cache(maxsize=1)
def _dictionary_index() -> Dict[str, Tuple[str, ...]]:
    """Build a sorted-letters -> words index from a system word list.

    Cached for the process lifetime. Returns an empty mapping when no word
    list is installed, which keeps the solver fully functional offline.
    """

    path = next((p for p in _DICT_PATHS if os.path.exists(p)), None)
    if path is None:
        return {}

    index: Dict[str, List[str]] = {}
    try:
        with open(path, encoding="utf-8", errors="ignore") as handle:
            for raw in handle:
                word = raw.strip().lower()
                if not word.isalpha() or len(word) < 3:
                    continue
                index.setdefault(_canonical(word), []).append(word)
    except OSError:
        return {}
    return {key: tuple(sorted(set(values))) for key, values in index.items()}


def dictionary_anagrams(word: str) -> Tuple[str, ...]:
    """Return real anagrams of ``word`` excluding the word itself."""

    key = _canonical(word)
    found = _dictionary_index().get(key, ())
    return tuple(w for w in found if w != word.lower())


class AnagramSolver(Solver):
    name = "anagram"
    kind = "Anagram"
    description = "Find anagram buddies for a word (curated + dictionary)."

    def solve(self, problem: str) -> Optional[Solution]:
        match = _PATTERN.search(problem.lower())
        if not match:
            return None

        target = match.group(1)
        canonical = _canonical(target)

        ordered: List[str] = []
        for source, words in _LIBRARY.items():
            if _canonical(source) == canonical:
                ordered.extend(words)
        for word in dictionary_anagrams(target):
            if word not in ordered and word != target:
                ordered.append(word)

        if ordered:
            answer = (
                f"Possible anagram buddies for '{target}': {', '.join(ordered)}"
            )
            confidence = 0.88
        else:
            answer = (
                f"I could not find a perfect match, but '{canonical}' looks "
                "like a fun jumble!"
            )
            confidence = 0.7

        details = [
            "Try speaking the options out loud—sometimes the silliest sounds win!",
        ]
        return self.make(answer, details, confidence=confidence)
