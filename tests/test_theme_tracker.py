import pathlib
import tempfile

import pytest

import theme_tracker


@pytest.fixture
def tmp_dir():
    with tempfile.TemporaryDirectory() as d:
        yield pathlib.Path(d)


# ---------------------------------------------------------------------------
# Theme creation
# ---------------------------------------------------------------------------


def test_create_theme_single_word():
    ty = theme_tracker.create_theme("focus")
    assert ty.theme == "Focus"
    assert ty.year == 2026


def test_create_theme_rejects_multi_word():
    with pytest.raises(ValueError, match="ONE word"):
        theme_tracker.create_theme("deep focus")


def test_create_theme_rejects_empty():
    with pytest.raises(ValueError, match="empty"):
        theme_tracker.create_theme("  ")


# ---------------------------------------------------------------------------
# Experiments
# ---------------------------------------------------------------------------


def test_add_experiment_up_to_three():
    ty = theme_tracker.create_theme("Momentum")
    theme_tracker.add_experiment(ty, "Power Hour", "1h deep work daily", start_date="2026-01-06")
    theme_tracker.add_experiment(ty, "Weekly Reset", "Sunday review ritual", start_date="2026-01-06")
    theme_tracker.add_experiment(ty, "Cold Shower", "2-min cold exposure daily", start_date="2026-01-06")
    assert len(ty.experiments) == 3


def test_add_experiment_rejects_fourth():
    ty = theme_tracker.create_theme("Energy")
    for i in range(3):
        theme_tracker.add_experiment(ty, f"Exp{i}", f"Desc{i}", start_date="2026-01-06")
    with pytest.raises(ValueError, match="3 active"):
        theme_tracker.add_experiment(ty, "TooMany", "Nope", start_date="2026-01-06")


def test_experiment_checkpoints_initialized():
    ty = theme_tracker.create_theme("Clarity")
    exp = theme_tracker.add_experiment(ty, "Walk", "10-min daily walk", start_date="2026-02-01")
    assert "30-day" in exp.checkpoints
    assert "60-day" in exp.checkpoints
    assert "90-day" in exp.checkpoints
    assert all(v is None for v in exp.checkpoints.values())


def test_record_checkpoint():
    ty = theme_tracker.create_theme("Growth")
    exp = theme_tracker.add_experiment(ty, "Journal", "Daily journaling", start_date="2026-01-01")
    exp.record_checkpoint("30-day", "Stuck with it 25/30 days. Feeling clearer.")
    assert exp.checkpoints["30-day"] is not None
    assert "25/30" in exp.checkpoints["30-day"]


def test_drop_experiment():
    ty = theme_tracker.create_theme("Balance")
    exp = theme_tracker.add_experiment(ty, "Fasting", "16:8 IF", start_date="2026-01-01")
    exp.drop("Made me cranky, not worth it")
    assert exp.status == "dropped"
    assert any("cranky" in n for n in exp.notes)


def test_complete_experiment():
    ty = theme_tracker.create_theme("Depth")
    exp = theme_tracker.add_experiment(ty, "Reading", "30 min reading daily", start_date="2026-01-01")
    exp.complete("Finished 6 books in 90 days!")
    assert exp.status == "completed"


def test_can_add_after_dropping():
    ty = theme_tracker.create_theme("Focus")
    for i in range(3):
        theme_tracker.add_experiment(ty, f"Exp{i}", f"Desc{i}", start_date="2026-01-01")
    ty.experiments[0].drop("Did not work")
    # Should work now since only 2 are active
    theme_tracker.add_experiment(ty, "NewExp", "Replacement", start_date="2026-02-01")
    active = [e for e in ty.experiments if e.status == "active"]
    assert len(active) == 3


# ---------------------------------------------------------------------------
# Power Hour
# ---------------------------------------------------------------------------


def test_log_power_hour():
    ty = theme_tracker.create_theme("Craft")
    entry = theme_tracker.log_power_hour(ty, "Build landing page", outcome="Draft done")
    assert entry.focus_task == "Build landing page"
    assert len(ty.power_hours) == 1


# ---------------------------------------------------------------------------
# Weekly Reset
# ---------------------------------------------------------------------------


def test_log_weekly_reset():
    ty = theme_tracker.create_theme("Presence")
    reset = theme_tracker.log_weekly_reset(
        ty,
        wins=["Shipped feature", "Ran 3x"],
        losses=["Skipped meal prep"],
        priorities=["Finish proposal", "Strength training"],
        notes="Good week overall",
    )
    assert len(reset.wins) == 2
    assert len(reset.losses) == 1
    assert len(reset.next_week_priorities) == 2


# ---------------------------------------------------------------------------
# Energy
# ---------------------------------------------------------------------------


def test_log_energy_valid():
    ty = theme_tracker.create_theme("Energy")
    entry = theme_tracker.log_energy(
        ty, level=7, givers=["Morning run", "Good sleep"],
        drains=["Back-to-back meetings"], sleep_hours=7.5,
        cold_exposure=True, movement="5k run",
    )
    assert entry.level == 7
    assert entry.cold_exposure is True
    assert len(ty.energy_logs) == 1


def test_log_energy_rejects_invalid_level():
    ty = theme_tracker.create_theme("Energy")
    with pytest.raises(ValueError, match="between 1 and 10"):
        theme_tracker.log_energy(ty, level=0)
    with pytest.raises(ValueError, match="between 1 and 10"):
        theme_tracker.log_energy(ty, level=11)


# ---------------------------------------------------------------------------
# Core Area Goals
# ---------------------------------------------------------------------------


def test_add_core_goal():
    ty = theme_tracker.create_theme("Growth")
    cg = theme_tracker.add_core_goal(ty, "Health & Energy", "10k steps daily", measurable="Step count app")
    assert cg.area == "Health & Energy"
    assert len(ty.core_goals) == 1


def test_core_goal_rejects_invalid_area():
    ty = theme_tracker.create_theme("Growth")
    with pytest.raises(ValueError, match="must be one of"):
        theme_tracker.add_core_goal(ty, "Fun & Games", "Play more")


def test_core_goal_max_two_per_area():
    ty = theme_tracker.create_theme("Growth")
    theme_tracker.add_core_goal(ty, "Work & Growth", "Learn Rust")
    theme_tracker.add_core_goal(ty, "Work & Growth", "Lead project")
    with pytest.raises(ValueError, match="Max 2"):
        theme_tracker.add_core_goal(ty, "Work & Growth", "Third goal")


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------


def test_save_and_load_roundtrip(tmp_dir):
    ty = theme_tracker.create_theme("Focus")
    theme_tracker.add_experiment(ty, "Deep Work", "1h blocked daily", start_date="2026-01-10")
    theme_tracker.log_power_hour(ty, "Proposal writing", outcome="First draft", entry_date="2026-01-11")
    theme_tracker.log_energy(ty, level=8, givers=["Walk"], sleep_hours=8.0, entry_date="2026-01-11")
    theme_tracker.add_core_goal(ty, "Health & Energy", "Strength 3x/week")

    theme_tracker.save_theme(ty, data_dir=tmp_dir)
    loaded = theme_tracker.load_theme(data_dir=tmp_dir)

    assert loaded is not None
    assert loaded.theme == "Focus"
    assert len(loaded.experiments) == 1
    assert loaded.experiments[0].name == "Deep Work"
    assert loaded.experiments[0].checkpoints["30-day"] is None
    assert len(loaded.power_hours) == 1
    assert len(loaded.energy_logs) == 1
    assert loaded.energy_logs[0].level == 8
    assert len(loaded.core_goals) == 1


def test_load_returns_none_when_no_file(tmp_dir):
    assert theme_tracker.load_theme(data_dir=tmp_dir) is None


# ---------------------------------------------------------------------------
# Dashboard & Reports
# ---------------------------------------------------------------------------


def test_dashboard_contains_theme():
    ty = theme_tracker.create_theme("Momentum")
    output = theme_tracker.dashboard(ty)
    assert "MOMENTUM" in output
    assert "EXPERIMENTS" in output
    assert "CORE AREAS" in output


def test_experiment_report_shows_checkpoints():
    ty = theme_tracker.create_theme("Clarity")
    exp = theme_tracker.add_experiment(ty, "Meditation", "10 min daily", start_date="2026-01-01")
    exp.record_checkpoint("30-day", "Missed 5 days but feel calmer")
    report = theme_tracker.experiment_report(exp)
    assert "Meditation" in report
    assert "30-day" in report
    assert "calmer" in report


def test_energy_trends_with_data():
    ty = theme_tracker.create_theme("Energy")
    theme_tracker.log_energy(ty, 8, givers=["Sleep", "Walk"], cold_exposure=True, entry_date="2026-01-01")
    theme_tracker.log_energy(ty, 5, drains=["Meetings"], cold_exposure=False, entry_date="2026-01-02")
    theme_tracker.log_energy(ty, 7, givers=["Sleep"], cold_exposure=True, entry_date="2026-01-03")
    output = theme_tracker.energy_trends(ty)
    assert "6.7" in output  # average
    assert "Sleep" in output
    assert "cold" in output.lower()


def test_energy_trends_empty():
    ty = theme_tracker.create_theme("Energy")
    output = theme_tracker.energy_trends(ty)
    assert "No energy data" in output
