"""
OpenClaw Hermes — adapters that wrap existing app.py solvers as Tools.

app.py is never modified; this file is the only bridge between the two worlds.
"""
from __future__ import annotations

import pathlib
import sys

# Make sure app.py is importable regardless of the working directory.
_ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import app as _app  # noqa: E402

from hermes.tools import Tool, ToolRegistry  # noqa: E402


def _make_math_tool() -> Tool:
    return Tool(
        name="math",
        description="Evaluates arithmetic expressions like '2 + 3 * 4'",
        can_handle=lambda s: _app._solve_math(s) is not None,
        handle=lambda s: _app._solve_math(s).answer,  # type: ignore[union-attr]
    )


def _make_anagram_tool() -> Tool:
    return Tool(
        name="anagram",
        description="Finds anagrams: 'anagram of listen' or 'unscramble evil'",
        can_handle=lambda s: _app._solve_anagram(s) is not None,
        handle=lambda s: _app._solve_anagram(s).answer,  # type: ignore[union-attr]
    )


def _make_panic_tool() -> Tool:
    return Tool(
        name="panic_support",
        description="Grounding protocol for panic or anxiety moments",
        can_handle=lambda s: _app._solve_panic_support(s) is not None,
        handle=lambda s: _app._solve_panic_support(s).answer,  # type: ignore[union-attr]
    )


def _make_creative_tool() -> Tool:
    _MEDIUM_KEYWORDS = ("photo", "video", "music", "art", "poem",
                        "picture", "image", "film", "clip", "song",
                        "track", "illustration", "drawing", "poetry", "verse")

    def _can(s: str) -> bool:
        lowered = s.lower()
        if lowered.startswith("prompt:"):
            return True
        return any(kw in lowered for kw in _MEDIUM_KEYWORDS)

    def _do(s: str) -> str:
        seed = s[7:].strip() if s.lower().startswith("prompt:") else s
        return _app.build_creative_prompt(seed).answer

    return Tool(
        name="creative_prompt",
        description="Builds iOS-ready creative prompts for photo, video, music, art, poem",
        can_handle=_can,
        handle=_do,
    )


def _make_brainstorm_tool() -> Tool:
    return Tool(
        name="brainstorm",
        description="General brainstorming fallback for any open-ended problem",
        can_handle=lambda s: True,
        handle=lambda s: _app._brainstorm_steps(s).answer,
    )


def default_registry() -> ToolRegistry:
    """Return a ToolRegistry pre-loaded with all app.py solvers.

    Order matters: brainstorm is last because it matches everything.
    """
    registry = ToolRegistry()
    for tool in (
        _make_math_tool(),
        _make_anagram_tool(),
        _make_panic_tool(),
        _make_creative_tool(),
        _make_brainstorm_tool(),
    ):
        registry.register(tool)
    return registry
