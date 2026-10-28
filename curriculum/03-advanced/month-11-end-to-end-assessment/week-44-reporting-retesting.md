# Week 44 — Reporting and Retesting

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #15](https://github.com/mascot200/cybersecurity-roadmap/issues/15)
> **Lab code:** [`labs/cvss/`](labs/cvss/): CVSS v3.1 calculator, 4 test groups passing (8 reference vectors match FIRST's published scores)
> **Template:** [`report-template.md`](templates/report-template.md)

## 🎯 Objectives

1. Rate severity with CVSS v3.1 and explain the rationale, including business context.
2. Write findings that developers can fix and executives can prioritize.
3. Write an executive summary for a non-technical reader.
4. Retest every fix and record residual risk.

## 🌍 Why it matters

The report is the product of an assessment. Findings that are vague, mis-rated or hard to reproduce don't
get fixed, or get fixed wrongly. A clear, well-evidenced report with honest severity turns testing work into
risk reduction, and a retest closes the loop by proving the fixes work.

---

## 📖 Concepts

### 1. CVSS v3.1 base score

| Metric | Values | Question |
|---|---|---|
| Attack Vector (AV) | Network / Adjacent / Local / Physical | From where can it be exploited? |
| Attack Complexity (AC) | Low / High | Are special conditions needed? |
| Privileges Required (PR) | None / Low / High | What access is needed first? |
| User Interaction (UI) | None / Required | Does a victim have to act? |
| Scope (S) | Unchanged / Changed | Does impact cross a security boundary (e.g. browser of another user, another component)? |
| Confidentiality / Integrity / Availability | High / Low / None | What's the impact? |

Severity bands: **0.1–3.9 Low · 4.0–6.9 Medium · 7.0–8.9 High · 9.0–10.0 Critical**.

```bash
cd labs/cvss
python3 -m unittest -v
python3 cvss31.py "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"     # 6.5 Medium
```

The calculator implements the specification's equations, including its Roundup function, which avoids
floating-point noise pushing scores up a band. Its tests check eight vectors against FIRST's published
scores (9.8, 10.0, 6.5, 6.1, 7.8, 5.9, 7.5, 0.0).

Worked examples from this course:

| Finding | Vector | Score |
|---|---|---|
| Authenticated user reads other tenants' invoices (BOLA, M3) | `AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N` | 6.5 Medium |
| Reflected XSS requiring a click (M2) | `AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N` | 6.1 Medium |
| Unauthenticated SQL injection with full DB access (M2) | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` | 9.8 Critical |

**CVSS is a starting point, not the final priority.** A 6.5 BOLA that exposes every customer's invoices in
a multi-tenant SaaS may be the most important finding in the report. Explain adjustments in the severity
rationale (data sensitivity, number of tenants, exploit availability, attack-path context from Week 43).
CVSS v4.0 (2023) refines several metrics; many tools and advisories still use v3.1, so know both exist.

### 2. Writing findings

Use the [template](templates/report-template.md): title, severity and vector, affected component, status,
description, impact, evidence, root cause, remediation, verification, severity rationale.

| Weak | Strong |
|---|---|
| "Authorization issues found" | "`GET /invoices/:id` returns invoices from other tenants: any authenticated user can read all customers' billing data" |
| "Validate input" | "Scope the query by `tenant_id` from the token through the shared policy helper; add matrix rows for cross-tenant GET/PATCH/DELETE" |
| Screenshot of a whole browser | Minimal redacted request/response with timestamp and test-account IDs |

### 3. Executive summary

Three to five sentences: what was assessed, overall risk in business terms, the top issues, and the top
recommendations. Plus a table of findings by severity and status. No jargon, no CVSS vectors.

### 4. Retesting

For each fixed finding: rerun the original evidence steps and the regression test, confirm variants are
also handled, and update the status with date and evidence. Findings that can't be fixed get a documented
risk acceptance (owner, reason, compensating controls, review date). Then write the residual-risk section.

---

## 🧪 Lab — Score, write, retest (4 h)

1. Run the calculator's tests. Score three of your own findings and write the rationale for each, including any business adjustment.
2. Extend the calculator (optional): accept a vector without the `CVSS:3.1/` prefix and reject unknown metric values with a clear error. Add tests.
3. Write every finding from Weeks 42–43 in the report format.
4. Write the executive summary, then have someone non-technical read it. Could they say what the biggest risk is?
5. Fix at least the critical/high findings (or the top three), retest, and update statuses with evidence.

---

## 📝 Assignment — Executive summary, findings and retest

**Task:** produce an executive summary and technical findings, then retest fixes.

The complete report (this is the month project): see [project.md](project.md).

### Acceptance criteria
- [ ] Every finding scored with a vector and a written rationale
- [ ] Executive summary readable by a non-technical person
- [ ] All critical/high fixed and retested (or formally accepted)
- [ ] Residual-risk section

---

## 💼 On the job

- Reports are read by developers (how to fix), managers (what to prioritize) and auditors (evidence). Write for all three.
- Retests are often what customers or auditors ask for: proof that issues were closed.

## ⚠️ Common mistakes

- Inflating severity to get attention (it erodes trust) or deflating it to avoid friction.
- Evidence with real user data or unredacted secrets.
- Remediation that treats the symptom of one endpoint instead of the root cause.
- Closing findings without a retest.

## 🥊 Drill (pass mark 8/10)

**1.** What are the CVSS v3.1 severity bands?
<details><summary>Answer</summary>Low 0.1–3.9, Medium 4.0–6.9, High 7.0–8.9, Critical 9.0–10.0.</details>

**2.** What does Scope: Changed mean?
<details><summary>Answer</summary>The impact extends beyond the vulnerable component's security authority (e.g. XSS affecting the user's browser context).</details>

**3.** Score: unauthenticated network attack, low complexity, no interaction, full C/I/A impact, scope unchanged.
<details><summary>Answer</summary>9.8 Critical (<code>AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</code>).</details>

**4.** Why is CVSS not the final priority?
<details><summary>Answer</summary>It doesn't know business context: data sensitivity, scale, exploitability in your environment, or attack paths.</details>

**5.** Why does the spec define a special Roundup function?
<details><summary>Answer</summary>To avoid floating-point errors producing a score one decimal higher than intended.</details>

**6.** What belongs in an executive summary?
<details><summary>Answer</summary>Scope, overall risk in business terms, top issues, top recommendations, and a findings-by-severity table.</details>

**7.** What makes evidence good?
<details><summary>Answer</summary>Minimal, redacted, timestamped, reproducible, using test accounts only.</details>

**8.** What's required before closing a finding?
<details><summary>Answer</summary>A retest showing the issue no longer reproduces (plus variants), with evidence and date.</details>

**9.** What should a risk acceptance contain?
<details><summary>Answer</summary>Owner, reason, compensating controls, and a review/expiry date.</details>

**10.** Scenario: a developer disputes your "High" rating for a BOLA finding scored 6.5. How do you respond?
<details><summary>Answer</summary>Show the CVSS vector (6.5 Medium base) and your written rationale for raising the priority: all tenants' data exposed, multi-tenant SaaS impact, trivial exploitation by any customer. Agree on priority with the owner; keep the base score accurate and the adjustment explicit.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #15

## 📚 Resources
- CVSS v3.1 specification — <https://www.first.org/cvss/v3.1/specification-document>
- CVSS v3.1 calculator — <https://www.first.org/cvss/calculator/3.1>
- CVSS v4.0 — <https://www.first.org/cvss/v4.0/>
- OWASP WSTG reporting — <https://owasp.org/www-project-web-security-testing-guide/>

---
[← Week 43](week-43-infrastructure-testing.md) · [Month project →](project.md)
