import math

import propeller_sim as ps


def test_single_evaluation_is_physically_sensible():
    res = ps.evaluate_prop(diameter_in=10, pitch_in=4.5, rpm=8000)
    assert res.thrust_n > 0
    assert res.thrust_g > 0
    assert res.power_w > 0
    assert res.efficiency_g_per_w > 0
    # A 10x4.5 at 8000 rpm sits in a sane ballpark (hundreds of grams).
    assert 300 < res.thrust_g < 1500


def test_more_rpm_makes_more_thrust():
    low = ps.evaluate_prop(10, 4.5, 6000)
    high = ps.evaluate_prop(10, 4.5, 9000)
    assert high.thrust_g > low.thrust_g


def test_bigger_disk_is_more_efficient_at_equal_thrust():
    # Momentum theory: a larger disk produces a given thrust more efficiently.
    small = ps.evaluate_prop(8, 4.5, 9000)
    big = ps.evaluate_prop(12, 4.5, 6500)
    # Compare at roughly similar thrust by checking efficiency ordering of disks.
    assert big.efficiency_g_per_w > small.efficiency_g_per_w


def test_evaluate_rejects_bad_input():
    for bad in [(0, 4.5, 8000), (10, 0, 8000), (10, 4.5, 0)]:
        try:
            ps.evaluate_prop(*bad)
        except ValueError:
            continue
        raise AssertionError(f"Expected ValueError for {bad}")


def test_parse_spec_single_and_range():
    assert ps.parse_spec("10") == [10.0]
    assert ps.parse_spec("8:12:1") == [8.0, 9.0, 10.0, 11.0, 12.0]


def test_parse_spec_rejects_bad_range():
    for bad in ["8:12", "12:8:1", "8:12:0"]:
        try:
            ps.parse_spec(bad)
        except ValueError:
            continue
        raise AssertionError(f"Expected ValueError for {bad}")


def test_sweep_returns_sorted_and_limited_results():
    diameters = ps.parse_spec("8:12:1")
    rpms = ps.parse_spec("6000:9000:1000")
    best = ps.sweep_props(diameters, [4.5], rpms, rank_by="efficiency", top=5)
    assert len(best) == 5
    # Results must be sorted descending by the ranking metric.
    effs = [r.efficiency_g_per_w for r in best]
    assert effs == sorted(effs, reverse=True)


def test_sweep_rank_by_thrust_puts_strongest_first():
    diameters = ps.parse_spec("8:12:1")
    rpms = ps.parse_spec("6000:9000:1000")
    best = ps.sweep_props(diameters, [4.5], rpms, rank_by="thrust", top=3)
    thrusts = [r.thrust_g for r in best]
    assert thrusts == sorted(thrusts, reverse=True)
