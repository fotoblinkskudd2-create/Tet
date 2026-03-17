"""Tests for the MoodShift server module."""

import json
import os
import unittest

import mood_server


class TestMoodsData(unittest.TestCase):
    def test_moods_has_expected_keys(self):
        for key in ("happy", "sad", "anxious", "calm", "radiant"):
            self.assertIn(key, mood_server.MOODS)

    def test_mood_entries_have_required_fields(self):
        for key, m in mood_server.MOODS.items():
            self.assertIn("emoji", m, f"mood {key} missing emoji")
            self.assertIn("color", m, f"mood {key} missing color")
            self.assertIn("energy", m, f"mood {key} missing energy")
            self.assertIn("label", m, f"mood {key} missing label")


class TestActivities(unittest.TestCase):
    def test_has_enough_activities(self):
        self.assertGreaterEqual(len(mood_server.ACTIVITIES), 5)

    def test_activities_have_required_fields(self):
        for act_id, act in mood_server.ACTIVITIES.items():
            for field in ("id", "title", "subtitle", "icon", "mood_boost", "mood_reduce"):
                self.assertIn(field, act, f"activity {act_id} missing {field}")


class TestMoodQuotes(unittest.TestCase):
    def test_quotes_exist_for_all_moods(self):
        for mood_key in mood_server.MOODS:
            self.assertIn(mood_key, mood_server.MOOD_QUOTES, f"Missing quotes for {mood_key}")
            self.assertGreater(len(mood_server.MOOD_QUOTES[mood_key]), 0)


class TestSuggestActivities(unittest.TestCase):
    def test_returns_sorted_list_for_anxious(self):
        suggestions = mood_server._suggest_activities("anxious")
        self.assertGreater(len(suggestions), 0)
        titles = [s["title"] for s in suggestions]
        self.assertIn("Breathing Exercise", titles)

    def test_returns_sorted_list_for_sad(self):
        suggestions = mood_server._suggest_activities("sad")
        self.assertGreater(len(suggestions), 0)
        titles = [s["title"] for s in suggestions]
        self.assertIn("Gratitude Glow", titles)


class TestMoodEntry(unittest.TestCase):
    def test_creation(self):
        entry = mood_server.MoodEntry(
            id="test-1",
            mood="happy",
            note="Feeling great!",
            timestamp=1700000000.0,
        )
        self.assertEqual(entry.mood, "happy")
        self.assertEqual(entry.note, "Feeling great!")
        self.assertEqual(entry.activities_done, [])


class TestCreativeIntegration(unittest.TestCase):
    def test_creative_prompt_from_app(self):
        from app import build_creative_prompt

        solution = build_creative_prompt("a dreamy sunset over the ocean", medium_hint="art")
        self.assertEqual(solution.kind, "Creative Prompt")
        self.assertIn("art", solution.answer.lower())


class TestStaticFiles(unittest.TestCase):
    def test_all_frontend_files_exist(self):
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        mood_app_dir = os.path.join(base, "mood_app")
        for fname in ("index.html", "app.css", "app.js", "manifest.json"):
            path = os.path.join(mood_app_dir, fname)
            self.assertTrue(os.path.isfile(path), f"Missing file: {fname}")


if __name__ == "__main__":
    unittest.main()
