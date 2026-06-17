import json
import os
import tempfile
import unittest

from football_simulator.utils.config import (
    AppConfig,
    GamblingConfig,
    ScoringRules,
    SimulationConfig,
    load_config,
    save_config,
)


class TestConfigRoundtrip(unittest.TestCase):
    def test_simulation_config_to_dict_from_dict(self):
        config = SimulationConfig(match_duration_minutes=80, home_advantage=0.2)
        restored = SimulationConfig.from_dict(config.to_dict())
        self.assertEqual(restored, config)

    def test_scoring_rules_to_dict_from_dict(self):
        rules = ScoringRules(goal_forward=5.0)
        restored = ScoringRules.from_dict(rules.to_dict())
        self.assertEqual(restored, rules)

    def test_from_dict_ignores_unknown_keys(self):
        restored = SimulationConfig.from_dict({"match_duration_minutes": 70, "bogus_key": 123})
        self.assertEqual(restored.match_duration_minutes, 70)

    def test_app_config_save_and_load_json(self):
        config = AppConfig(
            simulation=SimulationConfig(match_duration_minutes=95),
            scoring=ScoringRules(goal_forward=4.5),
            gambling=GamblingConfig(bookmaker_margin=0.07),
        )
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = os.path.join(tmp_dir, "config.json")
            save_config(config, path)
            self.assertTrue(os.path.exists(path))
            loaded = load_config(path)
            self.assertEqual(loaded.simulation.match_duration_minutes, 95)
            self.assertEqual(loaded.gambling.bookmaker_margin, 0.07)

    def test_saved_json_is_valid(self):
        config = AppConfig()
        with tempfile.TemporaryDirectory() as tmp_dir:
            path = os.path.join(tmp_dir, "config.json")
            save_config(config, path)
            with open(path) as fh:
                data = json.load(fh)
            self.assertIn("simulation", data)
            self.assertIn("scoring", data)
            self.assertIn("gambling", data)


if __name__ == "__main__":
    unittest.main()
