import unittest

from football_simulator.components.drone_modules import (
    ComponentController,
    DataBus,
    Module,
    ModuleStatus,
    RedundancyGroup,
)


class EchoModule(Module):
    def process(self, payload):
        return payload


class AlwaysFailsModule(Module):
    def process(self, payload):
        raise RuntimeError("simulated hardware fault")


class TestModuleHealth(unittest.TestCase):
    def test_degrade_lowers_health_and_eventually_fails(self):
        module = EchoModule("m1", "Echo")
        module.degrade(50)
        self.assertEqual(module.status, ModuleStatus.DEGRADED)
        module.degrade(60)
        self.assertEqual(module.status, ModuleStatus.FAILED)
        self.assertFalse(module.is_healthy())

    def test_recover_restores_health(self):
        module = EchoModule("m1", "Echo")
        module.degrade(50)
        module.recover(50)
        self.assertEqual(module.status, ModuleStatus.ACTIVE)

    def test_safe_process_degrades_on_exception(self):
        module = AlwaysFailsModule("m1", "AlwaysFails")
        with self.assertRaises(RuntimeError):
            module.safe_process({})
        self.assertLess(module.health, 100.0)


class TestDataBus(unittest.TestCase):
    def test_publish_delivers_to_subscriber(self):
        bus = DataBus()
        received = []
        bus.subscribe("topic", received.append)
        bus.publish("topic", {"x": 1})
        self.assertEqual(received, [{"x": 1}])

    def test_publish_survives_failing_subscriber(self):
        bus = DataBus()

        def bad_subscriber(_msg):
            raise ValueError("boom")

        good_received = []
        bus.subscribe("topic", bad_subscriber)
        bus.subscribe("topic", good_received.append)
        bus.publish("topic", "hello")  # should not raise
        self.assertEqual(good_received, ["hello"])

    def test_last_returns_most_recent_message(self):
        bus = DataBus()
        bus.publish("topic", "first")
        bus.publish("topic", "second")
        self.assertEqual(bus.last("topic"), "second")


class TestRedundancyGroup(unittest.TestCase):
    def test_uses_primary_when_healthy(self):
        primary = EchoModule("p", "Primary")
        group = RedundancyGroup(primary)
        self.assertEqual(group.process("ping"), "ping")
        self.assertEqual(group.active_module, primary)

    def test_fails_over_to_backup_when_primary_unhealthy(self):
        primary = EchoModule("p", "Primary")
        primary.fail()
        backup = EchoModule("b", "Backup")
        group = RedundancyGroup(primary, backups=[backup])
        self.assertEqual(group.active_module, backup)
        self.assertEqual(group.process("ping"), "ping")

    def test_raises_when_no_healthy_module_available(self):
        primary = EchoModule("p", "Primary")
        primary.fail()
        backup = EchoModule("b", "Backup")
        backup.fail()
        group = RedundancyGroup(primary, backups=[backup])
        with self.assertRaises(RuntimeError):
            group.process("ping")


class TestComponentController(unittest.TestCase):
    def test_run_pipes_through_stages_and_publishes(self):
        bus = DataBus()
        controller = ComponentController(bus)
        controller.add_stage(RedundancyGroup(EchoModule("a", "StageA")), "stage_a.out")
        controller.add_stage(RedundancyGroup(EchoModule("b", "StageB")), "stage_b.out")
        result = controller.run("payload")
        self.assertEqual(result, "payload")
        self.assertEqual(bus.last("stage_a.out"), "payload")
        self.assertEqual(bus.last("stage_b.out"), "payload")

    def test_system_health_report_lists_all_stages(self):
        controller = ComponentController()
        controller.add_stage(RedundancyGroup(EchoModule("a", "StageA")), "out")
        report = controller.system_health_report()
        self.assertEqual(len(report), 1)
        self.assertEqual(report[0]["active_module"], "StageA")


if __name__ == "__main__":
    unittest.main()
