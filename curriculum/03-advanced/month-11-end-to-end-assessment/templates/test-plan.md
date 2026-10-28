# Test Plan — <system name>

Each row is one test case. Reference the standard requirement it verifies so coverage is visible.

| ID | Area | Requirement (ASVS / WSTG ref) | Method | Tool / test | Expected result | Status | Finding |
|---|---|---|---|---|---|---|---|
| APP-01 | Authentication | Tokens verified (iss, aud, exp, alg) — ASVS V9 / WSTG-SESS | Automated | JWT verifier test suite | Forged/expired tokens → 401 | ☐ | |
| APP-02 | Authorization | Cross-tenant access denied — ASVS V8 / WSTG-ATHZ-04 | Automated + manual | Authorization matrix tests; proxy replay with other tenant's IDs | 404, data unchanged | ☐ | |
| APP-03 | Input | Strict schemas, no mass assignment — ASVS V5 / WSTG-INPV | Automated | API limits tests | 400 on unknown fields | ☐ | |
| APP-04 | Dependencies | No known high/critical vulns — ASVS V14 | Automated | npm audit / OSV-Scanner | 0 unaccepted high/critical | ☐ | |
| INF-01 | Identity | App role least privilege | Automated + review | Policy linter, IAM Access Analyzer, simulator | Denied actions denied | ☐ | |
| INF-02 | Network | DB not reachable from internet | Automated | Reachability Analyzer / connection test | No path | ☐ | |
| INF-03 | Containers | Non-root, read-only, caps dropped | Automated | `verify.sh` / `check_pods.py` | All PASS | ☐ | |
| PIPE-01 | CI/CD | OIDC roles limited by `sub` | Negative test | Workflow without environment | AssumeRole denied | ☐ | |
| PIPE-02 | CI/CD | Actions pinned, least-privilege tokens | Review | Workflow files, OpenSSF Scorecard | Pinned SHAs, `contents: read` | ☐ | |

Coverage notes: list areas **not** tested and why (time, scope, tooling).
