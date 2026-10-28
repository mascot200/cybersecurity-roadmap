import unittest

from cvss31 import base_score, roundup, severity

# Reference scores published by FIRST (specification examples and the official calculator).
KNOWN = [
    ("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", 9.8),   # unauthenticated RCE
    ("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H", 10.0),
    ("CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N", 6.5),   # e.g. authenticated read of others' data
    ("CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N", 6.1),   # typical reflected XSS
    ("CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H", 7.8),   # local privilege escalation
    ("CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N", 5.9),
    ("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H", 7.5),   # unauthenticated DoS
    ("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N", 0.0),
]


class Scores(unittest.TestCase):
    def test_known_vectors(self):
        for vector, expected in KNOWN:
            with self.subTest(vector=vector):
                self.assertEqual(base_score(vector), expected)

    def test_roundup_is_float_safe(self):
        self.assertEqual(roundup(4.0), 4.0)
        self.assertEqual(roundup(4.02), 4.1)
        self.assertEqual(roundup(4.000000001), 4.0)   # spec: avoid float noise rounding up

    def test_severity_bands(self):
        self.assertEqual([severity(s) for s in (0.0, 3.9, 4.0, 6.9, 7.0, 8.9, 9.0)],
                         ["None", "Low", "Medium", "Medium", "High", "High", "Critical"])

    def test_rejects_incomplete_vectors(self):
        with self.assertRaises(ValueError):
            base_score("CVSS:3.1/AV:N/AC:L")
        with self.assertRaises(ValueError):
            base_score("CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")


if __name__ == "__main__":
    unittest.main()
