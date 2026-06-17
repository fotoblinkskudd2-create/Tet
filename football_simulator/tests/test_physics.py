import unittest

from football_simulator.core.physics import (
    PitchZone,
    ShotPhysics,
    Vector2,
    expected_goal_value,
    formation_base_position,
)


class TestExpectedGoalValue(unittest.TestCase):
    def test_closer_shots_have_higher_xg(self):
        close = expected_goal_value(distance_m=5, angle_degrees=10)
        far = expected_goal_value(distance_m=30, angle_degrees=10)
        self.assertGreater(close, far)

    def test_narrower_angle_lowers_xg(self):
        central = expected_goal_value(distance_m=12, angle_degrees=5)
        wide_angle = expected_goal_value(distance_m=12, angle_degrees=80)
        self.assertGreater(central, wide_angle)

    def test_header_penalty_reduces_xg(self):
        normal = expected_goal_value(distance_m=10, angle_degrees=15, is_header=False)
        header = expected_goal_value(distance_m=10, angle_degrees=15, is_header=True)
        self.assertLess(header, normal)

    def test_xg_bounded_between_0_and_1(self):
        for distance in (1, 10, 50, 100):
            for angle in (0, 45, 90):
                value = expected_goal_value(distance, angle)
                self.assertGreaterEqual(value, 0.0)
                self.assertLessEqual(value, 1.0)


class TestShotPhysics(unittest.TestCase):
    def test_on_target_probability_decreases_with_distance(self):
        near_shot = ShotPhysics(Vector2(95, 34), Vector2(105, 34), power_m_per_s=25, accuracy=0.8)
        far_shot = ShotPhysics(Vector2(20, 34), Vector2(105, 34), power_m_per_s=25, accuracy=0.8)
        self.assertGreater(near_shot.on_target_probability(), far_shot.on_target_probability())

    def test_flight_time_is_positive(self):
        shot = ShotPhysics(Vector2(80, 30), Vector2(105, 34), power_m_per_s=20, accuracy=0.7)
        self.assertGreater(shot.flight_time_seconds(), 0.0)


class TestPitchGeometry(unittest.TestCase):
    def test_pitch_zone_from_position_within_bounds(self):
        zone = PitchZone.from_position(Vector2(50, 30))
        self.assertTrue(0 <= zone.column <= 5)
        self.assertTrue(0 <= zone.row <= 3)

    def test_formation_base_position_mirrors_for_attacking_third(self):
        defensive = formation_base_position(0, "FW", attacking_third=False)
        attacking = formation_base_position(0, "FW", attacking_third=True)
        self.assertNotEqual(defensive.x, attacking.x)


if __name__ == "__main__":
    unittest.main()
