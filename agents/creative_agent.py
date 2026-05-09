from __future__ import annotations

from agents.base_agent import BaseAgent
from core.queue import Task

_PROFILES: dict = {
    "photo": {
        "style": "Cinematic, authentic skin tones and tactile colour.",
        "structure": "Subject → context → lighting/framing → camera cue (lens or aperture).",
        "delivery": "Vertical, high-resolution, gentle post-processing.",
    },
    "video": {
        "style": "Story-driven, rhythmic with clear start/middle/end beats.",
        "structure": "Subject/setting → camera move → pacing → audio texture.",
        "delivery": "16:9 landscape, clean transitions, legible subtitles.",
    },
    "music": {
        "style": "Genre+mood pairing with texture references (e.g. analog warmth, glassy synths).",
        "structure": "Tempo/time-sig → 3-4 instruments → hook or motif.",
        "delivery": "Clean intro, 2-bar motif, tail suitable for looping.",
    },
    "art": {
        "style": "Vivid but controlled; emphasise material choices (ink wash, vector, pastel).",
        "structure": "Subject+silhouette → palette direction → texture/brushwork note.",
        "delivery": "Balanced negative space, export-ready at print-safe resolution.",
    },
    "poem": {
        "style": "Clear voice with a single emotional colour; choose a form to shape rhythm.",
        "structure": "Subject → form (haiku/sonnet/free verse) → imagery anchors.",
        "delivery": "Musicality through meter hints and one sensory detail per line.",
    },
}


class CreativeAgent(BaseAgent):
    @property
    def task_type(self) -> str:
        return "creative"

    def process_task(self, task: Task) -> dict:
        seed = task.payload.get("seed", "").strip()
        medium = task.payload.get("medium", "art")
        if not seed:
            raise ValueError("Empty seed")
        profile = _PROFILES.get(medium, _PROFILES["art"])
        prompt = (
            f"[{medium.upper()}] {seed}. "
            f"Style: {profile['style']} "
            f"Structure: {profile['structure']} "
            f"Delivery: {profile['delivery']}"
        )
        return {"medium": medium, "seed": seed, "prompt": prompt}
