import os
import tempfile
import unittest
from pathlib import Path

from football_simulator.core.match import Match
from football_simulator.utils.config import SimulationConfig
from football_simulator.utils.data_loader import (
    load_simulation_results,
    load_teams_from_json,
    save_simulation_results,
)

SAMPLE_DATA_PATH = Path(__file__).parent.parent / "examples" / "sample_data.json"


class TestLoadTeamsFromJson(unittest.TestCase):
    def test_loads_expected_number_of_teams_and_players(self):
        teams = load_teams_from_json(str(SAMPLE_DATA_PATH))
        self.assertEqual(len(teams), 2)
        for team in teams:
            self.assertGreaterEqual(len(team.players), 11)

    def test_starting_eleven_works_on_loaded_teams(self):
        teams = load_teams_from_json(str(SAMPLE_DATA_PATH))
        for team in teams:
            lineup = team.starting_eleven()
            self.assertEqual(len(lineup), 11)


class TestSimulationResultSerialization(unittest.TestCase):
    def test_save_and_load_roundtrip(self):
        teams = load_teams_from_json(str(SAMPLE_DATA_PATH))
        match = Match(home_team=teams[0], away_team=teams[1], config=SimulationConfig(), seed=1)
        result = match.run()

        with tempfile.TemporaryDirectory() as tmp_dir:
            path = os.path.join(tmp_dir, "results.json")
            save_simulation_results([result], path)
            loaded = load_simulation_results(path)

        self.assertEqual(len(loaded), 1)
        self.assertEqual(loaded[0]["score"]["home"], result.score.home)
        self.assertEqual(loaded[0]["score"]["away"], result.score.away)
        self.assertEqual(len(loaded[0]["player_stats"]), len(result.player_stats))


if __name__ == "__main__":
    unittest.main()
