import json
import os
import unittest

from lint_policies import lint_policy

POLICIES = os.path.join(os.path.dirname(__file__), "..", "policies")


def load(name):
    with open(os.path.join(POLICIES, name), encoding="utf-8") as f:
        return json.load(f)


def rules(findings):
    return sorted({f["rule"] for f in findings})


class GoodPoliciesHaveNoFindings(unittest.TestCase):
    def test_app_task_role_is_least_privilege(self):
        self.assertEqual(lint_policy(load("app-task-role.json")), [])

    def test_trust_policy_with_conditions(self):
        self.assertEqual(lint_policy(load("ecs-task-trust.json")), [])

    def test_bucket_policy_deny_statements_are_ignored(self):
        self.assertEqual(lint_policy(load("uploads-bucket-policy.json")), [])

    def test_require_mfa_deny_with_notaction_is_fine(self):
        self.assertEqual(lint_policy(load("require-mfa.json")), [])

    def test_read_only_actions_on_any_resource_are_allowed(self):
        policy = {"Statement": [{"Effect": "Allow", "Action": ["ec2:DescribeInstances"], "Resource": "*"}]}
        self.assertEqual(lint_policy(policy), [])


class BroadPoliciesAreFlagged(unittest.TestCase):
    def test_too_broad_example(self):
        found = rules(lint_policy(load("too-broad-example.json")))
        for expected in ["WILDCARD_ACTION", "SERVICE_WILDCARD_ACTION", "WILDCARD_RESOURCE",
                         "PASSROLE_ANY", "ALLOW_WITH_NOTACTION"]:
            self.assertIn(expected, found)

    def test_public_principal_without_condition(self):
        policy = {"Statement": [{"Effect": "Allow", "Principal": "*",
                                 "Action": "s3:GetObject", "Resource": "arn:aws:s3:::b/*"}]}
        self.assertEqual(rules(lint_policy(policy)), ["PUBLIC_PRINCIPAL"])

    def test_public_principal_as_aws_star(self):
        policy = {"Statement": [{"Effect": "Allow", "Principal": {"AWS": "*"},
                                 "Action": "sqs:SendMessage", "Resource": "arn:aws:sqs:eu-west-1:1:q"}]}
        self.assertIn("PUBLIC_PRINCIPAL", rules(lint_policy(policy)))

    def test_write_on_any_resource(self):
        policy = {"Statement": [{"Effect": "Allow", "Action": "s3:PutObject", "Resource": "*"}]}
        self.assertEqual(rules(lint_policy(policy)), ["WILDCARD_RESOURCE"])


if __name__ == "__main__":
    unittest.main()
