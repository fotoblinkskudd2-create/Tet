"""
MoodShift - A fullstack iOS mood web app server.

Serves a beautiful iOS-style web interface and provides API endpoints
for mood tracking, mood-boosting activities, and creative content generation.
"""
from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import asdict, dataclass, field
from http.server import HTTPServer, SimpleHTTPRequestHandler
from typing import Any, Dict, List, Optional
from urllib.parse import parse_qs, urlparse

from app import build_creative_prompt

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

MOODS = {
    "radiant": {"emoji": "\u2728", "color": "#FFD700", "energy": 10, "label": "Radiant"},
    "happy": {"emoji": "\U0001f60a", "color": "#FF9F43", "energy": 8, "label": "Happy"},
    "calm": {"emoji": "\U0001f33f", "color": "#54A0FF", "energy": 6, "label": "Calm"},
    "focused": {"emoji": "\U0001f3af", "color": "#5F27CD", "energy": 7, "label": "Focused"},
    "meh": {"emoji": "\U0001f611", "color": "#8395A7", "energy": 4, "label": "Meh"},
    "anxious": {"emoji": "\U0001f630", "color": "#EE5A24", "energy": 5, "label": "Anxious"},
    "sad": {"emoji": "\U0001f4a7", "color": "#2E86DE", "energy": 3, "label": "Sad"},
    "angry": {"emoji": "\U0001f525", "color": "#FF3838", "energy": 6, "label": "Angry"},
    "tired": {"emoji": "\U0001f634", "color": "#576574", "energy": 2, "label": "Tired"},
    "grateful": {"emoji": "\U0001f49c", "color": "#A29BFE", "energy": 7, "label": "Grateful"},
}

ACTIVITIES: Dict[str, Dict[str, Any]] = {
    "breathe": {
        "id": "breathe",
        "title": "Breathing Exercise",
        "subtitle": "4-7-8 calming breath",
        "icon": "\U0001f32c\ufe0f",
        "duration": 120,
        "mood_boost": ["calm", "focused"],
        "mood_reduce": ["anxious", "angry"],
        "steps": [
            {"action": "Breathe in slowly", "duration": 4},
            {"action": "Hold gently", "duration": 7},
            {"action": "Breathe out completely", "duration": 8},
        ],
    },
    "gratitude": {
        "id": "gratitude",
        "title": "Gratitude Glow",
        "subtitle": "Write 3 things you're grateful for",
        "icon": "\U0001f31f",
        "duration": 180,
        "mood_boost": ["grateful", "happy", "calm"],
        "mood_reduce": ["sad", "meh"],
        "prompts": [
            "Something small that made you smile today...",
            "A person who brings warmth to your life...",
            "A skill or quality you appreciate about yourself...",
            "A place that makes you feel at peace...",
            "A recent experience you enjoyed...",
        ],
    },
    "color_therapy": {
        "id": "color_therapy",
        "title": "Color Therapy",
        "subtitle": "Immerse in shifting colors",
        "icon": "\U0001f308",
        "duration": 90,
        "mood_boost": ["calm", "happy", "radiant"],
        "mood_reduce": ["anxious", "angry", "sad"],
        "palettes": {
            "sunrise": ["#FF6B6B", "#FFA06B", "#FFD93D", "#FF8E53"],
            "ocean": ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"],
            "forest": ["#2D6A4F", "#40916C", "#52B788", "#95D5B2"],
            "aurora": ["#7400B8", "#6930C3", "#5390D9", "#48BFE3"],
            "sunset": ["#FF006E", "#FB5607", "#FFBE0B", "#FF006E"],
        },
    },
    "body_scan": {
        "id": "body_scan",
        "title": "Body Scan",
        "subtitle": "Progressive relaxation journey",
        "icon": "\U0001f9d8",
        "duration": 150,
        "mood_boost": ["calm", "focused"],
        "mood_reduce": ["anxious", "tired", "angry"],
        "zones": [
            {"area": "Crown of your head", "cue": "Let warmth melt down from the top..."},
            {"area": "Forehead & eyes", "cue": "Soften your brow, relax your gaze..."},
            {"area": "Jaw & neck", "cue": "Unclench gently, let your jaw float..."},
            {"area": "Shoulders & arms", "cue": "Drop your shoulders away from your ears..."},
            {"area": "Chest & heart", "cue": "Feel each breath expand your ribcage..."},
            {"area": "Belly & core", "cue": "Let your belly be soft and free..."},
            {"area": "Legs & feet", "cue": "Feel the ground supporting you..."},
        ],
    },
    "creative_spark": {
        "id": "creative_spark",
        "title": "Creative Spark",
        "subtitle": "Generate inspiring prompts",
        "icon": "\U0001f3a8",
        "duration": 120,
        "mood_boost": ["focused", "radiant", "happy"],
        "mood_reduce": ["meh", "tired", "sad"],
        "seeds": [
            "A tiny robot learning to paint sunsets",
            "The sound of rain on a tin roof at dusk",
            "A letter from your future self, full of kindness",
            "The first flower of spring pushing through concrete",
            "A cozy cafe where time flows like honey",
            "Dancing shadows on a warm evening wall",
            "The feeling of sand between your toes at dawn",
            "A paper boat sailing across a puddle sky",
        ],
    },
    "movement": {
        "id": "movement",
        "title": "Mood Movement",
        "subtitle": "Gentle stretches & micro-dance",
        "icon": "\U0001f483",
        "duration": 90,
        "mood_boost": ["happy", "radiant", "focused"],
        "mood_reduce": ["tired", "sad", "meh"],
        "moves": [
            {"name": "Sunrise stretch", "desc": "Reach arms up, stretch tall, breathe deep", "seconds": 15},
            {"name": "Shoulder rolls", "desc": "Roll forward 5x, backward 5x, release tension", "seconds": 15},
            {"name": "Side sway", "desc": "Sway gently side to side like a tree in breeze", "seconds": 15},
            {"name": "Shake it off", "desc": "Shake hands, arms, shimmy shoulders freely", "seconds": 10},
            {"name": "Micro-dance", "desc": "Move however feels good for 20 seconds", "seconds": 20},
            {"name": "Deep breath close", "desc": "Stand still, three deep breaths, smile", "seconds": 15},
        ],
    },
}

MOOD_QUOTES: Dict[str, List[str]] = {
    "radiant": [
        "You are literally glowing right now.",
        "This energy is contagious \u2014 share it!",
        "The universe high-fived you today.",
    ],
    "happy": [
        "Happiness looks beautiful on you.",
        "Collect these moments like wildflowers.",
        "Your smile just made someone's day.",
    ],
    "calm": [
        "Stillness is a superpower.",
        "You found the eye of the storm.",
        "Peace flows through you like a quiet river.",
    ],
    "focused": [
        "Laser mode: activated.",
        "One step at a time, and you're already walking.",
        "Your clarity right now is remarkable.",
    ],
    "meh": [
        "Even cloudy skies hold the sun above them.",
        "'Meh' is just a rest stop, not a destination.",
        "Neutral is valid \u2014 no performance required.",
    ],
    "anxious": [
        "This feeling is temporary. You are not.",
        "Your nervous system is just being cautious \u2014 you're safe.",
        "Take one slow breath. That's enough for now.",
    ],
    "sad": [
        "It's okay to feel this. Rain makes things grow.",
        "Gentle with yourself today.",
        "Even the ocean has low tides.",
    ],
    "angry": [
        "Your fire means you care deeply.",
        "Channel this energy \u2014 it's powerful fuel.",
        "Feel it, name it, then decide what to do with it.",
    ],
    "tired": [
        "Rest is productive. Your body is asking kindly.",
        "You've done enough today. Really.",
        "Recharging is not lazy \u2014 it's strategic.",
    ],
    "grateful": [
        "Gratitude rewires your brain toward joy.",
        "Noticing the good \u2014 that's a talent.",
        "Your heart is wide open right now.",
    ],
}


@dataclass
class MoodEntry:
    id: str
    mood: str
    note: str
    timestamp: float
    activities_done: List[str] = field(default_factory=list)


# In-memory store
mood_journal: List[MoodEntry] = []

# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------

class MoodAPIHandler(SimpleHTTPRequestHandler):
    """Serves static files and handles /api/* routes for the mood app."""

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/moods":
            self._json_response(MOODS)
        elif path == "/api/activities":
            self._json_response(ACTIVITIES)
        elif path == "/api/journal":
            entries = [asdict(e) for e in reversed(mood_journal)]
            self._json_response(entries)
        elif path == "/api/quote":
            qs = parse_qs(parsed.query)
            mood = qs.get("mood", ["happy"])[0]
            quotes = MOOD_QUOTES.get(mood, MOOD_QUOTES["happy"])
            import random
            quote = random.choice(quotes)
            self._json_response({"mood": mood, "quote": quote})
        elif path == "/api/suggest":
            qs = parse_qs(parsed.query)
            mood = qs.get("mood", ["meh"])[0]
            suggestions = _suggest_activities(mood)
            self._json_response(suggestions)
        elif path == "/api/creative":
            qs = parse_qs(parsed.query)
            seed = qs.get("seed", ["a dreamy sunset over the ocean"])[0]
            medium = qs.get("medium", [None])[0]
            solution = build_creative_prompt(seed, medium_hint=medium)
            self._json_response({
                "kind": solution.kind,
                "answer": solution.answer,
                "details": solution.details,
            })
        elif path == "/" or path == "/index.html":
            self._serve_file("mood_app/index.html", "text/html")
        elif path == "/app.css":
            self._serve_file("mood_app/app.css", "text/css")
        elif path == "/app.js":
            self._serve_file("mood_app/app.js", "application/javascript")
        elif path == "/manifest.json":
            self._serve_file("mood_app/manifest.json", "application/json")
        else:
            self._serve_file("mood_app/index.html", "text/html")

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_body()

        if path == "/api/journal":
            entry = MoodEntry(
                id=str(uuid.uuid4()),
                mood=body.get("mood", "meh"),
                note=body.get("note", ""),
                timestamp=time.time(),
                activities_done=body.get("activities_done", []),
            )
            mood_journal.append(entry)
            self._json_response(asdict(entry), status=201)
        elif path == "/api/journal/batch":
            entries_data = body.get("entries", [])
            created = []
            for e in entries_data:
                entry = MoodEntry(
                    id=str(uuid.uuid4()),
                    mood=e.get("mood", "meh"),
                    note=e.get("note", ""),
                    timestamp=e.get("timestamp", time.time()),
                    activities_done=e.get("activities_done", []),
                )
                mood_journal.append(entry)
                created.append(asdict(entry))
            self._json_response(created, status=201)
        else:
            self._json_response({"error": "Not found"}, status=404)

    def _read_body(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def _json_response(self, data: Any, status: int = 200) -> None:
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(payload)

    def _serve_file(self, filepath: str, content_type: str) -> None:
        base = os.path.dirname(os.path.abspath(__file__))
        full = os.path.join(base, filepath)
        if not os.path.isfile(full):
            self.send_error(404)
            return
        with open(full, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(content)

    def log_message(self, format: str, *args: Any) -> None:
        pass  # quiet logging


def _suggest_activities(mood: str) -> List[Dict[str, Any]]:
    """Return activities sorted by relevance to the given mood."""
    scored: List[tuple] = []
    for act_id, act in ACTIVITIES.items():
        score = 0
        if mood in act.get("mood_reduce", []):
            score += 3
        if mood in act.get("mood_boost", []):
            score += 1
        scored.append((score, act))
    scored.sort(key=lambda x: -x[0])
    return [s[1] for s in scored]


def run_server(port: int = 8080) -> None:
    server = HTTPServer(("0.0.0.0", port), MoodAPIHandler)
    print(f"\n\u2728 MoodShift is live at http://localhost:{port}\n")
    server.serve_forever()


if __name__ == "__main__":
    import argparse as ap
    parser = ap.ArgumentParser(description="MoodShift server")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    run_server(args.port)
