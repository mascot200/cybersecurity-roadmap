# Week 36 — Defense Validation

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #13](https://github.com/mascot200/cybersecurity-roadmap/issues/13)

## 🎯 Objectives

1. Treat security controls as claims that need evidence, not as configuration you assume works.
2. Validate preventive controls with **negative tests** (the action must fail) and detective controls with **controlled, harmless test events** (the alert must fire).
3. Run policy checks continuously (IaC scans, Config rules, admission policies).
4. Record evidence in a form an auditor, a teammate or future you can trust.

## 🌍 Why it matters

Controls fail silently: a NetworkPolicy on a CNI that ignores it, an alert routed to an unmonitored inbox,
an SCP attached to the wrong organizational unit, a log trail that stopped delivering months ago. Most
organizations find out during an incident. Validation finds out first. This whole course has used the
same idea: a fix is only proven by a test that fails before and passes after. This week applies it to the
whole environment.

---

## 📖 Concepts

### 1. Preventive vs detective validation

| Control type | Validation | Example |
|---|---|---|
| Preventive (IAM, SCP, NetworkPolicy, bucket policy) | **Negative test**: attempt the forbidden action from the relevant identity; expect a denial | App role tries `s3:DeleteObject` → AccessDenied |
| Detective (GuardDuty, CloudTrail alerts, app detections) | **Controlled trigger**: generate a harmless event that should alert; confirm the alert arrives and is actionable | Sign in as root (with MFA) → root-activity alert reaches the on-call channel |
| Corrective (backups, auto-remediation) | **Exercise it**: restore, or create a non-compliant test resource and watch it get fixed | Restore drill (Month 10); Config auto-remediation closes a test SG rule |

### 2. A validation matrix

Write one row per control. Example from the course labs:

| Control | Claim | Validation | Expected | Evidence |
|---|---|---|---|---|
| App task role (M7) | Can only read/write `tenants/*` | Policy simulator + CLI with role credentials | Other prefixes → AccessDenied | Simulator screenshot, CLI output |
| Bucket policy (M7) | Non-TLS denied | Request with `--endpoint-url http://…` | AccessDenied | CLI output |
| OIDC deploy role (M8) | Only `production` environment | Workflow job without environment | AssumeRole fails | Actions log |
| NetworkPolicy (M9) | API can't reach the internet | `wget` from an API-labelled debug pod | Timeout | Command output |
| PSA restricted (M9) | Privileged pods rejected | `kubectl apply -f bad-pod.yaml` | Rejected | Admission error |
| Root alert (M7) | Root use alerts | Root sign-in | Email/chat alert within 5 min | Alert screenshot + time |
| GuardDuty (M7) | Findings reach the team | Generate sample findings | Routed via EventBridge | Notification |
| CloudTrail SCP (M9) | Logging can't be stopped | `StopLogging` from a non-break-glass admin | AccessDenied | CLI output |
| Checkov gate (M8) | Public DB SG blocked in PRs | PR adding `0.0.0.0/0` on 5432 | CI fails | PR link |

### 3. Safe validation rules

- **Your own lab accounts and clusters only**, with written scope (the same rules as Month 4's assessment workflow).
- Use **harmless triggers**: sample findings, test identities, deny-expected requests. Never real malware or destructive actions.
- Tell anyone who receives the alerts that a test is happening, and tag test events clearly.
- Clean up test identities and resources afterwards.

For organizations that want broader, repeatable detection testing, there are open-source frameworks that
map test cases to MITRE ATT&CK techniques (e.g. Atomic Red Team for hosts, and cloud-focused equivalents).
They're powerful, so use them only in dedicated lab accounts with approval, and read what each test does first.

### 4. Continuous validation

| Layer | Runs | Catches |
|---|---|---|
| CI (Checkov, Semgrep, tests) | Every PR | New misconfiguration and code bugs |
| Admission (PSA, Kyverno) | Every deploy | Insecure workloads |
| Config rules / Prowler on a schedule | Daily/weekly | Drift and manual changes |
| Scheduled negative tests | Weekly | Controls that silently stopped working |
| Alert "heartbeat" | Daily | Broken alert routing |

---

## 🧪 Lab — Prove your controls (3–4 h)

1. Build a validation matrix with at least 10 rows for **your** lab (Months 6–9).
2. Execute every row and capture evidence (command, output, timestamp).
3. For any control that failed validation, fix it and validate again. Record what was wrong. (Expect at least one surprise.)
4. Automate two negative tests as a script or CI job that runs on a schedule (e.g. a GitHub Actions `schedule:` job using the read-only role to confirm a denied action stays denied).
5. Re-run your Week 33 attack-path tool after this month's fixes. How many paths remain?

---

## 📝 Assignment — Validate controls with evidence

**Task:** validate controls and record the evidence that demonstrates they work.

`VALIDATION.md`: the matrix (≥ 10 controls), evidence for each, failures found and fixed, the automated
checks and their schedule, and the remaining attack paths.

### Acceptance criteria
- [ ] ≥ 10 controls validated across identity, network, workload, logging and pipeline
- [ ] Preventive controls validated with negative tests; detective controls with harmless triggers
- [ ] At least one failed validation found, fixed and re-validated (or a clear statement that all passed first time, with evidence)
- [ ] Two automated, scheduled checks
- [ ] Test resources cleaned up

---

## 💼 On the job

- Mature security teams run "control validation" or "purple team" exercises regularly.
- Auditors increasingly ask for evidence that controls *operate*, not only that they're configured.

## ⚠️ Common mistakes

- Assuming a deployed control works.
- Testing only the allowed path.
- Alerts tested once at setup and never again.
- Using production accounts or real-looking malicious payloads for validation.

## 🥊 Drill (pass mark 8/10)

**1.** How do you validate a preventive control?
<details><summary>Answer</summary>Attempt the forbidden action from the relevant identity or network position and confirm it's denied.</details>

**2.** How do you validate a detective control?
<details><summary>Answer</summary>Trigger a harmless, expected event and confirm the alert fires, reaches the right people, and has enough context to act on.</details>

**3.** Why validate alert routing, not just alert rules?
<details><summary>Answer</summary>A correct rule that sends to an unmonitored destination is as useless as no rule.</details>

**4.** What is an alert heartbeat?
<details><summary>Answer</summary>A regular test event that should produce an alert, proving the pipeline from log to notification still works.</details>

**5.** Why do some validations surprise teams?
<details><summary>Answer</summary>Controls can be misattached, overridden, unsupported (e.g. a CNI ignoring NetworkPolicies) or broken by later changes.</details>

**6.** What makes validation evidence trustworthy?
<details><summary>Answer</summary>Exact commands, outputs, identities used, timestamps, and repeatability (ideally automated).</details>

**7.** Name two rules for running validation safely.
<details><summary>Answer</summary>Any two of: own lab accounts only with written scope; harmless triggers; notify alert recipients; clean up test identities/resources.</details>

**8.** What's the value of re-running the attack-path tool after fixes?
<details><summary>Answer</summary>It shows the measurable reduction in paths to sensitive data, and what still remains.</details>

**9.** Why automate some negative tests?
<details><summary>Answer</summary>Controls drift; scheduled tests catch regressions without relying on someone remembering.</details>

**10.** Scenario: your validation shows the root-activity alert fired, but 3 hours late. What do you do?
<details><summary>Answer</summary>Treat it as a failed control: find the delay (event delivery, rule, notification channel), fix it, re-test, and set a target time-to-alert in the matrix.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #13

## 📚 Resources
- MITRE ATT&CK — <https://attack.mitre.org/>
- AWS IAM policy simulator — <https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html>
- GuardDuty sample findings — <https://docs.aws.amazon.com/guardduty/latest/ug/sample_findings.html>
- Kubernetes security — <https://kubernetes.io/docs/concepts/security/>

---
[← Week 35](week-35-kubernetes-security.md) · [Month project →](project.md)
