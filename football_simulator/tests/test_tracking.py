import unittest

from football_simulator.components.tracking import PlayerTracker, TeamTracker
from football_simulator.tests.helpers import make_team


class TestPlayerTracker(unittest.TestCase):
    def test_track_player_produces_one_sample_per_minute(self):
        team = make_team()
        player = team.players[0]
        tracker = PlayerTracker(seed=1)
        data = tracker.track_player(player, role_index=0, attacking_third=False, sample_minutes=30)
        self.assertEqual(len(data.positions), 30)
        self.assertEqual(sum(data.heatmap.values()), 30)

    def test_distance_covered_is_positive(self):
        team = make_team()
        player = team.players[0]
        tracker = PlayerTracker(seed=1)
        data = tracker.track_player(player, role_index=0, attacking_third=False)
        self.assertGreater(data.distance_covered_km, 0.0)

    def test_deterministic_given_seed(self):
        team = make_team()
        player = team.players[0]
        data_a = PlayerTracker(seed=42).track_player(player, 0, False, sample_minutes=10)
        data_b = PlayerTracker(seed=42).track_player(player, 0, False, sample_minutes=10)
        self.assertEqual(data_a.positions, data_b.positions)


class TestTeamTracker(unittest.TestCase):
    def test_track_team_covers_full_lineup(self):
        team = make_team()
        lineup = team.starting_eleven()
        tracker = TeamTracker(seed=7)
        tracking = tracker.track_team(team, lineup, attacking_third=True)
        self.assertEqual(set(tracking.keys()), {p.player_id for p in lineup})

    def test_team_heatmap_aggregates_player_heatmaps(self):
        team = make_team()
        lineup = team.starting_eleven()
        tracker = TeamTracker(seed=7)
        tracking = tracker.track_team(team, lineup, attacking_third=False)
        heatmap = TeamTracker.team_heatmap(tracking)
        total_individual = sum(sum(d.heatmap.values()) for d in tracking.values())
        self.assertEqual(sum(heatmap.values()), total_individual)


if __name__ == "__main__":
    unittest.main()
