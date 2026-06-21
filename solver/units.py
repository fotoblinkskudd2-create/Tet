"""Unit conversion across length, mass, volume, time, speed, data and temperature."""
from __future__ import annotations

import re
from typing import Dict, Optional, Tuple

from .core import Capability, Solution

# Each category maps a unit alias to a factor expressed in the category's base
# unit.  Conversion is then "value × from_factor ÷ to_factor".
_CATEGORIES: Dict[str, Dict[str, float]] = {
    "length": {
        "mm": 0.001, "millimeter": 0.001, "millimetre": 0.001,
        "cm": 0.01, "centimeter": 0.01, "centimetre": 0.01,
        "m": 1.0, "meter": 1.0, "metre": 1.0,
        "km": 1000.0, "kilometer": 1000.0, "kilometre": 1000.0,
        "in": 0.0254, "inch": 0.0254, "inches": 0.0254,
        "ft": 0.3048, "foot": 0.3048, "feet": 0.3048,
        "yd": 0.9144, "yard": 0.9144, "yards": 0.9144,
        "mi": 1609.344, "mile": 1609.344, "miles": 1609.344,
        "nmi": 1852.0, "nauticalmile": 1852.0,
    },
    "mass": {
        "mg": 1e-6, "milligram": 1e-6,
        "g": 0.001, "gram": 0.001, "grams": 0.001,
        "kg": 1.0, "kilogram": 1.0, "kilograms": 1.0,
        "t": 1000.0, "tonne": 1000.0, "ton": 1000.0,
        "oz": 0.0283495, "ounce": 0.0283495, "ounces": 0.0283495,
        "lb": 0.453592, "lbs": 0.453592, "pound": 0.453592, "pounds": 0.453592,
        "st": 6.35029, "stone": 6.35029,
    },
    "volume": {
        "ml": 0.001, "milliliter": 0.001, "millilitre": 0.001,
        "l": 1.0, "liter": 1.0, "litre": 1.0, "liters": 1.0, "litres": 1.0,
        "tsp": 0.00492892, "teaspoon": 0.00492892,
        "tbsp": 0.0147868, "tablespoon": 0.0147868,
        "cup": 0.24, "cups": 0.24,
        "pt": 0.473176, "pint": 0.473176, "pints": 0.473176,
        "qt": 0.946353, "quart": 0.946353,
        "gal": 3.78541, "gallon": 3.78541, "gallons": 3.78541,
    },
    "time": {
        "ms": 0.001, "millisecond": 0.001,
        "s": 1.0, "sec": 1.0, "second": 1.0, "seconds": 1.0,
        "min": 60.0, "minute": 60.0, "minutes": 60.0,
        "h": 3600.0, "hr": 3600.0, "hour": 3600.0, "hours": 3600.0,
        "day": 86400.0, "days": 86400.0,
        "week": 604800.0, "weeks": 604800.0,
        "year": 31557600.0, "years": 31557600.0,
    },
    "speed": {
        "mps": 1.0, "m/s": 1.0,
        "kph": 0.277778, "km/h": 0.277778, "kmh": 0.277778,
        "mph": 0.44704,
        "knot": 0.514444, "knots": 0.514444, "kn": 0.514444,
    },
    "data": {
        "b": 1.0, "byte": 1.0, "bytes": 1.0,
        "kb": 1e3, "kilobyte": 1e3,
        "mb": 1e6, "megabyte": 1e6,
        "gb": 1e9, "gigabyte": 1e9,
        "tb": 1e12, "terabyte": 1e12,
        "kib": 1024.0, "mib": 1024.0 ** 2, "gib": 1024.0 ** 3, "tib": 1024.0 ** 4,
        "bit": 0.125, "bits": 0.125,
    },
}

# Build a reverse lookup: alias -> (category, factor).
_UNIT_INDEX: Dict[str, Tuple[str, float]] = {}
for _category, _units in _CATEGORIES.items():
    for _alias, _factor in _units.items():
        _UNIT_INDEX[_alias] = (_category, _factor)

_TEMPERATURE = {"c", "celsius", "f", "fahrenheit", "k", "kelvin"}


def _fmt(value: float) -> str:
    rounded = round(value, 6)
    return str(int(rounded)) if float(rounded).is_integer() else str(rounded)


def _convert_temperature(value: float, src: str, dst: str) -> Optional[float]:
    src, dst = src[0], dst[0]  # c / f / k
    # Normalise to Celsius first.
    if src == "c":
        celsius = value
    elif src == "f":
        celsius = (value - 32) * 5 / 9
    elif src == "k":
        celsius = value - 273.15
    else:
        return None
    if dst == "c":
        return celsius
    if dst == "f":
        return celsius * 9 / 5 + 32
    if dst == "k":
        return celsius + 273.15
    return None


def solve_units(problem: str) -> Optional[Solution]:
    lowered = problem.lower()
    # Match "<value> <unit> (to|in|into) <unit>", optionally led by "convert".
    m = re.search(
        r"(-?\d+(?:\.\d+)?)\s*([a-z/]+)\s*(?:to|in|into|as)\s*([a-z/]+)",
        lowered,
    )
    if not m:
        return None
    value = float(m.group(1))
    src, dst = m.group(2).strip(), m.group(3).strip()

    # Temperature is affine, so it gets its own path.
    if src in _TEMPERATURE and dst in _TEMPERATURE:
        result = _convert_temperature(value, src, dst)
        if result is None:
            return None
        return Solution(
            kind="Unit Conversion",
            answer=f"{_fmt(value)}°{src[0].upper()} = {_fmt(round(result, 4))}°{dst[0].upper()}.",
            details=["Temperature scales are affine: convert via Celsius, not by ratio."],
            tags=("units",),
        )

    src_info = _UNIT_INDEX.get(src)
    dst_info = _UNIT_INDEX.get(dst)
    if not src_info or not dst_info:
        return None
    if src_info[0] != dst_info[0]:
        return Solution(
            kind="Unit Conversion",
            answer=f"I can't convert {src} ({src_info[0]}) into {dst} ({dst_info[0]}) — different quantities.",
            details=["Pick two units that measure the same thing (length↔length, mass↔mass …)."],
            tags=("units",),
        )

    result = value * src_info[1] / dst_info[1]
    return Solution(
        kind="Unit Conversion",
        answer=f"{_fmt(value)} {src} = {_fmt(round(result, 6))} {dst}.",
        details=[f"Category: {src_info[0]}. 1 {src} = {_fmt(round(src_info[1] / dst_info[1], 6))} {dst}."],
        tags=("units",),
    )


CAPABILITY = Capability(
    name="units",
    summary="Convert between units of length, mass, volume, time, speed, data and temperature.",
    examples=("convert 10 km to miles", "5 kg in lb", "100 c to f", "1 gb in mib"),
    solve=solve_units,
    priority=150,
)
