# Month 4 Project — Assessment Report of Your Lab Applications

> Builds on Months 2–4 · ~6 h beyond the weekly assignments

## Goal

Write a structured assessment report covering **at least five findings** from your own lab applications
(Months 2–4). For each one: evidence, impact, remediation, and a retest that proves the fix. The goal is to
practise communicating security issues clearly. The report should be useful to the developer who has to
fix the issue and to the manager who has to prioritize it.

## Scope

Only your own local lab apps (bound to `127.0.0.1`) and intentionally vulnerable training targets you run
locally. Write a one-paragraph scope statement at the top: what's in scope, what isn't, dates.

Good sources of findings are the weaknesses you fixed in earlier labs. Many of your labs kept a
"before" version and a regression test: the test that failed before the fix is your evidence, and the
same test passing is your retest.

## Report structure

1. **Summary** (3–5 sentences, no jargon): what was assessed, overall risk, most important issues.
2. **Scope and method:** targets, dates, tools, limitations.
3. **Findings table:** ID, title, severity, status.
4. **One section per finding:**

   | Field | Content |
   |---|---|
   | Title & severity | Short title; Low/Medium/High/Critical plus a CVSS v3.1 vector (FIRST's calculator) |
   | Affected | Endpoint, file and line |
   | Description | The weakness in one paragraph |
   | Impact | What could happen, in business terms |
   | Evidence | Minimal, redacted request/response or the failing test output, with timestamp |
   | Root cause | Why it existed (code pattern, missing check, configuration) |
   | Remediation | The specific fix, and where else to look for the same pattern |
   | Retest | The test or steps proving the fix, with date and result |

5. **Recommendations:** patterns to fix centrally (shared helpers, lint/SAST rules).

## Acceptance criteria

- [ ] Scope statement; only authorized local targets
- [ ] ≥ 5 findings, from at least three different vulnerability classes
- [ ] Every finding has evidence, impact, root cause, remediation and a retest result
- [ ] Severity with a CVSS vector and one sentence of rationale
- [ ] Summary readable by a non-technical person
- [ ] No real data or secrets in the report

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Findings | < 3 | 3–4 | ≥ 5 across ≥ 3 classes |
| Evidence | none | screenshots | minimal, redacted, reproducible |
| Remediation | vague | specific | specific + root cause + "also check" |
| Retest | none | stated | test output with date |
| Clarity | hard to follow | readable | summary works for a non-technical reader |
