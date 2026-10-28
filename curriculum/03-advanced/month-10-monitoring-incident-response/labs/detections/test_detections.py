import os
import unittest
from datetime import datetime, timedelta, timezone

from detections import brute_force, load, password_spraying, privilege_change, run, unusual_export

EVENTS = load(os.path.join(os.path.dirname(__file__), "events.jsonl"))


def make(seconds, **kw):
    t = datetime(2026, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=seconds)
    return {"_t": t, "ts": t.isoformat(), "request_id": f"t{seconds}", **kw}


class OnTheLabLog(unittest.TestCase):
    def test_exactly_the_planted_incidents_are_found(self):
        found = sorted((a["rule"], a["entity"], a["severity"]) for a in run(EVENTS))
        self.assertEqual(found, [
            ("brute_force", "user7@acme.test", "high"),
            ("password_spraying", "192.0.2.200", "high"),
            ("privilege_change", "user12@acme.test", "critical"),
            ("privilege_change", "user3@acme.test", "low"),
            ("unusual_export", "user22@acme.test", "high"),
        ])

    def test_alerts_carry_evidence(self):
        for alert in run(EVENTS):
            self.assertTrue(alert["evidence"], alert)


class FalsePositives(unittest.TestCase):
    def test_occasional_typos_are_not_brute_force(self):
        events = [make(i * 60, event="login", user="a@x", ip="1.1.1.1", outcome="failure") for i in range(3)]
        self.assertEqual(brute_force(events), [])

    def test_slow_failures_outside_the_window_do_not_add_up(self):
        events = [make(i * 600, event="login", user="a@x", ip="1.1.1.1", outcome="failure") for i in range(12)]
        self.assertEqual(brute_force(events), [])

    def test_shared_office_ip_with_few_accounts_is_not_spraying(self):
        events = [make(i, event="login", user=f"u{i % 5}@x", ip="10.0.0.1", outcome="failure") for i in range(30)]
        self.assertEqual(password_spraying(events), [])

    def test_normal_exports_are_quiet(self):
        events = [make(i * 60, event="api_call", user="a@x", action="invoices.export", records=500) for i in range(5)]
        self.assertEqual(unusual_export(events), [])

    def test_brute_force_without_success_is_medium(self):
        events = [make(i, event="login", user="a@x", ip="1.1.1.1", outcome="failure") for i in range(10)]
        self.assertEqual([a["severity"] for a in brute_force(events)], ["medium"])

    def test_admin_promoting_member_is_low(self):
        e = make(1, event="role_change", actor="boss@x", actor_role="admin", user="a@x", old_role="member", new_role="admin")
        self.assertEqual(privilege_change([e])[0]["severity"], "low")


if __name__ == "__main__":
    unittest.main()
