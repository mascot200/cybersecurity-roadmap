# Month 11 Project — Full Assessment Report (Portfolio Item 7)

> Builds on Weeks 41–44 · the report is the deliverable

## Goal

A professional-quality assessment report of your own system (non-production), suitable (after
sanitizing) for your portfolio.

## Required sections (from the [template](templates/report-template.md))

1. Executive summary with findings-by-severity table
2. Scope and method: rules of engagement summary, standards (ASVS L2, WSTG), tools, dates, limitations
3. Architecture and threat model summary
4. Findings: each with CVSS vector and score, rationale, description, impact, evidence, root cause, remediation, verification, status
5. Chained risks (from the attack-path view)
6. Positive observations
7. Residual risk and recommendations
8. Appendix: test plan with statuses, tool versions, evidence index with hashes

## Acceptance criteria

- [ ] Signed rules of engagement attached
- [ ] Test plan ≥ 30 cases, all with status and evidence
- [ ] Every finding scored with a vector and rationale (use `labs/cvss`)
- [ ] All critical/high fixed and retested, or formally accepted
- [ ] Executive summary checked by a non-technical reader
- [ ] Sanitized: no real secrets, account IDs, hostnames or personal data

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Scope & plan | informal | written | signed RoE + ASVS-mapped plan |
| Coverage | app only | app + infra | app + infra + pipeline + detection |
| Findings | vague | complete | complete, evidenced, root cause, chained risks |
| Severity | none | CVSS only | CVSS + explicit business rationale |
| Retest | none | some | all critical/high retested with evidence |
