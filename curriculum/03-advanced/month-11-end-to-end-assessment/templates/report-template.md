# Security Assessment Report — <system name>

**Version:** 1.0 · **Date:** YYYY-MM-DD · **Tester:** <name> · **Classification:** Confidential

## 1. Executive summary
Three to five sentences for a non-technical reader: what was assessed, the overall risk, the most important
issues in business terms, and the top recommendations.

| Severity | Count | Fixed and retested |
|---|---|---|
| Critical | 0 | 0 |
| High | 0 | 0 |
| Medium | 0 | 0 |
| Low | 0 | 0 |

## 2. Scope and method
- In scope / out of scope (from the rules of engagement)
- Environment and dates
- Method: standards used (OWASP WSTG, ASVS level), tools, test plan reference
- Limitations

## 3. Architecture and threat model summary
Diagram, trust boundaries, top threats (link to the full threat model).

## 4. Findings

### F-01 · <short title> · <Severity> (CVSS 3.1 <score>)
| | |
|---|---|
| **Vector** | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N` |
| **Affected** | endpoint / resource / file:line |
| **Status** | Open / Fixed (retested YYYY-MM-DD) / Risk accepted |

**Description:** what the weakness is, in one paragraph.
**Impact:** what an attacker could achieve, in business terms, and preconditions.
**Evidence:** redacted request/response or command output, timestamps (no real user data).
**Root cause:** why it exists (code, configuration, process).
**Remediation:** specific fix; also where else the pattern should be checked.
**Verification:** the test that proves the fix (link to regression test / commit).
**Severity rationale:** why this vector and score; adjust for environment if relevant.

## 5. Positive observations
Controls that worked well. This helps teams keep them.

## 6. Residual risk and recommendations
What remains after fixes, accepted risks with owners and review dates, and strategic recommendations.

## Appendix
Test plan with status, tool versions, evidence index with hashes.
