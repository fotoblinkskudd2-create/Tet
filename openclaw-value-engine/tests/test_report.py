import json
import os
import tempfile

from src.parser import parse_ideas_directory
from src.report import build_json_report, build_markdown_report, run
from src.scorer import score_ideas

SAMPLE_INPUTS = os.path.join(os.path.dirname(__file__), "..", "inputs")


def test_build_markdown_report_has_no_empty_sections():
    ideas = parse_ideas_directory(SAMPLE_INPUTS)
    scored = score_ideas(ideas)
    markdown = build_markdown_report(scored)
    assert "# OpenClaw Value Report" in markdown
    assert "Hvem betaler:" in markdown
    for idea in scored:
        assert idea["name"] in markdown


def test_build_json_report_structure():
    ideas = parse_ideas_directory(SAMPLE_INPUTS)
    scored = score_ideas(ideas)
    report = build_json_report(scored)
    assert report["idea_count"] == len(scored)
    assert "category_counts" in report
    assert "recommendation_counts" in report
    assert len(report["ideas"]) == len(scored)


def test_run_writes_all_output_files():
    with tempfile.TemporaryDirectory() as tmp_outputs:
        report = run(inputs_dir=SAMPLE_INPUTS, outputs_dir=tmp_outputs)
        assert os.path.exists(os.path.join(tmp_outputs, "value_report.md"))
        assert os.path.exists(os.path.join(tmp_outputs, "value_report.json"))
        assert os.path.exists(os.path.join(tmp_outputs, "dashboard.html"))
        with open(os.path.join(tmp_outputs, "value_report.json"), encoding="utf-8") as handle:
            written = json.load(handle)
        assert written["idea_count"] == report["idea_count"]
