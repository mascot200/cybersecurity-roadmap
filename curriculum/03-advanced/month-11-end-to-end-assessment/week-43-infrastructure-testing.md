# Week 43 — Infrastructure Testing

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #15](https://github.com/mascot200/cybersecurity-roadmap/issues/15)

## 🎯 Objectives

1. Execute the infrastructure and pipeline parts of the test plan with approved, read-only tools and negative tests.
2. Validate identity, network exposure, secrets, container configuration and deployment workflows.
3. Connect infrastructure findings to application findings as attack paths.
4. Record evidence in the same format as Week 42.

## 🌍 Why it matters

Many real incidents combine a modest application bug with an infrastructure weakness: an SSRF reaching
credentials, an over-privileged role, an exposed database, a pipeline that can be influenced. Testing
infrastructure and delivery alongside the app is what makes the assessment "end to end".

---

## 📖 Concepts

### 1. Test areas and methods

| Area | Method (from earlier months) | Evidence |
|---|---|---|
| IAM | Policy linter (M7), IAM Access Analyzer, policy simulator, negative CLI tests with each role | Findings list; denied-call outputs |
| Network | Security group review, Reachability Analyzer, connection tests from inside/outside (M7, M9) | Paths present/absent |
| Data | Block Public Access, encryption, bucket policy tests (M7) | Denied non-TLS / wrong-key requests |
| Posture | Prowler with a read-only audit role (M9) | Critical/high findings and their status |
| Containers | `verify.sh`, image scan, SBOM (M6) | PASS/FAIL list |
| Kubernetes (if used) | `check_pods.py`, PSA rejection, `kubectl auth can-i`, NetworkPolicy connection tests (M9) | Outputs |
| Pipeline | OIDC negative tests, workflow review (permissions, pinned actions, triggers), branch protection, environment rules (M5, M8) | Failed AssumeRole log; settings screenshots |
| Secrets | gitleaks over full history; state bucket access check; app environment check | Clean results or findings |
| Detection | Did infrastructure tests trigger expected alerts? (M10) | Alert timestamps |

### 2. Attack-path view of findings

After collecting findings, rerun your Week 33 attack-path model with any new edges you discovered. A
medium-severity app finding that connects to a high-privilege role can justify a higher overall priority.
Record such combinations as their own finding ("chained risk"), referencing the individual findings.

### 3. Ground rules

- Read-only identities for posture tools; test identities for negative tests.
- No changes to infrastructure during testing, except in agreed test resources.
- If a test unexpectedly succeeds where it should be denied, stop, record, and notify the owner before going further.

---

## 🧪 Lab — Execute the infrastructure and pipeline tests (4–5 h)

1. Run Prowler (or Security Hub checks) with the read-only role; triage critical/high.
2. Run IAM Access Analyzer validation and your linter on all custom policies.
3. Execute every negative test in your test plan (roles, buckets, network, OIDC) and record outputs.
4. Run `verify.sh` / `check_pods.py` / image scans against what's deployed.
5. Review every workflow file and the repository settings (branch protection, environments, Actions permissions).
6. Run gitleaks over full history; confirm who can read the Terraform state.
7. Update your attack-path model and note any chained risks.

---

## 📝 Assignment — Validate cloud and pipeline controls

**Task:** validate cloud and pipeline controls using approved tools and lab settings.

### Acceptance criteria
- [ ] Every infrastructure and pipeline test case has status and evidence
- [ ] Posture tool run with a read-only identity
- [ ] Negative tests for IAM, data, network and OIDC recorded
- [ ] Updated attack-path model; chained risks written up
- [ ] Findings in report format

---

## 💼 On the job

- Cloud security assessments are often scoped exactly like this: identity, network, data, workloads, pipeline, detection.
- Internal teams turn the negative tests into scheduled checks (Month 9, Week 36).

## ⚠️ Common mistakes

- Using admin credentials "to see everything".
- Fixing things mid-assessment without recording the original state.
- Treating each finding in isolation instead of as possible path links.
- Leaving the pipeline out because "it's GitHub's problem".

## 🥊 Drill (pass mark 8/10)

**1.** Why use read-only identities for posture tools?
<details><summary>Answer</summary>Assessment tools only need to read; write access adds risk if the tool or its credentials are compromised.</details>

**2.** What's a chained risk?
<details><summary>Answer</summary>A combination of findings that together create a path with higher impact than any one alone.</details>

**3.** Name three pipeline checks.
<details><summary>Answer</summary>Any three of: OIDC trust `sub` conditions (negative test), workflow token permissions, pinned actions, triggers like `pull_request_target`, branch protection, environment approvals, secret storage.</details>

**4.** What should you do if a negative test unexpectedly succeeds?
<details><summary>Answer</summary>Stop, record exactly what happened, and notify the owner before continuing.</details>

**5.** How do you check secrets across git history?
<details><summary>Answer</summary>Run a secret scanner (e.g. gitleaks) over the full history, not just the current tree.</details>

**6.** Why rerun the attack-path model?
<details><summary>Answer</summary>New findings may add edges that create paths from entry points to sensitive assets, changing priorities.</details>

**7.** Why shouldn't you fix issues mid-test?
<details><summary>Answer</summary>The evidence of the original state is lost and other tests may be affected; record first, fix afterwards (or with agreement).</details>

**8.** What evidence proves a database isn't internet-reachable?
<details><summary>Answer</summary>Reachability Analyzer "no path", SG rules referencing only the app SG, and a failed connection attempt from outside.</details>

**9.** What does checking who can read Terraform state protect against?
<details><summary>Answer</summary>Exposure of secrets stored in state and of the full infrastructure map.</details>

**10.** Scenario: the app has a low-severity SSRF-like behaviour limited to internal hostnames, and the task role can read every S3 bucket. How do you report it?
<details><summary>Answer</summary>Report both findings individually, plus a chained-risk finding with higher priority explaining the path (internal request capability + broad role), with fixes for both (URL guard and least-privilege role, IMDSv2).</details>

## ✅ Checklist
- [ ] Lab steps 1–7
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #15

## 📚 Resources
- Prowler — <https://docs.prowler.com/>
- IAM Access Analyzer policy validation — <https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html>
- OpenSSF Scorecard — <https://github.com/ossf/scorecard>

---
[← Week 42](week-42-application-testing.md) · [Next: Week 44 — Reporting & retesting →](week-44-reporting-retesting.md)
