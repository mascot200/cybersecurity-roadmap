"""Minimal IAM policy linter for the Month 7 lab.

Flags common over-permissive patterns in Allow statements. It is a teaching
tool, not a replacement for IAM Access Analyzer policy validation.

Usage: python3 lint_policies.py policy1.json [policy2.json ...]
Exit code 1 if any HIGH or CRITICAL finding is reported.
"""
import json
import sys

READ_ONLY_PREFIXES = ("Get", "List", "Describe", "Head")
SEVERITY_ORDER = {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 1}


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def is_public_principal(principal):
    if principal == "*":
        return True
    if isinstance(principal, dict):
        return "*" in as_list(principal.get("AWS"))
    return False


def lint_statement(stmt, index):
    findings = []
    if stmt.get("Effect") != "Allow":
        return findings                       # Deny statements only ever reduce access
    sid = stmt.get("Sid", f"#{index}")
    actions = as_list(stmt.get("Action"))
    resources = as_list(stmt.get("Resource"))

    def add(rule, severity, message):
        findings.append({"sid": sid, "rule": rule, "severity": severity, "message": message})

    if "NotAction" in stmt:
        add("ALLOW_WITH_NOTACTION", "HIGH",
            "Allow + NotAction grants every action except those listed, including future ones.")
    if "*" in actions:
        add("WILDCARD_ACTION", "CRITICAL", 'Action "*" allows every action in every service.')
    for action in actions:
        if action != "*" and action.endswith(":*"):
            add("SERVICE_WILDCARD_ACTION", "MEDIUM",
                f'"{action}" allows every action in the service; list the actions you need.')
    if "*" in resources:
        writes = [a for a in actions
                  if a == "*" or a.endswith(":*")
                  or not a.split(":", 1)[-1].startswith(READ_ONLY_PREFIXES)]
        if writes or "NotAction" in stmt:
            add("WILDCARD_RESOURCE", "HIGH",
                'Resource "*" with non-read actions; scope to specific ARNs.')
    if "iam:PassRole" in actions and "*" in resources:
        add("PASSROLE_ANY", "HIGH",
            "iam:PassRole on any role allows handing powerful roles to services (privilege escalation).")
    if is_public_principal(stmt.get("Principal")) and not stmt.get("Condition"):
        add("PUBLIC_PRINCIPAL", "CRITICAL",
            "Principal * without a condition makes the resource accessible to anyone.")
    return findings


def lint_policy(policy):
    statements = as_list(policy.get("Statement"))
    findings = []
    for i, stmt in enumerate(statements):
        findings.extend(lint_statement(stmt, i))
    return findings


def main(paths):
    worst = 0
    for path in paths:
        with open(path, encoding="utf-8") as f:
            findings = lint_policy(json.load(f))
        if not findings:
            print(f"OK        {path}")
        for item in findings:
            worst = max(worst, SEVERITY_ORDER[item["severity"]])
            print(f"{item['severity']:<9} {path} [{item['sid']}] {item['rule']}: {item['message']}")
    return 1 if worst >= SEVERITY_ORDER["HIGH"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
