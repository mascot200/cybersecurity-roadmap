import os
import unittest

from attack_paths import load, paths_to_sensitive, rank_edges

ENV = load(os.path.join(os.path.dirname(__file__), "environment.json"))


class AttackPaths(unittest.TestCase):
    def test_finds_every_path_from_the_internet(self):
        paths = paths_to_sensitive(ENV)
        ends = sorted(p[-1] for p in paths)
        self.assertEqual(ends, ["cloudtrail-logs", "customer-db-secret", "customer-db-secret", "uploads-bucket"])

    def test_paths_never_revisit_a_node(self):
        for path in paths_to_sensitive(ENV):
            self.assertEqual(len(path), len(set(path)))

    def test_ci_role_is_not_reachable_from_the_internet(self):
        for path in paths_to_sensitive(ENV):
            self.assertNotIn("ci-deploy-role", path)

    def test_ci_role_as_start_reaches_admin_targets(self):
        ends = sorted(p[-1] for p in paths_to_sensitive(ENV, start="ci-deploy-role"))
        self.assertEqual(ends, ["cloudtrail-logs", "customer-db-secret"])

    def test_removing_update_function_code_leaves_only_the_bucket(self):
        removed = {("web-task-role", "reports-lambda")}
        paths = paths_to_sensitive(ENV, removed=removed)
        self.assertEqual([p[-1] for p in paths], ["uploads-bucket"])

    def test_removing_admin_trust_protects_the_logs(self):
        removed = {("reports-role", "admin-role")}
        ends = [p[-1] for p in paths_to_sensitive(ENV, removed=removed)]
        self.assertNotIn("cloudtrail-logs", ends)
        self.assertIn("customer-db-secret", ends)     # still reachable via the reports role itself

    def test_best_single_fix_after_the_entry_point(self):
        ranking = rank_edges(ENV)
        # The entry edge breaks everything but usually can't be "removed"; the best IAM fix is next.
        self.assertEqual(ranking[0][1], ("internet", "web-task"))
        iam_fixes = [r for r in ranking if r[1][0] != "internet"]
        self.assertEqual(iam_fixes[0][1], ("web-task", "web-task-role"))
        self.assertIn(("web-task-role", "reports-lambda"), [r[1] for r in iam_fixes[:3]])


if __name__ == "__main__":
    unittest.main()
