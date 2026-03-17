"""Tests for the IDE Smart Ideas Generator brain."""
import os
import tempfile

import ide_brain


# ---------------------------------------------------------------------------
# Core data structures
# ---------------------------------------------------------------------------

def test_idea_format_includes_priority_and_category():
    idea = ide_brain.Idea(
        category="Security",
        title="Fix the thing",
        description="Detailed explanation.",
        priority="high",
        tags=["security"],
    )
    text = idea.format()
    assert "[HIGH]" in text
    assert "Security" in text
    assert "Fix the thing" in text
    assert "[security]" in text


def test_idea_format_without_tags():
    idea = ide_brain.Idea(
        category="Testing",
        title="Add tests",
        description="Write them.",
        priority="low",
    )
    text = idea.format()
    assert "[LOW]" in text
    assert "Testing" in text
    assert "[" not in text.split("\n")[0].split("Add tests")[1]  # no tag brackets after title


def test_idea_report_format_no_ideas():
    report = ide_brain.IdeaReport(context_summary="Empty scan", ideas=[])
    text = report.format()
    assert "looks solid" in text.lower()


def test_idea_report_format_with_ideas():
    ideas = [
        ide_brain.Idea("Cat", "Title", "Desc", "medium"),
        ide_brain.Idea("Cat2", "Title2", "Desc2", "high"),
    ]
    report = ide_brain.IdeaReport(context_summary="Test code", ideas=ideas)
    text = report.format()
    assert "2 ideas" in text
    assert "1 high" in text
    assert "1 medium" in text


# ---------------------------------------------------------------------------
# Code pattern detectors
# ---------------------------------------------------------------------------

def test_detect_bare_except():
    code = """
try:
    risky()
except:
    pass
"""
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("bare except" in t.lower() for t in titles)


def test_detect_eval_usage():
    code = """
result = eval(user_input)
"""
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("eval" in t.lower() for t in titles)


def test_detect_hardcoded_secrets():
    code = """
API_KEY = "sk-abc123secretkey456"
password = "hunter2"
"""
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("secret" in t.lower() or "environment" in t.lower() for t in titles)


def test_detect_sql_injection():
    code = """
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
"""
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("parameterized" in t.lower() for t in titles)


def test_detect_file_open_without_context_manager():
    code = """
f = open("data.txt")
data = f.read()
f.close()
"""
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("context manager" in t.lower() for t in titles)


def test_detect_nested_loops():
    code = """
for item in big_list:
    for other in another_list:
        if item == other:
            found.append(item)
"""
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("set" in t.lower() or "nested" in t.lower() for t in titles)


def test_detect_long_function():
    # Build a function that's over 40 lines
    lines = ["def very_long_function(x):"]
    for i in range(50):
        lines.append(f"    x = x + {i}")
    lines.append("    return x")
    code = "\n".join(lines)
    report = ide_brain.generate_ideas(code=code)
    titles = [i.title for i in report.ideas]
    assert any("very_long_function" in t for t in titles)


def test_detect_many_classes_suggests_split():
    classes = "\n\n".join(
        f"class Widget{i}:\n    pass" for i in range(7)
    )
    report = ide_brain.generate_ideas(code=classes)
    titles = [i.title for i in report.ideas]
    assert any("split" in t.lower() for t in titles)


# ---------------------------------------------------------------------------
# Domain-based context ideas
# ---------------------------------------------------------------------------

def test_api_context_generates_api_ideas():
    report = ide_brain.generate_ideas(context="Building a REST API for user management")
    categories = [i.category for i in report.ideas]
    assert "Security" in categories or "Architecture" in categories


def test_auth_context_generates_auth_ideas():
    report = ide_brain.generate_ideas(context="Implementing JWT login and signup")
    titles = " ".join(i.title for i in report.ideas).lower()
    assert "token" in titles or "brute" in titles


def test_frontend_context_generates_frontend_ideas():
    report = ide_brain.generate_ideas(context="React component rendering optimization")
    titles = " ".join(i.title for i in report.ideas).lower()
    assert "lazy" in titles or "component" in titles


def test_database_context_generates_db_ideas():
    report = ide_brain.generate_ideas(context="Optimizing PostgreSQL query performance")
    titles = " ".join(i.title for i in report.ideas).lower()
    assert "index" in titles or "migration" in titles


def test_cli_context_generates_cli_ideas():
    report = ide_brain.generate_ideas(context="Building a CLI tool with argparse")
    titles = " ".join(i.title for i in report.ideas).lower()
    assert "completion" in titles or "plugin" in titles


# ---------------------------------------------------------------------------
# Combined code + context
# ---------------------------------------------------------------------------

def test_combined_code_and_context():
    code = """
try:
    result = eval(user_input)
except:
    pass
"""
    report = ide_brain.generate_ideas(code=code, context="API endpoint handler")
    # Should have both code-based and domain-based ideas
    categories = {i.category for i in report.ideas}
    assert len(categories) >= 2  # At least security + error handling or similar


# ---------------------------------------------------------------------------
# Deduplication and ordering
# ---------------------------------------------------------------------------

def test_ideas_sorted_by_priority():
    code = """
try:
    result = eval(user_input)
except:
    pass
"""
    report = ide_brain.generate_ideas(code=code)
    priorities = [i.priority for i in report.ideas]
    order = {"high": 0, "medium": 1, "low": 2}
    for i in range(len(priorities) - 1):
        assert order[priorities[i]] <= order[priorities[i + 1]]


def test_max_ideas_limit():
    # Produce a lot of context to trigger many ideas
    report = ide_brain.generate_ideas(
        context="API database frontend auth CLI",
        max_ideas=3,
    )
    assert len(report.ideas) <= 3


def test_no_duplicate_titles():
    code = """
password = "secret123"
API_KEY = "sk-test-key"
"""
    report = ide_brain.generate_ideas(
        code=code,
        context="REST API with auth tokens and passwords",
    )
    titles = [i.title for i in report.ideas]
    assert len(titles) == len(set(titles))


# ---------------------------------------------------------------------------
# File-based analysis
# ---------------------------------------------------------------------------

def test_generate_ideas_from_file():
    code = """
def example():
    result = eval(input())
    return result
"""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        f.flush()
        path = f.name

    try:
        report = ide_brain.generate_ideas_from_file(path)
        assert report.context_summary
        assert any("eval" in i.title.lower() for i in report.ideas)
    finally:
        os.unlink(path)


def test_generate_ideas_from_file_with_context():
    code = "x = 1\n"
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        f.flush()
        path = f.name

    try:
        report = ide_brain.generate_ideas_from_file(path, context="REST API handler")
        assert "REST API" in report.context_summary
    finally:
        os.unlink(path)


# ---------------------------------------------------------------------------
# Empty / edge cases
# ---------------------------------------------------------------------------

def test_empty_code_and_context():
    report = ide_brain.generate_ideas(code="", context="")
    assert report.ideas == []


def test_whitespace_only_code():
    report = ide_brain.generate_ideas(code="   \n\n  ", context="")
    assert report.ideas == []


def test_none_code():
    report = ide_brain.generate_ideas(code=None, context="")
    assert report.ideas == []


# ---------------------------------------------------------------------------
# CLI integration (app.py --ideas)
# ---------------------------------------------------------------------------

def test_cli_ideas_mode_with_context():
    import app
    # Should not raise
    result = app.main(["--ideas", "REST API with JWT auth"])
    assert result == 0


def test_cli_ideas_mode_with_file(tmp_path):
    import app
    code_file = tmp_path / "sample.py"
    code_file.write_text("result = eval(input())\n")
    result = app.main(["--ideas", "--file", str(code_file)])
    assert result == 0


def test_cli_ideas_mode_missing_file():
    import app
    result = app.main(["--ideas", "--file", "/nonexistent/file.py"])
    assert result == 1


def test_cli_ideas_mode_max_ideas():
    import app
    result = app.main(["--ideas", "--max-ideas", "2", "database query optimization"])
    assert result == 0
