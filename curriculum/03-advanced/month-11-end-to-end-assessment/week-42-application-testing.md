# Week 42 — Application Testing

> **Level:** Advanced · **Time:** ~10–12 h · **Tracking:** [issue #15](https://github.com/mascot200/cybersecurity-roadmap/issues/15)

## 🎯 Objectives

1. Execute the application part of your test plan against your own non-production system.
2. Combine automated evidence (test suites, SAST, SCA) with focused manual review.
3. Record results and evidence for every test case, pass or fail.
4. Write findings as you go, in the report format.

## 🌍 Why it matters

This week brings together everything from Levels 1 and 2. The skill being tested is coverage and evidence:
working through a plan systematically, so that "no findings" in an area means "tested, with evidence",
not "didn't look".

---

## 📖 Concepts

### 1. Sources of evidence

| Area (test plan) | Automated evidence you already have | Manual focus |
|---|---|---|
| Authentication & sessions | JWT verifier tests (M3 W10), session tests (M1 W4, M2 W8) | Token storage in the client; logout and reset flows end to end |
| Authorization | Authorization matrix (M3 W12) | Endpoints added since the matrix was written; admin functions; exports |
| Input & limits | Schema and limit tests (M3 W11), SAST custom rules (M5) | Places that skip the shared validation helper |
| Browser controls | Header and CSRF tests (M2 W7) | CSP effectiveness in the real frontend |
| Files & outbound requests | Upload and URL-guard tests (M4) | Every feature that touches files or URLs |
| Business logic | Concurrency tests (M4 W15) | Workflow order, limits, refunds/cancellations |
| Dependencies | `npm audit`, OSV-Scanner, image scan (M5–M6) | Reachability of any remaining advisories |
| Logging & detection | Redaction tests, detection tests (M10) | Did your own test activity raise the alerts you expected? |

### 2. Inventory first

List every route from the code (router files) and compare with your authorization matrix and API
documentation. Undocumented or untested endpoints are where findings cluster. OWASP API9 (Improper
Inventory Management) exists for this reason.

### 3. Using an intercepting proxy, safely

In an authorized, non-production environment, a proxy such as Burp Suite Community or OWASP ZAP is useful
for **observing** real traffic from the frontend (what the client actually sends and stores) and for
**replaying** a captured request with a different test account's credentials, to confirm what your
authorization matrix claims. Keep scope settings limited to your target, use only your test accounts,
and save the relevant requests and responses as evidence. Your automated tests remain the main evidence;
the proxy confirms behaviour end to end through the real frontend and infrastructure.

### 4. Recording results

For every test case: status (pass / fail / not applicable / not tested), evidence link, and a finding ID
if it failed. Write the finding while the details are fresh, using the
[report template](templates/report-template.md). Score it with the CVSS lab (Week 44).

---

## 🧪 Lab — Execute the application test plan (5–6 h)

1. Run all your automated suites against the deployed non-production environment (not just locally), and save the outputs with timestamps.
2. Run SAST (custom + community rules), SCA and image scans on the deployed version's commit.
3. Build the endpoint inventory and compare it with the authorization matrix. Add matrix rows for any gaps and run them.
4. Work through the manual-focus column above for your system.
5. Check your Month 10 stack: which of your testing activities appeared in the logs, and which alerts fired?
6. Update the test plan statuses and write findings.

---

## 📝 Assignment — Repeatable application test plan, executed

**Task:** execute a repeatable test plan against your own non-production application.

### Acceptance criteria
- [ ] Every application test case has a status and evidence
- [ ] Endpoint inventory reconciled with the authorization matrix
- [ ] Findings written in the report format (description, impact, evidence, root cause, remediation, verification)
- [ ] Detection observations recorded (what was and wasn't noticed)

---

## 💼 On the job

- Internal AppSec teams run this kind of assessment before major releases; much of the evidence comes from the product team's own tests.
- Good assessors leave behind new automated tests, so the next assessment starts further ahead.

## ⚠️ Common mistakes

- Testing only locally rather than the deployed environment.
- Recording only failures, so coverage can't be shown.
- Ignoring endpoints that aren't in the documentation.
- Using real user accounts or data.

## 🥊 Drill (pass mark 8/10)

**1.** Why test the deployed environment and not only locally?
<details><summary>Answer</summary>Proxy, headers, network rules, configuration and secrets differ in deployment; only the deployed system shows real behaviour.</details>

**2.** What is endpoint inventory reconciliation?
<details><summary>Answer</summary>Comparing every route in the code with documentation and the authorization matrix to find untested or undocumented endpoints.</details>

**3.** Why record passing tests too?
<details><summary>Answer</summary>To show coverage: "no findings" must mean "tested with evidence".</details>

**4.** What is a proxy used for in an authorized assessment?
<details><summary>Answer</summary>Observing real client traffic and replaying requests with other test accounts to confirm behaviour end to end.</details>

**5.** Where do findings tend to cluster?
<details><summary>Answer</summary>In new, undocumented or untested endpoints, admin functions, exports and code paths that bypass shared helpers.</details>

**6.** Why check whether your testing triggered alerts?
<details><summary>Answer</summary>It validates detection coverage (Month 10): activity that should be noticed but wasn't is a finding too.</details>

**7.** When should findings be written?
<details><summary>Answer</summary>As soon as they're confirmed, while evidence and details are fresh.</details>

**8.** What does OWASP API9 cover?
<details><summary>Answer</summary>Improper inventory management: unknown, old or undocumented API versions and endpoints.</details>

**9.** Which account types should be used?
<details><summary>Answer</summary>Dedicated test accounts in test tenants with synthetic data, as listed in the rules of engagement.</details>

**10.** Scenario: your matrix tests pass, but the frontend stores the access token in `localStorage`. Is that a finding?
<details><summary>Answer</summary>Yes, typically a medium-severity design weakness: any XSS could read the token. Recommend an HttpOnly cookie with a backend-for-frontend or in-memory short-lived tokens, plus strong CSP.</details>

## ✅ Checklist
- [ ] Lab steps 1–6
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #15

## 📚 Resources
- OWASP WSTG — <https://owasp.org/www-project-web-security-testing-guide/>
- OWASP API Security Top 10 — <https://owasp.org/API-Security/>
- OWASP ZAP — <https://www.zaproxy.org/>

---
[← Week 41](week-41-scope-threat-model.md) · [Next: Week 43 — Infrastructure testing →](week-43-infrastructure-testing.md)
