import os
import shutil
import tempfile
import unittest

from sanitize_check import check_line, scan

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def rules_in(name):
    found = []
    with open(os.path.join(FIXTURES, name), encoding="utf-8") as f:
        for line in f:
            found.extend(rule for rule, _ in check_line(line))
    return sorted(set(found))


class SanitizeCheck(unittest.TestCase):
    def test_leaky_fixture_flags_every_kind(self):
        self.assertEqual(rules_in("leaky-readme.md"), sorted([
            "AWS_ACCOUNT_ID", "AWS_ACCESS_KEY_ID", "IPV4", "INTERNAL_HOST", "EMAIL", "PRIVATE_KEY"]))

    def test_clean_fixture_has_no_findings(self):
        self.assertEqual(rules_in("clean-readme.md"), [])

    def test_twelve_digit_numbers_without_account_context_are_ignored(self):
        self.assertEqual(check_line("invoice 202610280001 total 42"), [])

    def test_public_ips_are_not_flagged_but_private_are(self):
        self.assertEqual(check_line("dns 8.8.8.8"), [])
        self.assertEqual(check_line("listen 0.0.0.0, metadata 169.254.169.254, loopback 127.0.0.1"), [])
        self.assertEqual([r for r, _ in check_line("db 172.16.5.4")], ["IPV4"])

    def test_scan_reports_file_and_line(self):
        with tempfile.TemporaryDirectory() as d:
            shutil.copy(os.path.join(FIXTURES, "leaky-readme.md"), os.path.join(d, "README.md"))
            shutil.copy(os.path.join(FIXTURES, "clean-readme.md"), os.path.join(d, "NOTES.md"))
            found = scan(d)
            self.assertTrue(found)
            self.assertEqual({os.path.basename(p) for p, _, _, _ in found}, {"README.md"})
            self.assertIn(("README.md", 2, "AWS_ACCOUNT_ID"), {(os.path.basename(p), n, r) for p, n, r, _ in found})

    def test_scan_skips_fixture_and_dependency_folders(self):
        with tempfile.TemporaryDirectory() as d:
            for skipped in ("fixtures", "node_modules", ".git"):
                os.makedirs(os.path.join(d, skipped))
                shutil.copy(os.path.join(FIXTURES, "leaky-readme.md"), os.path.join(d, skipped, "x.md"))
            self.assertEqual(scan(d), [])


if __name__ == "__main__":
    unittest.main()
