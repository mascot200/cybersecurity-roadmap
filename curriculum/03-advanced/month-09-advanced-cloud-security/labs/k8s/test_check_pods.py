import os
import unittest

from check_pods import check_file

HERE = os.path.dirname(__file__)


def rules(path):
    return sorted({rule for _, rule, _ in check_file(os.path.join(HERE, path))})


class CheckPods(unittest.TestCase):
    def test_hardened_api_deployment_passes(self):
        self.assertEqual(rules("api.yaml"), [])

    def test_bad_pod_triggers_every_expected_rule(self):
        self.assertEqual(rules("bad-pod.yaml"), sorted([
            "HOST_NAMESPACE", "HOST_PATH", "PRIVILEGED", "PRIV_ESCALATION", "RUN_AS_ROOT",
            "WRITABLE_ROOT_FS", "CAPABILITIES", "SECCOMP", "IMAGE_NOT_PINNED", "NO_LIMITS",
        ]))

    def test_files_without_workloads_are_ignored(self):
        self.assertEqual(rules("network-policies.yaml"), [])
        self.assertEqual(rules("rbac.yaml"), [])


if __name__ == "__main__":
    unittest.main()
