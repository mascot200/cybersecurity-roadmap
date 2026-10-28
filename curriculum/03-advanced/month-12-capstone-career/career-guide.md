# Career Guide — From Developer to AppSec / Cloud Security

> Companion to Week 48 · Tracking: [issue #16](https://github.com/mascot200/cybersecurity-roadmap/issues/16)

## 1. Roles this course prepares you for

| Role | What the work looks like | Your strongest evidence |
|---|---|---|
| **Application Security Engineer** | Design reviews, threat models, code review, SAST/SCA tuning, helping teams fix | Months 2–5, Project 2 (API template), assessment report |
| **Product Security / Security Champion** (inside a dev team) | Security requirements, tests and gates for one product | Months 3–5 and the capstone requirement → evidence table |
| **DevSecOps / Platform Security Engineer** | Secure pipelines, IaC policies, container and cluster hardening | Months 5–9, Project 4 (Terraform + OIDC) |
| **Cloud Security Engineer** | IAM, network design, posture management, guardrails, cloud IR | Months 7–10, cloud threat model, attack-path analysis |
| **Security Engineer (generalist)** at a startup | All of the above, plus incident response | The capstone end to end |

Map your skills to the **NIST NICE Framework** work roles (e.g. *Secure Software Development*,
*Cybersecurity Architecture*, *Incident Response*) to describe your experience in standard terms:
<https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center>.

## 2. Positioning yourself

You're not "a beginner in security"; you're **a developer who secures systems**. Lead with that:

> *"Backend engineer with a year of hands-on application and cloud security work: built a multi-tenant
> API with tested tenant isolation, a secure CI/CD pipeline with OIDC and policy gates, hardened
> container and AWS deployments in Terraform, detections and a verified restore process, and ran a
> full assessment with CVSS-rated findings and retests. All public, with evidence."*

**CV / LinkedIn:** one line per project with a measurable result ("authorization matrix of 120 cases in
CI", "reduced attack paths to sensitive data from 4 to 1", "restore verified in 6 minutes against a 1-hour RTO").

## 3. Certifications (optional)

See [docs/certifications.md](../../../docs/certifications.md). With this portfolio, a cert is a filter-passer,
not the main proof. Common choices at this point: **Burp Suite Certified Practitioner** (AppSec) or
**AWS Certified Security – Specialty** (cloud).

## 4. Interview practice: 20 questions

Answer each **out loud** in under two minutes, then compare. Better still, ask Claude:
*"Interview me for a junior AppSec / cloud security role using my roadmap's career guide; ask follow-ups when I'm vague."*

**1. Walk me through what happens when a user logs in to your API.**
<details><summary>Strong answer covers</summary>TLS, credential check with a slow hash (or IdP + OIDC), session/token issuance with secure attributes, token verification on each request (alg, iss, aud, exp), then authorization per request; logging and throttling along the way.</details>

**2. How would you find and prevent IDOR/BOLA across a codebase?**
<details><summary>Strong answer covers</summary>Central authorization policy, tenant from identity, scoped queries, RLS as a safety net, an authorization matrix in CI, code review/SAST for unscoped queries, inventory of endpoints.</details>

**3. Explain XSS to a product manager, then to a developer.**
<details><summary>Strong answer covers</summary>PM: someone else's code running as the user on our site. Dev: untrusted data reaching an HTML/JS context unencoded; fix with context-aware encoding, safe framework defaults, sanitization when HTML is needed, and CSP as defense in depth.</details>

**4. Why parameterized queries rather than escaping?**
<details><summary>Strong answer covers</summary>Query structure is fixed before data is bound, so data can't become SQL; escaping depends on getting every context right. Allowlists for identifiers.</details>

**5. What's wrong with storing JWTs in localStorage?**
<details><summary>Strong answer covers</summary>Readable by any XSS; prefer HttpOnly cookies with a BFF or short-lived in-memory tokens; strong CSP either way; trade-offs with CSRF.</details>

**6. How do you decide whether a SAST finding is real?**
<details><summary>Strong answer covers</summary>Trace data flow from source to sink, check for sanitization/validation, reachability, and context; record decision with reason; suppress narrowly; improve the rule if noisy.</details>

**7. A critical CVE drops in a library you use. What do you do in the first day?**
<details><summary>Strong answer covers</summary>SBOM/SCA to find affected services, check reachability/exposure, prioritize internet-facing, patch or mitigate, rebuild/redeploy through the pipeline, monitor for exploitation, communicate.</details>

**8. How would you secure a GitHub Actions pipeline that deploys to AWS?**
<details><summary>Strong answer covers</summary>OIDC with sub-restricted trust, split plan/deploy roles, protected environments, least-privilege GITHUB_TOKEN, pinned actions, no pull_request_target with untrusted code, script-injection safety, branch protection, scans as required checks.</details>

**9. What makes a container secure at runtime?**
<details><summary>Strong answer covers</summary>Non-root, read-only FS, dropped capabilities, no-new-privileges, seccomp default, no privileged/host mounts/Docker socket, limits, minimal pinned scanned image, secrets as files.</details>

**10. Explain AWS IAM policy evaluation.**
<details><summary>Strong answer covers</summary>Default deny, explicit deny wins, SCPs/boundaries limit, allows from identity or resource policies grant; trust policies for roles.</details>

**11. How do you keep a database private in AWS, and prove it?**
<details><summary>Strong answer covers</summary>Private subnets, not publicly accessible, SG from app SG only, no IGW route; prove with Reachability Analyzer, SG review and a failed external connection.</details>

**12. What's an attack path? Give an example from your work.**
<details><summary>Strong answer covers</summary>Chain from entry to sensitive asset; e.g. web role → UpdateFunctionCode → reports role → admin; fix by removing unnecessary edges and narrowing necessary ones, with detection.</details>

**13. How do you protect Terraform state?**
<details><summary>Strong answer covers</summary>Remote encrypted versioned bucket, locking, access only for CI roles and break-glass, data-event logging, secrets kept out of state where possible.</details>

**14. Design a detection for password spraying. How do you avoid false positives?**
<details><summary>Strong answer covers</summary>One source failing across many distinct accounts in a window; tune by baseline, known shared IPs with expiry, enrich with later successes; test with true- and false-positive data.</details>

**15. You get an alert: an access key used from an unusual country. First 30 minutes?**
<details><summary>Strong answer covers</summary>Open incident and roles, contain (deactivate key, revoke sessions), preserve and pull CloudTrail for the key, scope actions, hunt persistence, communicate, then plan recovery.</details>

**16. How do you know your backups work?**
<details><summary>Strong answer covers</summary>Scheduled restore tests with integrity and completeness checks, timed against RTO, stored immutably in another account.</details>

**17. How do you rate the severity of a finding?**
<details><summary>Strong answer covers</summary>CVSS base vector as a consistent starting point, then explicit business context (data sensitivity, scale, exposure, attack paths) in the rationale.</details>

**18. Tell me about a time a security control didn't work as you expected.**
<details><summary>Strong answer covers</summary>A real example from your labs (e.g. a test passing for the wrong reason, a policy condition behaving unexpectedly, a check with a bug) and how you found and fixed it.</details>

**19. How would you get developers to adopt security practices without slowing them down?**
<details><summary>Strong answer covers</summary>Secure defaults and templates, fast and accurate CI checks, block only new high-impact issues, clear fix guidance, champions, measure and tune noise.</details>

**20. What would you improve in your capstone with another month?**
<details><summary>Strong answer covers</summary>Specific items from your residual-risk list, with why they matter and how you'd verify them.</details>

## 5. Keep going

- Practice: PortSwigger Academy practitioner labs, flAWS/flAWS2, Kubernetes security labs.
- Contribute: a Semgrep rule, a Sigma rule, docs fixes for security tools.
- Write: one blog post per project explaining a lesson learned (sanitized).
- Responsible disclosure: only within published bug bounty or disclosure programs and their scope.
