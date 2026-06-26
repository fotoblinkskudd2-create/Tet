"""A small, accurate, *searchable* knowledge base.

This is the "search on input" capability: ask Tet about a physical constant,
an SI prefix, or a defined reference value and it ranks its curated entries
against your words and returns the best match -- with the value, unit and a
short note. Everything here is offline and sourced from authoritative
references (CODATA 2022 for the physical constants; the SI brochure for
prefixes and defined values), not guessed.

The matcher is deliberately conservative: it only produces a solution when an
entry genuinely resembles the query, so it never hijacks arithmetic or unit
questions that merely happen to contain the word "what".
"""

from __future__ import annotations

import difflib
import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from ..core import Solution, Solver


@dataclass(frozen=True)
class Entry:
    name: str
    value: float
    unit: str
    symbol: str
    category: str
    note: str
    terms: Tuple[str, ...] = field(default_factory=tuple)

    def search_terms(self) -> Tuple[str, ...]:
        # The name is always searchable; extra aliases broaden recall.
        base = (self.name.lower(),) + tuple(t.lower() for t in self.terms)
        # Keep only terms with enough signal to avoid single-letter noise.
        return tuple(dict.fromkeys(t for t in base if len(t) >= 3))

    def display_value(self) -> str:
        v = self.value
        if v == 0:
            return "0"
        av = abs(v)
        # Show exact-ish integers in full when they are not astronomically large.
        if v == int(v) and av < 1e15:
            return str(int(v))
        if av >= 1e6 or av < 1e-3:
            text = f"{v:.6g}"
            if "e" in text:
                mantissa, exponent = text.split("e")
                return f"{mantissa} × 10^{int(exponent)}"
            return text
        return f"{v:.6g}"


def _physical_constants() -> List[Entry]:
    # CODATA 2022 recommended values. Several are exact by SI definition.
    return [
        Entry("speed of light in vacuum", 299792458.0, "m/s", "c", "constant",
              "Exact by SI definition.",
              ("speed of light", "light speed", "lightspeed")),
        Entry("Planck constant", 6.62607015e-34, "J·s", "h", "constant",
              "Exact by SI definition.", ("planck constant", "planck")),
        Entry("reduced Planck constant", 1.054571817e-34, "J·s", "ħ", "constant",
              "h / 2π (Dirac constant).",
              ("reduced planck", "h-bar", "hbar", "dirac constant")),
        Entry("elementary charge", 1.602176634e-19, "C", "e", "constant",
              "Exact by SI definition.",
              ("elementary charge", "electron charge", "charge of electron")),
        Entry("Avogadro constant", 6.02214076e23, "1/mol", "N_A", "constant",
              "Exact by SI definition.",
              ("avogadro constant", "avogadro number", "avogadro")),
        Entry("Boltzmann constant", 1.380649e-23, "J/K", "k_B", "constant",
              "Exact by SI definition.", ("boltzmann constant", "boltzmann")),
        Entry("Newtonian constant of gravitation", 6.67430e-11, "m³·kg⁻¹·s⁻²", "G",
              "constant", "Measured; relative uncertainty ~2.2×10⁻⁵.",
              ("gravitational constant", "newtonian constant of gravitation",
               "universal gravitation", "big g")),
        Entry("electron mass", 9.1093837139e-31, "kg", "mₑ", "constant",
              "CODATA 2022.", ("electron mass", "mass of electron")),
        Entry("proton mass", 1.67262192595e-27, "kg", "mₚ", "constant",
              "CODATA 2022.", ("proton mass", "mass of proton")),
        Entry("molar gas constant", 8.314462618, "J·mol⁻¹·K⁻¹", "R", "constant",
              "Exact by SI definition (R = N_A·k_B).",
              ("gas constant", "molar gas constant", "universal gas constant")),
        Entry("Stefan-Boltzmann constant", 5.670374419e-8, "W·m⁻²·K⁻⁴", "σ",
              "constant", "Exact by SI definition.",
              ("stefan-boltzmann constant", "stefan boltzmann")),
        Entry("Faraday constant", 96485.33212, "C/mol", "F", "constant",
              "Exact by SI definition (F = N_A·e).", ("faraday constant",)),
        Entry("standard acceleration of gravity", 9.80665, "m/s²", "g₀", "defined",
              "Defined standard value.",
              ("standard gravity", "standard acceleration of gravity",
               "gravity acceleration", "g-force")),
        Entry("astronomical unit", 149597870700.0, "m", "au", "defined",
              "Exact, IAU 2012 definition.", ("astronomical unit",)),
        Entry("light-year", 9460730472580800.0, "m", "ly", "defined",
              "Exact: c × one Julian year.", ("light year", "lightyear")),
        Entry("standard atmosphere", 101325.0, "Pa", "atm", "defined",
              "Defined reference pressure.",
              ("standard atmosphere", "atmospheric pressure", "atmosphere pressure")),
        Entry("absolute zero", -273.15, "°C", "0 K", "defined",
              "Lowest possible temperature, equal to 0 K.",
              ("absolute zero",)),
    ]


_SI_PREFIXES = {
    "quetta": 30, "ronna": 27, "yotta": 24, "zetta": 21, "exa": 18, "peta": 15,
    "tera": 12, "giga": 9, "mega": 6, "kilo": 3, "hecto": 2, "deca": 1,
    "deci": -1, "centi": -2, "milli": -3, "micro": -6, "nano": -9, "pico": -12,
    "femto": -15, "atto": -18, "zepto": -21, "yocto": -24, "ronto": -27,
    "quecto": -30,
}
_PREFIX_SYMBOLS = {
    "quetta": "Q", "ronna": "R", "yotta": "Y", "zetta": "Z", "exa": "E",
    "peta": "P", "tera": "T", "giga": "G", "mega": "M", "kilo": "k",
    "hecto": "h", "deca": "da", "deci": "d", "centi": "c", "milli": "m",
    "micro": "µ", "nano": "n", "pico": "p", "femto": "f", "atto": "a",
    "zepto": "z", "yocto": "y", "ronto": "r", "quecto": "q",
}


def _prefix_entries() -> List[Entry]:
    entries = []
    for name, exp in _SI_PREFIXES.items():
        entries.append(
            Entry(
                name=name,
                value=float(10 ** exp) if exp >= 0 else 10.0 ** exp,
                unit="",
                symbol=_PREFIX_SYMBOLS[name],
                category="SI prefix",
                note=f"Factor 10^{exp}.",
                terms=(f"{name} prefix",),
            )
        )
    return entries


_ENTRIES: Tuple[Entry, ...] = tuple(_physical_constants() + _prefix_entries())

# Words that do not help discriminate between entries.
_STOPWORDS = {
    "what", "whats", "what's", "is", "the", "of", "a", "an", "value",
    "search", "lookup", "look", "up", "find", "constant", "give", "me",
    "tell", "show", "how", "much", "for", "in", "to", "prefix",
}
_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z'’\-]*")


def _meaningful_tokens(query: str) -> List[str]:
    tokens = [t.lower() for t in _TOKEN_RE.findall(query)]
    return [t for t in tokens if t not in _STOPWORDS and len(t) >= 3]


def _contains_whole(term: str, q: str) -> bool:
    """True when ``term`` appears in ``q`` on letter boundaries.

    Prevents short prefix names ("kilo", "exa", "milli") from matching inside
    unrelated longer words ("kilometers", "example", "million").
    """

    return re.search(rf"(?<![a-z]){re.escape(term)}(?![a-z])", q) is not None


def score_entry(query: str, entry: Entry) -> float:
    """Return a match score in roughly [0, 1] for ``entry`` against ``query``."""

    q = query.lower()
    score = 0.0
    for term in entry.search_terms():
        if _contains_whole(term, q):
            # Longer phrase hits are stronger evidence.
            score = max(score, 0.7 + 0.3 * min(len(term) / 18.0, 1.0))
    if score >= 0.9:
        return score

    # Typo tolerance: fuzzily match individual query tokens to entry terms.
    tokens = _meaningful_tokens(query)
    flat_terms = [w for term in entry.search_terms() for w in term.split()]
    for token in tokens:
        close = difflib.get_close_matches(token, flat_terms, n=1, cutoff=0.84)
        if close:
            score = max(score, 0.66)
    return score


def search(query: str, limit: int = 3) -> List[Tuple[Entry, float]]:
    """Return the best-matching entries with their scores, best first."""

    scored = [(entry, score_entry(query, entry)) for entry in _ENTRIES]
    scored = [pair for pair in scored if pair[1] > 0.0]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:limit]


class KnowledgeSolver(Solver):
    name = "knowledge"
    kind = "Knowledge"
    description = "Look up physical constants, SI prefixes and defined values."

    #: Only fire when an entry genuinely resembles the query.
    THRESHOLD = 0.6

    def solve(self, problem: str) -> Optional[Solution]:
        results = search(problem, limit=4)
        if not results or results[0][1] < self.THRESHOLD:
            return None

        top, top_score = results[0]
        headline = (
            f"{top.name} ({top.symbol}) = {top.display_value()} {top.unit}".rstrip()
        )
        details = [f"{top.note} Category: {top.category}."]

        # When the query reads like a broad "search", offer near matches too.
        others = [r for r in results[1:] if r[1] >= self.THRESHOLD]
        if others:
            details.append(
                "Related: "
                + "; ".join(
                    f"{e.name} = {e.display_value()} {e.unit}".rstrip() for e, _ in others
                )
            )

        confidence = 0.9 if top_score >= 0.9 else 0.8 if top_score >= 0.7 else 0.68
        return self.make(headline, details, confidence=confidence)
