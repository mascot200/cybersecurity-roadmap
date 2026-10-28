# Final Checkpoint Drill — The Whole Course

> The **final gate**. Pass mark: **80% (40/50)** **and** the practical demo.
> Time box: 90 minutes, no notes. Record your score on [issue #16](https://github.com/mascot200/cybersecurity-roadmap/issues/16) and the Level 3 epic [#4](https://github.com/mascot200/cybersecurity-roadmap/issues/4).
> Interactive version: ask Claude *"Give me the final checkpoint drill for my cybersecurity roadmap, mixing all 12 months, one question at a time, grade strictly, then run my practical demo."*

## Part A — Rapid recall across the year (1 point each)

**A1.** File permission for an SSH private key?
<details><summary>Answer</summary>600.</details>

**A2.** Recommended password hashing algorithm?
<details><summary>Answer</summary>Argon2id (bcrypt/scrypt acceptable).</details>

**A3.** Root cause of all injection?
<details><summary>Answer</summary>Untrusted data interpreted as code/commands by an interpreter.</details>

**A4.** Does CORS stop CSRF?
<details><summary>Answer</summary>No.</details>

**A5.** #1 in the OWASP API Security Top 10?
<details><summary>Answer</summary>Broken Object Level Authorization.</details>

**A6.** What does pinning the resolved IP defeat?
<details><summary>Answer</summary>DNS rebinding.</details>

**A7.** SAST vs SCA?
<details><summary>Answer</summary>Your code's patterns vs known-vulnerable dependencies.</details>

**A8.** Why pin GitHub Actions to SHAs?
<details><summary>Answer</summary>Tags can be moved; SHAs can't.</details>

**A9.** Docker network option for no internet access?
<details><summary>Answer</summary><code>internal: true</code>.</details>

**A10.** IAM: explicit Deny or Allow wins?
<details><summary>Answer</summary>Explicit Deny.</details>

**A11.** What claim must every GitHub OIDC trust policy restrict?
<details><summary>Answer</summary><code>sub</code> (plus <code>aud</code>).</details>

**A12.** Pod Security level to enforce for app namespaces?
<details><summary>Answer</summary>restricted.</details>

**A13.** First IR action for a leaked key?
<details><summary>Answer</summary>Revoke/deactivate it (contain).</details>

**A14.** RPO vs RTO?
<details><summary>Answer</summary>Max data loss vs max downtime.</details>

**A15.** CVSS score of `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`?
<details><summary>Answer</summary>9.8 Critical.</details>

## Part B — Review it (2 points each)

**B1.** `pool.query("SELECT * FROM users WHERE email = '" + email + "'")`
<details><summary>Answer</summary>SQL injection; parameterize.</details>

**B2.** `app.get('/invoices/:id', auth, (req,res) => db.query('SELECT * FROM invoices WHERE id=$1',[req.params.id]))`
<details><summary>Answer</summary>BOLA; scope by tenant/owner from the identity; matrix tests; RLS.</details>

**B3.** `res.cookie('sid', sid)`
<details><summary>Answer</summary>Missing HttpOnly, Secure, SameSite, lifetime.</details>

**B4.** A workflow with `permissions: write-all` and `uses: some/action@main`.
<details><summary>Answer</summary>Over-privileged token and a mutable reference; use <code>contents: read</code> and pin to a SHA.</details>

**B5.** Compose: `ports: ["5432:5432"]` on the DB.
<details><summary>Answer</summary>DB exposed on all interfaces; remove, use internal network.</details>

**B6.** IAM: `{"Effect":"Allow","Action":"iam:PassRole","Resource":"*"}` on a CI role.
<details><summary>Answer</summary>Privilege escalation path; scope to specific roles.</details>

**B7.** OIDC trust with only `aud` condition.
<details><summary>Answer</summary>Any GitHub repo can assume it; add an exact <code>sub</code>.</details>

**B8.** Kubernetes Deployment with `privileged: true` and `hostPath: /`.
<details><summary>Answer</summary>Node takeover; remove; enforce PSA restricted.</details>

**B9.** `logger.info({ body: req.body })` on `/login`.
<details><summary>Answer</summary>Logs passwords; redact / log only safe fields.</details>

**B10.** Backups on the same server, never restored.
<details><summary>Answer</summary>Same failure domain and unproven; off-account, immutable, scheduled restore tests.</details>

## Part C — Scenarios (3 points each)

**C1.** Design the authorization layer for a new multi-tenant feature, end to end.
<details><summary>Answer</summary>Written policy; tenant from token; central helper; scoped queries; RLS; function-level checks; output allowlist; matrix tests incl. DB-state checks; audit log; detection for cross-tenant probing.</details>

**C2.** A pentester reports SSRF in a URL-import feature. Walk through triage, fix and verification.
<details><summary>Answer</summary>Check what the server can reach (metadata, internal services) and the role's permissions for severity; fix with allowlist + resolved-IP checks + pinning + no redirects; IMDSv2 and egress limits; regression tests incl. redirects and IPv6; retest; consider detection for blocked attempts.</details>

**C3.** CI deploy role used from an IP outside GitHub. What happened, what do you do, and what do you change?
<details><summary>Answer</summary>Possible OIDC trust misconfiguration or token theft; contain (revoke sessions, tighten/disable trust), scope via CloudTrail, hunt persistence, recover; change: exact <code>sub</code>, environment approvals, alert on assumptions from unexpected sources, least privilege.</details>

**C4.** Leadership asks "are we secure?" How do you answer with evidence?
<details><summary>Answer</summary>Describe the risk, not a yes/no: threat model and top risks, controls with validation evidence, attack-path reduction, open findings and residual risk, detection and recovery readiness (drill results), and the plan.</details>

**C5.** Your restore drill fails the RTO. What now?
<details><summary>Answer</summary>Record the gap; find bottlenecks; automate, use PITR/standby; rerun; or agree a new target with the business; track as an action item.</details>

## Part D — Practical demo (required, 15 minutes; pass/fail)

Show, on your capstone:
1. A cross-tenant request being denied, and the test that proves it.
2. A PR blocked by a security gate.
3. An alert firing for a simulated event, with its timestamp.
4. A verified restore with timing.
5. The README's requirement → evidence table, and one claim verified live.

## Scoring

Part A 15 + Part B 20 + Part C 15 = **50**. Pass: **≥ 40 and the practical demo**.
Then close issue #16 and the Level 3 epic #4. 🎉 You've completed the roadmap.
