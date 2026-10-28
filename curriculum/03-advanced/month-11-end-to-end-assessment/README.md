# Month 11 — End-to-End Security Assessment

> 🔴 **Level 3 · Advanced** · Weeks 41–44 · ~42 h · Tracking issue: [#15](https://github.com/mascot200/cybersecurity-roadmap/issues/15)

**Goal:** combine application, infrastructure and delivery security into a professional assessment.

You assess the system you've built across the course, in a non-production environment, under written
rules of engagement, and deliver a report with evidence, severity, fixes and retest results.

![Assessment coverage](images/assessment-coverage.svg)

## Weekly plan

| Week | Lesson | You will build / prove | Est. time |
|---|---|---|---|
| 41 | [Scope and threat model](week-41-scope-threat-model.md) | Rules of engagement, architecture, ASVS-mapped test plan (≥ 30 cases) | 10 h |
| 42 | [Application testing](week-42-application-testing.md) | Executed app test cases with evidence; endpoint inventory | 10–12 h |
| 43 | [Infrastructure testing](week-43-infrastructure-testing.md) | Executed infra and pipeline tests; chained risks | 10 h |
| 44 | [Reporting and retesting](week-44-reporting-retesting.md) | Scored findings, executive summary, retests | 10 h |
| — | [Month project](project.md) | **Full assessment report** (portfolio item 7) | woven into weeks |
| — | [Monthly drill](drill.md) | ≥ 80% | 45 min |

## Templates and lab

| File | Purpose / status |
|---|---|
| [`templates/rules-of-engagement.md`](templates/rules-of-engagement.md) | Authorization, scope, stop conditions |
| [`templates/test-plan.md`](templates/test-plan.md) | Test cases mapped to ASVS/WSTG and earlier labs |
| [`templates/report-template.md`](templates/report-template.md) | Executive summary, findings format, residual risk |
| [`labs/cvss/`](labs/cvss/) | CVSS v3.1 base-score calculator; tests pass, and 8 reference vectors match FIRST's published scores |

## Milestone (must demonstrate before Month 12)

- [ ] A complete assessment report: scope, threat model, findings, evidence, severity, fixes, retest results

## Recommended resources

- **OWASP Web Security Testing Guide** — <https://owasp.org/www-project-web-security-testing-guide/>
- **Microsoft Security Development Lifecycle** — <https://learn.microsoft.com/en-us/compliance/assurance/assurance-microsoft-security-development-lifecycle>

---
[← Month 10](../month-10-monitoring-incident-response/README.md) · [Course home](../../../README.md) · [Start Week 41 →](week-41-scope-threat-model.md)
