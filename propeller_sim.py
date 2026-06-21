"""
Propeller performance simulator for drone / multirotor design exploration.

A first-pass engineering tool: estimate static thrust, required power, and
efficiency for a propeller, then sweep across design parameters to compare many
configurations at once and rank the best ones.

The workflow it supports:
    1. Describe a propeller virtually (diameter, pitch, RPM).
    2. Run it dozens or hundreds of ways via parameter sweeps.
    3. Let the tool rank them so you build only the shortlist for real.

Physics notes (honest about the limits):
    * Thrust uses a well-known empirical model (Staples' propeller thrust
      formula), accurate enough to compare designs, not to certify one.
    * Power uses momentum (actuator-disk) theory with a figure of merit to
      account for real-world losses.
    * This narrows the design space fast. It is NOT a CFD replacement—validate
      the shortlist with real tests or higher-fidelity tools.
"""
from __future__ import annotations

import argparse
import itertools
import math
from dataclasses import dataclass
from typing import List, Sequence

INCH_TO_M = 0.0254
AIR_DENSITY = 1.225  # kg/m^3, sea level, 15 C
GRAVITY = 9.80665  # m/s^2
SPEED_OF_SOUND = 343.0  # m/s


@dataclass
class PropResult:
    """Performance estimate for one propeller configuration."""

    diameter_in: float
    pitch_in: float
    rpm: float
    thrust_n: float
    thrust_g: float
    power_w: float
    efficiency_g_per_w: float
    tip_mach: float

    def summary(self) -> str:
        return (
            f"{self.diameter_in:g}x{self.pitch_in:g} @ {self.rpm:.0f} rpm  ->  "
            f"thrust {self.thrust_g:,.0f} g ({self.thrust_n:.2f} N), "
            f"power {self.power_w:,.0f} W, "
            f"efficiency {self.efficiency_g_per_w:.2f} g/W, "
            f"tip Mach {self.tip_mach:.2f}"
        )


def evaluate_prop(
    diameter_in: float,
    pitch_in: float,
    rpm: float,
    airspeed_ms: float = 0.0,
    figure_of_merit: float = 0.6,
) -> PropResult:
    """Estimate performance for a single propeller configuration.

    diameter_in, pitch_in : propeller geometry in inches (e.g. 10 x 4.5).
    rpm                    : rotational speed.
    airspeed_ms           : forward airspeed (0 = static / hover thrust).
    figure_of_merit       : real-vs-ideal power factor, ~0.5-0.7 for small props.
    """

    if diameter_in <= 0 or pitch_in <= 0 or rpm <= 0:
        raise ValueError("Diameter, pitch, and RPM must all be positive.")
    if not 0 < figure_of_merit <= 1:
        raise ValueError("Figure of merit must be between 0 and 1.")

    # Empirical dynamic thrust (inputs in inches and RPM, result in Newtons).
    thrust_n = (
        4.392399e-8
        * rpm
        * (diameter_in ** 3.5 / math.sqrt(pitch_in))
        * (4.23333e-4 * rpm * pitch_in - airspeed_ms)
    )
    thrust_n = max(thrust_n, 0.0)
    thrust_g = thrust_n / GRAVITY * 1000.0

    # Momentum (actuator-disk) theory for induced power, adjusted by efficiency.
    disk_area = math.pi * (diameter_in * INCH_TO_M) ** 2 / 4.0
    if thrust_n > 0.0:
        ideal_power = thrust_n ** 1.5 / math.sqrt(2 * AIR_DENSITY * disk_area)
        power_w = ideal_power / figure_of_merit
    else:
        power_w = 0.0

    efficiency = thrust_g / power_w if power_w > 0 else 0.0

    tip_speed = math.pi * (diameter_in * INCH_TO_M) * rpm / 60.0
    tip_mach = tip_speed / SPEED_OF_SOUND

    return PropResult(
        diameter_in=diameter_in,
        pitch_in=pitch_in,
        rpm=rpm,
        thrust_n=thrust_n,
        thrust_g=thrust_g,
        power_w=power_w,
        efficiency_g_per_w=efficiency,
        tip_mach=tip_mach,
    )


def sweep_props(
    diameters: Sequence[float],
    pitches: Sequence[float],
    rpms: Sequence[float],
    airspeed_ms: float = 0.0,
    figure_of_merit: float = 0.6,
    rank_by: str = "efficiency",
    top: int = 10,
) -> List[PropResult]:
    """Evaluate every combination of inputs and return the best `top` results.

    rank_by : "efficiency" (g/W) or "thrust" (grams).
    """

    if rank_by not in ("efficiency", "thrust"):
        raise ValueError("rank_by must be 'efficiency' or 'thrust'.")

    results = [
        evaluate_prop(d, p, r, airspeed_ms, figure_of_merit)
        for d, p, r in itertools.product(diameters, pitches, rpms)
    ]

    key = (
        (lambda res: res.efficiency_g_per_w)
        if rank_by == "efficiency"
        else (lambda res: res.thrust_g)
    )
    results.sort(key=key, reverse=True)
    return results[: max(top, 1)]


def parse_spec(spec: str) -> List[float]:
    """Parse a value spec into a list of numbers.

    "10"        -> [10.0]                 (single value)
    "8:12:0.5"  -> [8.0, 8.5, ..., 12.0]  (min:max:step range, for sweeps)
    """

    parts = spec.split(":")
    if len(parts) == 1:
        return [float(parts[0])]
    if len(parts) == 3:
        start, stop, step = (float(p) for p in parts)
        if step <= 0:
            raise ValueError("Step must be positive in a min:max:step range.")
        if stop < start:
            raise ValueError("Max must be >= min in a min:max:step range.")
        values: List[float] = []
        current = start
        while current <= stop + 1e-9:
            values.append(round(current, 6))
            current += step
        return values
    raise ValueError("Use a single value like '10' or a range like '8:12:0.5'.")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Estimate drone propeller thrust, power, and efficiency—one config "
            "or a full parameter sweep. Use single values (10) or ranges "
            "(8:12:0.5) for --diameter, --pitch, and --rpm."
        )
    )
    parser.add_argument("--diameter", default="10", help="Diameter in inches (value or min:max:step).")
    parser.add_argument("--pitch", default="4.5", help="Pitch in inches (value or min:max:step).")
    parser.add_argument("--rpm", default="8000", help="RPM (value or min:max:step).")
    parser.add_argument("--airspeed", type=float, default=0.0, help="Forward airspeed m/s (0 = hover).")
    parser.add_argument("--fom", type=float, default=0.6, help="Figure of merit 0-1 (default 0.6).")
    parser.add_argument(
        "--rank", choices=["efficiency", "thrust"], default="efficiency",
        help="What to optimize for when sweeping (default: efficiency).",
    )
    parser.add_argument("--top", type=int, default=10, help="How many top results to show in a sweep.")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)

    diameters = parse_spec(args.diameter)
    pitches = parse_spec(args.pitch)
    rpms = parse_spec(args.rpm)
    total = len(diameters) * len(pitches) * len(rpms)

    if total == 1:
        result = evaluate_prop(diameters[0], pitches[0], rpms[0], args.airspeed, args.fom)
        print("Propeller estimate")
        print("=" * 60)
        print(result.summary())
        return 0

    print(f"Swept {total} configurations — top {min(args.top, total)} by {args.rank}:")
    print("=" * 78)
    for rank, result in enumerate(sweep_props(
        diameters, pitches, rpms, args.airspeed, args.fom, args.rank, args.top
    ), start=1):
        print(f"{rank:>2}. {result.summary()}")
    print("=" * 78)
    print("Reminder: first-pass estimates to shortlist designs — validate the winners for real.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
