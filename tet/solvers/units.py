"""Unit conversion across length, mass, volume, time and data.

Each linear family is expressed in a common base unit, so conversion is a
single multiply/divide. Temperature is handled separately because its
conversions are affine (they have offsets), not linear.
"""

from __future__ import annotations

import re
from typing import Callable, Dict, Optional, Tuple

from ..core import Solution, Solver

# family -> { unit alias -> factor to the family's base unit }
_FAMILIES: Dict[str, Dict[str, float]] = {
    "length": {
        "m": 1.0, "meter": 1.0, "meters": 1.0, "metre": 1.0, "metres": 1.0,
        "km": 1000.0, "kilometer": 1000.0, "kilometers": 1000.0,
        "cm": 0.01, "centimeter": 0.01, "centimeters": 0.01,
        "mm": 0.001, "millimeter": 0.001, "millimeters": 0.001,
        "mi": 1609.344, "mile": 1609.344, "miles": 1609.344,
        "yd": 0.9144, "yard": 0.9144, "yards": 0.9144,
        "ft": 0.3048, "foot": 0.3048, "feet": 0.3048,
        "in": 0.0254, "inch": 0.0254, "inches": 0.0254,
        "nmi": 1852.0,
    },
    "mass": {
        "kg": 1.0, "kilogram": 1.0, "kilograms": 1.0,
        "g": 0.001, "gram": 0.001, "grams": 0.001,
        "mg": 1e-6, "milligram": 1e-6, "milligrams": 1e-6,
        "t": 1000.0, "tonne": 1000.0, "tonnes": 1000.0,
        "lb": 0.45359237, "lbs": 0.45359237, "pound": 0.45359237, "pounds": 0.45359237,
        "oz": 0.0283495231, "ounce": 0.0283495231, "ounces": 0.0283495231,
        "st": 6.35029318, "stone": 6.35029318,
    },
    "volume": {
        "l": 1.0, "liter": 1.0, "liters": 1.0, "litre": 1.0, "litres": 1.0,
        "ml": 0.001, "milliliter": 0.001, "milliliters": 0.001,
        "gal": 3.785411784, "gallon": 3.785411784, "gallons": 3.785411784,
        "qt": 0.946352946, "quart": 0.946352946, "quarts": 0.946352946,
        "pt": 0.473176473, "pint": 0.473176473, "pints": 0.473176473,
        "cup": 0.2365882365, "cups": 0.2365882365,
    },
    "time": {
        "s": 1.0, "sec": 1.0, "second": 1.0, "seconds": 1.0,
        "min": 60.0, "minute": 60.0, "minutes": 60.0,
        "h": 3600.0, "hr": 3600.0, "hour": 3600.0, "hours": 3600.0,
        "day": 86400.0, "days": 86400.0,
        "week": 604800.0, "weeks": 604800.0,
    },
    "data": {
        "b": 1.0, "byte": 1.0, "bytes": 1.0,
        "kb": 1024.0, "kib": 1024.0,
        "mb": 1024.0 ** 2, "mib": 1024.0 ** 2,
        "gb": 1024.0 ** 3, "gib": 1024.0 ** 3,
        "tb": 1024.0 ** 4, "tib": 1024.0 ** 4,
        "bit": 0.125, "bits": 0.125,
    },
}

# Temperature converters: to-celsius and from-celsius per alias.
_TEMP_TO_C: Dict[str, Callable[[float], float]] = {
    "c": lambda x: x, "celsius": lambda x: x,
    "f": lambda x: (x - 32.0) * 5.0 / 9.0, "fahrenheit": lambda x: (x - 32.0) * 5.0 / 9.0,
    "k": lambda x: x - 273.15, "kelvin": lambda x: x - 273.15,
}
_TEMP_FROM_C: Dict[str, Callable[[float], float]] = {
    "c": lambda x: x, "celsius": lambda x: x,
    "f": lambda x: x * 9.0 / 5.0 + 32.0, "fahrenheit": lambda x: x * 9.0 / 5.0 + 32.0,
    "k": lambda x: x + 273.15, "kelvin": lambda x: x + 273.15,
}

_CONVERT_RE = re.compile(
    r"(?:convert\s+)?(-?\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s*(?:to|in|into|->)\s*([a-zA-Z]+)",
    re.IGNORECASE,
)


def _family_of(unit: str) -> Optional[str]:
    for family, table in _FAMILIES.items():
        if unit in table:
            return family
    return None


def _format(value: float) -> str:
    if value == int(value):
        return str(int(value))
    return f"{value:.6g}"


def convert(value: float, src: str, dst: str) -> Optional[Tuple[float, str]]:
    """Convert ``value`` from ``src`` to ``dst``.

    Returns ``(result, family)`` or ``None`` when the units are unknown or
    belong to different families.
    """

    src, dst = src.lower(), dst.lower()
    if src in _TEMP_TO_C and dst in _TEMP_FROM_C:
        celsius = _TEMP_TO_C[src](value)
        return _TEMP_FROM_C[dst](celsius), "temperature"

    src_family, dst_family = _family_of(src), _family_of(dst)
    if src_family is None or src_family != dst_family:
        return None
    base = value * _FAMILIES[src_family][src]
    return base / _FAMILIES[dst_family][dst], src_family


class UnitsSolver(Solver):
    name = "units"
    kind = "Units"
    description = "Convert between units of length, mass, volume, time, data, temperature."

    def solve(self, problem: str) -> Optional[Solution]:
        match = _CONVERT_RE.search(problem)
        if not match:
            return None
        value = float(match.group(1))
        src, dst = match.group(2), match.group(3)
        outcome = convert(value, src, dst)
        if outcome is None:
            return None
        result, family = outcome

        answer = (
            f"{_format(value)} {src} = {_format(result)} {dst} "
            f"(a tidy {family} conversion)."
        )
        details = [
            f"Family: {family}.",
            "Conversions stay exact for SI factors; imperial uses the international definitions.",
        ]
        return self.make(answer, details, confidence=0.9)
