"""
One-Word Theme + Experiments tracker for 2026.

Choose one word that defines your year, run 3 small testable experiments,
and track progress across core life areas. Minimalist, high-adherence
personal growth system inspired by nik.art, Medium 2026 guides, and
Drucker-style self-management.
"""
from __future__ import annotations

import json
import pathlib
from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from typing import Any, Dict, List, Optional


_DEFAULT_DATA_DIR = pathlib.Path.home() / ".tet"
_DATA_FILE = "theme_2026.json"

CORE_AREAS = ("Health & Energy", "Work & Growth", "Relationships & Connection", "Time & Focus")

SUGGESTED_THEMES = (
    "Momentum", "Clarity", "Energy", "Focus", "Growth",
    "Balance", "Depth", "Craft", "Joy", "Presence",
)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


@dataclass
class Experiment:
    """A small, testable experiment tied to the yearly theme."""

    name: str
    description: str
    start_date: str  # ISO format
    checkpoints: Dict[str, Optional[str]] = field(default_factory=dict)
    status: str = "active"  # active | completed | dropped
    notes: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.checkpoints:
            start = date.fromisoformat(self.start_date)
            for label, days in (("30-day", 30), ("60-day", 60), ("90-day", 90)):
                target = start.toordinal() + days
                target_date = date.fromordinal(target)
                self.checkpoints[label] = None  # None means not yet reviewed

    def record_checkpoint(self, label: str, result: str) -> None:
        if label not in self.checkpoints:
            raise ValueError(f"Unknown checkpoint '{label}'. Expected one of: {list(self.checkpoints)}")
        self.checkpoints[label] = result

    def drop(self, reason: str) -> None:
        self.status = "dropped"
        self.notes.append(f"Dropped: {reason}")

    def complete(self, summary: str) -> None:
        self.status = "completed"
        self.notes.append(f"Completed: {summary}")


@dataclass
class PowerHourEntry:
    """One Power Hour session log."""

    date: str
    focus_task: str
    outcome: str = ""


@dataclass
class WeeklyReset:
    """A weekly reset ritual record."""

    week_of: str  # ISO date of the Monday
    wins: List[str] = field(default_factory=list)
    losses: List[str] = field(default_factory=list)
    next_week_priorities: List[str] = field(default_factory=list)
    notes: str = ""


@dataclass
class EnergyLog:
    """Daily energy tracking entry."""

    date: str
    level: int  # 1-10
    givers: List[str] = field(default_factory=list)
    drains: List[str] = field(default_factory=list)
    sleep_hours: float = 0.0
    cold_exposure: bool = False
    movement: str = ""


@dataclass
class CoreAreaGoal:
    """A goal within one of the four core life areas."""

    area: str
    goal: str
    measurable: str = ""
    status: str = "active"


@dataclass
class ThemeYear:
    """The complete One-Word Theme tracker for the year."""

    theme: str
    year: int = 2026
    set_date: str = field(default_factory=lambda: date.today().isoformat())
    experiments: List[Experiment] = field(default_factory=list)
    power_hours: List[PowerHourEntry] = field(default_factory=list)
    weekly_resets: List[WeeklyReset] = field(default_factory=list)
    energy_logs: List[EnergyLog] = field(default_factory=list)
    core_goals: List[CoreAreaGoal] = field(default_factory=list)
    reflections: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------


def _data_path(data_dir: Optional[pathlib.Path] = None) -> pathlib.Path:
    base = data_dir or _DEFAULT_DATA_DIR
    base.mkdir(parents=True, exist_ok=True)
    return base / _DATA_FILE


def _serialize(obj: Any) -> Any:
    """Recursively convert dataclass instances to dicts."""
    if hasattr(obj, "__dataclass_fields__"):
        return asdict(obj)
    return obj


def save_theme(theme_year: ThemeYear, data_dir: Optional[pathlib.Path] = None) -> pathlib.Path:
    path = _data_path(data_dir)
    path.write_text(json.dumps(_serialize(theme_year), indent=2, ensure_ascii=False))
    return path


def load_theme(data_dir: Optional[pathlib.Path] = None) -> Optional[ThemeYear]:
    path = _data_path(data_dir)
    if not path.exists():
        return None
    raw = json.loads(path.read_text())
    experiments = [Experiment(**{k: v for k, v in e.items()}) for e in raw.get("experiments", [])]
    power_hours = [PowerHourEntry(**p) for p in raw.get("power_hours", [])]
    weekly_resets = [WeeklyReset(**w) for w in raw.get("weekly_resets", [])]
    energy_logs = [EnergyLog(**e) for e in raw.get("energy_logs", [])]
    core_goals = [CoreAreaGoal(**g) for g in raw.get("core_goals", [])]
    return ThemeYear(
        theme=raw["theme"],
        year=raw.get("year", 2026),
        set_date=raw.get("set_date", ""),
        experiments=experiments,
        power_hours=power_hours,
        weekly_resets=weekly_resets,
        energy_logs=energy_logs,
        core_goals=core_goals,
        reflections=raw.get("reflections", []),
    )


# ---------------------------------------------------------------------------
# Theme operations
# ---------------------------------------------------------------------------


def create_theme(word: str, year: int = 2026) -> ThemeYear:
    """Create a new theme year with a single defining word."""
    cleaned = word.strip().capitalize()
    if " " in cleaned:
        raise ValueError(f"Theme must be ONE word, got: '{word}'")
    if not cleaned:
        raise ValueError("Theme word cannot be empty.")
    return ThemeYear(theme=cleaned, year=year)


def add_experiment(
    theme_year: ThemeYear,
    name: str,
    description: str,
    start_date: Optional[str] = None,
) -> Experiment:
    """Add a new experiment (max 3 active at a time)."""
    active = [e for e in theme_year.experiments if e.status == "active"]
    if len(active) >= 3:
        raise ValueError(
            "You already have 3 active experiments. "
            "Drop or complete one before adding another. "
            "The whole point is focus, not overwhelm!"
        )
    exp = Experiment(
        name=name,
        description=description,
        start_date=start_date or date.today().isoformat(),
    )
    theme_year.experiments.append(exp)
    return exp


def log_power_hour(
    theme_year: ThemeYear,
    focus_task: str,
    outcome: str = "",
    entry_date: Optional[str] = None,
) -> PowerHourEntry:
    """Log a Power Hour session."""
    entry = PowerHourEntry(
        date=entry_date or date.today().isoformat(),
        focus_task=focus_task,
        outcome=outcome,
    )
    theme_year.power_hours.append(entry)
    return entry


def log_weekly_reset(
    theme_year: ThemeYear,
    wins: List[str],
    losses: List[str],
    priorities: List[str],
    notes: str = "",
    week_of: Optional[str] = None,
) -> WeeklyReset:
    """Record a weekly reset ritual."""
    today = date.today()
    monday = today.toordinal() - today.weekday()
    reset = WeeklyReset(
        week_of=week_of or date.fromordinal(monday).isoformat(),
        wins=wins,
        losses=losses,
        next_week_priorities=priorities,
        notes=notes,
    )
    theme_year.weekly_resets.append(reset)
    return reset


def log_energy(
    theme_year: ThemeYear,
    level: int,
    givers: Optional[List[str]] = None,
    drains: Optional[List[str]] = None,
    sleep_hours: float = 0.0,
    cold_exposure: bool = False,
    movement: str = "",
    entry_date: Optional[str] = None,
) -> EnergyLog:
    """Log daily energy level and factors."""
    if not 1 <= level <= 10:
        raise ValueError("Energy level must be between 1 and 10.")
    entry = EnergyLog(
        date=entry_date or date.today().isoformat(),
        level=level,
        givers=givers or [],
        drains=drains or [],
        sleep_hours=sleep_hours,
        cold_exposure=cold_exposure,
        movement=movement,
    )
    theme_year.energy_logs.append(entry)
    return entry


def add_core_goal(
    theme_year: ThemeYear,
    area: str,
    goal: str,
    measurable: str = "",
) -> CoreAreaGoal:
    """Add a goal to one of the four core areas."""
    if area not in CORE_AREAS:
        raise ValueError(f"Area must be one of: {CORE_AREAS}")
    area_goals = [g for g in theme_year.core_goals if g.area == area and g.status == "active"]
    if len(area_goals) >= 2:
        raise ValueError(f"Max 2 active goals per area. '{area}' already has {len(area_goals)}.")
    cg = CoreAreaGoal(area=area, goal=goal, measurable=measurable)
    theme_year.core_goals.append(cg)
    return cg


# ---------------------------------------------------------------------------
# Dashboard / summary
# ---------------------------------------------------------------------------


def dashboard(theme_year: ThemeYear) -> str:
    """Generate a text dashboard of the current theme year status."""
    lines: List[str] = []
    lines.append(f"{'=' * 50}")
    lines.append(f"  2026 THEME: {theme_year.theme.upper()}")
    lines.append(f"  Set on: {theme_year.set_date}")
    lines.append(f"{'=' * 50}")

    # Experiments
    lines.append("")
    lines.append("EXPERIMENTS (max 3 active)")
    lines.append("-" * 30)
    if not theme_year.experiments:
        lines.append("  No experiments yet. Time to design your first test!")
    for i, exp in enumerate(theme_year.experiments, 1):
        status_icon = {"active": ">>", "completed": "OK", "dropped": "XX"}[exp.status]
        lines.append(f"  [{status_icon}] {i}. {exp.name}")
        lines.append(f"       {exp.description}")
        checked = sum(1 for v in exp.checkpoints.values() if v is not None)
        total = len(exp.checkpoints)
        lines.append(f"       Checkpoints: {checked}/{total} reviewed")

    # Power Hours
    lines.append("")
    lines.append(f"POWER HOURS: {len(theme_year.power_hours)} sessions logged")

    # Weekly Resets
    lines.append(f"WEEKLY RESETS: {len(theme_year.weekly_resets)} completed")

    # Energy
    if theme_year.energy_logs:
        avg_energy = sum(e.level for e in theme_year.energy_logs) / len(theme_year.energy_logs)
        cold_days = sum(1 for e in theme_year.energy_logs if e.cold_exposure)
        lines.append(f"ENERGY: avg {avg_energy:.1f}/10 over {len(theme_year.energy_logs)} days "
                      f"({cold_days} cold exposure days)")
    else:
        lines.append("ENERGY: No logs yet. Start tracking to find your patterns!")

    # Core Areas
    lines.append("")
    lines.append("CORE AREAS")
    lines.append("-" * 30)
    for area in CORE_AREAS:
        goals = [g for g in theme_year.core_goals if g.area == area]
        active = [g for g in goals if g.status == "active"]
        lines.append(f"  {area}: {len(active)} active goal(s)")
        for g in active:
            lines.append(f"    - {g.goal}")
            if g.measurable:
                lines.append(f"      Measure: {g.measurable}")

    lines.append("")
    lines.append(f"{'=' * 50}")
    return "\n".join(lines)


def experiment_report(experiment: Experiment) -> str:
    """Generate a detailed report for a single experiment."""
    lines: List[str] = []
    status_label = experiment.status.upper()
    lines.append(f"Experiment: {experiment.name} [{status_label}]")
    lines.append(f"Started: {experiment.start_date}")
    lines.append(f"Description: {experiment.description}")
    lines.append("")
    lines.append("Checkpoints:")
    for label, result in experiment.checkpoints.items():
        marker = "OK" if result else ".."
        display = result or "not yet reviewed"
        lines.append(f"  [{marker}] {label}: {display}")
    if experiment.notes:
        lines.append("")
        lines.append("Notes:")
        for note in experiment.notes:
            lines.append(f"  - {note}")
    return "\n".join(lines)


def energy_trends(theme_year: ThemeYear) -> str:
    """Summarize energy trends from logged data."""
    logs = theme_year.energy_logs
    if not logs:
        return "No energy data yet. Log a few days to see trends."

    avg = sum(e.level for e in logs) / len(logs)
    best = max(logs, key=lambda e: e.level)
    worst = min(logs, key=lambda e: e.level)

    all_givers: Dict[str, int] = {}
    all_drains: Dict[str, int] = {}
    for log in logs:
        for g in log.givers:
            all_givers[g] = all_givers.get(g, 0) + 1
        for d in log.drains:
            all_drains[d] = all_drains.get(d, 0) + 1

    lines: List[str] = []
    lines.append(f"Energy Trends ({len(logs)} entries)")
    lines.append(f"  Average: {avg:.1f}/10")
    lines.append(f"  Best day: {best.date} (level {best.level})")
    lines.append(f"  Worst day: {worst.date} (level {worst.level})")

    if all_givers:
        top_givers = sorted(all_givers.items(), key=lambda x: -x[1])[:3]
        lines.append(f"  Top energy givers: {', '.join(f'{g} ({c}x)' for g, c in top_givers)}")
    if all_drains:
        top_drains = sorted(all_drains.items(), key=lambda x: -x[1])[:3]
        lines.append(f"  Top energy drains: {', '.join(f'{d} ({c}x)' for d, c in top_drains)}")

    cold_days = [e for e in logs if e.cold_exposure]
    if cold_days:
        cold_avg = sum(e.level for e in cold_days) / len(cold_days)
        no_cold = [e for e in logs if not e.cold_exposure]
        no_cold_avg = sum(e.level for e in no_cold) / len(no_cold) if no_cold else 0
        lines.append(f"  Cold exposure days: avg {cold_avg:.1f} vs non-cold: avg {no_cold_avg:.1f}")

    return "\n".join(lines)
