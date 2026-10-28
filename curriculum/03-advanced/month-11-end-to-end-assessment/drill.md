# Month 11 Drill — End-to-End Security Assessment

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes (calculator allowed for Part C).
> Record your score on [issue #15](https://github.com/mascot200/cybersecurity-roadmap/issues/15).
> Interactive version: ask Claude *"Drill me on Month 11 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What document authorizes an assessment?
<details><summary>Answer</summary>Rules of engagement (scope, approver, constraints), signed before testing.</details>

**A2.** ASVS or WSTG: which lists requirements, which describes test procedures?
<details><summary>Answer</summary>ASVS: requirements. WSTG: test procedures.</details>

**A3.** What are stop conditions?
<details><summary>Answer</summary>Agreed situations that pause testing (e.g. real personal data found, instability), with who to notify.</details>

**A4.** CVSS v3.1 High band?
<details><summary>Answer</summary>7.0–8.9.</details>

**A5.** What does "chained risk" mean?
<details><summary>Answer</summary>Several findings that combine into a higher-impact path.</details>

**A6.** What closes a finding?
<details><summary>Answer</summary>A retest with evidence that it no longer reproduces (or a documented risk acceptance).</details>

**A7.** Which identity should a posture tool use?
<details><summary>Answer</summary>A read-only audit identity.</details>

## Part B — Review it (2 points each: 1 problem, 1 fix)

**B1.** Finding: "SQL injection possible. Severity: Critical. Fix: sanitize inputs."
<details><summary>Answer</summary>No location, evidence, impact or vector; vague fix. Fix: endpoint and parameter, redacted evidence, impact, CVSS vector, root cause (string-built query), remediation (parameterized queries + search for the pattern), verification (regression test).</details>

**B2.** Evidence: a screenshot showing a real customer's name and address.
<details><summary>Answer</summary>Real personal data in the report. Fix: use test accounts and synthetic data; redact; stop and notify if real data was encountered.</details>

**B3.** Executive summary: "We found 3 IDORs, a CSP misconfig with unsafe-inline, and an over-permissive IAM policy (s3:*)."
<details><summary>Answer</summary>Jargon a non-technical reader can't act on. Fix: business terms ("any customer can read other customers' invoices"), overall risk, top recommendations.</details>

**B4.** Report has 12 findings and no "not tested" or limitations section.
<details><summary>Answer</summary>Overstates assurance. Fix: coverage table with statuses and a limitations section.</details>

**B5.** Findings marked "Fixed" because developers said so.
<details><summary>Answer</summary>No verification. Fix: retest with original steps and regression tests; record date and evidence.</details>

**B6.** Prowler run with an admin role.
<details><summary>Answer</summary>Unnecessary privilege. Fix: read-only audit role.</details>

## Part C — Score and justify (2 points each: 1 score, 1 rationale)

**C1.** Any authenticated customer can read other tenants' invoices by changing an ID. Vector and score?
<details><summary>Answer</summary><code>AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N</code> = 6.5 Medium base; justify a higher priority in a multi-tenant SaaS (all customers' data, trivial to exploit).</details>

**C2.** Unauthenticated request can crash the API until restart.
<details><summary>Answer</summary><code>AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H</code> = 7.5 High; rationale depends on availability requirements and how easy recovery is.</details>

**C3.** Stored XSS in an admin-only page, injected by any customer, with HttpOnly cookies and a strict CSP partially mitigating.
<details><summary>Answer</summary>Something like <code>AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N</code> (5.4 Medium) as a base; explain that the victim is an admin (high-value context) and that CSP reduces exploitability. Agree on the priority with the owner.</details>

## Month 10 review (bonus, 1 point each)

**R1.** First action for a confirmed leaked key?
<details><summary>Answer</summary>Revoke/deactivate it (contain).</details>

**R2.** What proves a backup is usable?
<details><summary>Answer</summary>A verified restore (checksum, completeness, timing).</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
