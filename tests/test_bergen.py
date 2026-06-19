from datetime import date

import bergen


def _run():
    return bergen.orchestrate(
        date(2026, 6, 19),
        weather_key="regnbyger",
        video_count=50,
        image_count=60,
    )


def test_generates_full_unique_video_set():
    run = _run()
    assert len(run.video_prompts) == 50
    assert len(set(run.video_prompts)) == 50  # no placeholders, all unique


def test_generates_full_unique_image_set():
    run = _run()
    assert len(run.image_prompts) == 60
    assert len(set(run.image_prompts)) == 60
    assert all("--ar" in p and "--v" in p for p in run.image_prompts)


def test_runs_are_deterministic_for_same_seed():
    assert _run().video_prompts == _run().video_prompts


def test_different_seed_changes_output():
    a = bergen.orchestrate(date(2026, 6, 19), seed="alt", weather_key="regnbyger")
    b = bergen.orchestrate(date(2026, 6, 19), seed="bergen-default", weather_key="regnbyger")
    assert a.video_prompts != b.video_prompts


def test_forced_weather_is_respected():
    run = bergen.orchestrate(date(2026, 6, 19), weather_key="sol")
    assert run.weather.key == "sol"


def test_unknown_weather_raises():
    try:
        bergen.orchestrate(date(2026, 6, 19), weather_key="hurricane")
    except ValueError as exc:
        assert "Unknown weather" in str(exc)
    else:  # pragma: no cover
        raise AssertionError("expected ValueError for unknown weather")


def test_poems_and_inventions_present():
    run = _run()
    assert len(run.poems) == 6
    assert all(title and body for title, body in run.poems)
    assert len(run.inventions) == 6
    assert all(inv.next_step for inv in run.inventions)


def test_render_run_full_contains_all_sections():
    run = _run()
    md = bergen.render_run(run)
    for heading in ("Drømmer", "dagsplan", "video-prompts", "bilde-prompts",
                    "Dikt", "Oppfinnelser", "Neste steg"):
        assert heading in md


def test_render_section_narrows_output():
    run = _run()
    md = bergen.render_run(run, section="poems")
    assert "Dikt" in md
    assert "video-prompts" not in md


def test_summary_is_compact():
    run = _run()
    summary = bergen.render_summary(run)
    assert "Bergen" in summary
    assert summary.count("\n") <= 5


def test_cli_bergen_summary(capsys):
    import app

    rc = app.main(["--bergen", "--summary", "--weather", "regnbyger"])
    out = capsys.readouterr().out
    assert rc == 0
    assert "Bergen" in out
