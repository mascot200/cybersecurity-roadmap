# Week 46 — Application and Pipeline

> **Level:** Advanced · **Time:** ~10–12 h · **Tracking:** [issue #16](https://github.com/mascot200/cybersecurity-roadmap/issues/16)

## 🎯 Objectives

1. Close the application and pipeline gaps from Week 45's requirement list.
2. Make every application requirement verifiable by an automated test.
3. Make every pipeline requirement visible in CI results and repository settings.
4. Produce a requirement → evidence table.

## 🌍 Why it matters

Reviewers and interviewers will open your repository and look at three things: the README, the tests,
and the CI runs. Green checks backed by meaningful security tests are much more convincing than a
description of what you intended.

---

## 📖 Concepts

### 1. Application hardening checklist

| Area | Done when | Course reference |
|---|---|---|
| Authentication | Token verification with all checks; tests for each failure mode | M3 W10 |
| Authorization | Central policy, RLS, matrix covering every endpoint × role × ownership | M3 W9, W12 |
| Validation & limits | Strict schemas, output allowlists, body/page/rate limits; boundary tests | M3 W11 |
| Browser security (if there's a frontend) | CSP without `unsafe-inline`, CSRF defenses, safe token storage | M2 W7 |
| Files & URLs | Content checks, private storage, URL guard | M4 W13–14 |
| Business rules | Atomic updates, constraints, idempotency; concurrency tests | M4 W15 |
| Errors & logging | Generic errors, correlation IDs, redaction tests | M2 W5, M10 W37 |

### 2. Pipeline checklist

| Control | Evidence |
|---|---|
| SAST (community + custom rules) with `semgrep --test` | Workflow run |
| SCA + dependency review | Workflow run; a blocked-PR example |
| Secret scanning + push protection | Repo settings; gitleaks job |
| IaC scanning + plan review | Workflow run; plan artifact |
| Image scan + SBOM | Workflow run; SBOM artifact |
| Security regression tests | Test job output |
| Least-privilege tokens, pinned actions | Workflow files; OpenSSF Scorecard (optional) |
| OIDC plan/deploy roles, protected environment | Settings screenshot; negative test log |
| Branch protection with required checks | Settings screenshot |

### 3. Requirement → evidence table

| Requirement | Status | Evidence |
|---|---|---|
| SR-02 tenant isolation | ✅ | `tests/authz/matrix.test.js` (N rows), CI run #123 |
| SR-07 no long-lived CI keys | ✅ | OIDC trust policy, failed AssumeRole log from negative test |
| … | | |

Put this table in the capstone README (or link it), so a reviewer can verify any claim in one click.

---

## 🧪 Lab — Close the gaps (6 h)

1. Work through the app and pipeline gap list from Week 45, one requirement at a time: test first, then fix.
2. Make sure CI runs every job on PRs and `main`, and that all jobs are required checks.
3. Open one deliberately bad PR per gate (vulnerable dependency, failing security test, IaC misconfiguration) and keep the links as evidence. Close them without merging.
4. Fill in the requirement → evidence table for application and pipeline requirements.

---

## 📝 Assignment — Show test results and checks in the repository

**Task:** show test results and security checks in the repository.

### Acceptance criteria
- [ ] Every application requirement has an automated test
- [ ] All pipeline gates run and are required
- [ ] One blocked-PR example per gate
- [ ] Requirement → evidence table filled for app and pipeline

---

## 💼 On the job

- "Security champions" in product teams do exactly this: keep requirements, tests and gates aligned.
- Mature teams generate the evidence table automatically from CI results for audits.

## ⚠️ Common mistakes

- Tests that exist but don't run in CI.
- Gates that warn but don't block.
- Evidence that's only screenshots, with no links to runs or code.

## 🥊 Drill (pass mark 8/10)

**1.** Why make every application requirement an automated test?
<details><summary>Answer</summary>Tests prove the requirement on every change and give repeatable evidence.</details>

**2.** What does a blocked-PR example prove?
<details><summary>Answer</summary>That the gate actually stops bad changes, not just reports them.</details>

**3.** Which pipeline controls show up in repository settings rather than workflow files?
<details><summary>Answer</summary>Branch protection/required checks, environments and their reviewers, secret scanning and push protection, Actions permissions defaults.</details>

**4.** Why put the evidence table in the README?
<details><summary>Answer</summary>Reviewers can check any claim quickly, which builds trust in the whole project.</details>

**5.** What's the order of work for each gap?
<details><summary>Answer</summary>Write the failing test, implement the fix, confirm the test passes, add it to CI.</details>

**6.** Why are "warn only" gates weak evidence?
<details><summary>Answer</summary>They don't prevent anything; a reviewer can't tell whether problems were merged.</details>

**7.** What does OpenSSF Scorecard check?
<details><summary>Answer</summary>Repository and pipeline practices such as branch protection, pinned dependencies, token permissions, dangerous workflows and more.</details>

**8.** What should a capstone CI include beyond unit tests?
<details><summary>Answer</summary>SAST, SCA/dependency review, secret scanning, IaC scanning, image scanning, security regression tests.</details>

**9.** How do you prove "no long-lived CI keys"?
<details><summary>Answer</summary>Show the OIDC trust policy, empty AWS secrets in CI settings, a clean gitleaks run, and a negative AssumeRole test.</details>

**10.** Scenario: a reviewer says your authorization tests only cover GET. What do you add?
<details><summary>Answer</summary>Matrix rows for PATCH/PUT/DELETE/POST and any custom actions (exports, sends), with database-state assertions for denied writes.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #16

## 📚 Resources
- GitHub security features — <https://docs.github.com/en/code-security/getting-started/github-security-features>
- OpenSSF Scorecard — <https://github.com/ossf/scorecard>

---
[← Week 45](week-45-architecture-requirements.md) · [Next: Week 47 — Infrastructure & operations →](week-47-infrastructure-operations.md)
