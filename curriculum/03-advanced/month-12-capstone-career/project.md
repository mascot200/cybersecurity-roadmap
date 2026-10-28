# Capstone — Secured Cloud-Native Application (Portfolio Item 8)

> The whole of Month 12 · builds on every month of the course

## Goal

A secured cloud-native application: Node.js API, PostgreSQL, hardened containers, Terraform, secret
management, CI security checks, monitoring, backups and assessment documentation, with evidence for every claim.

## Required components

| Area | Must include | Built in |
|---|---|---|
| Application | Token auth, central authorization + RLS, strict validation and limits, safe errors, redacted logging | M1–M4, M10 |
| Pipeline | SAST (+custom rules), SCA, secrets, IaC and image scanning, security tests, required checks, pinned actions | M5, M6, M8 |
| Containers | Non-root, read-only, no capabilities, limits, scanned + SBOM | M6 |
| Cloud | Terraform; least-privilege roles; private network; encrypted data; Secrets Manager; CloudTrail/GuardDuty | M7–M8 |
| Delivery identity | OIDC plan/deploy roles with `sub` conditions; protected environment | M8 |
| Detection & response | ≥ 5 tested detections routed as alerts; IR runbook; one simulated incident report | M10 |
| Recovery | Verified, immutable backups; timed restore; teardown procedure | M8, M10 |
| Assessment | Report with CVSS-rated findings, fixes and retests | M11 |

## Repository must contain

`README.md` (Week 48 structure) · `ARCHITECTURE.md` · `THREAT_MODEL.md` · `REQUIREMENTS.md` (with the
requirement → evidence table) · `SECRETS.md` · `RECOVERY.md` · `IR_REPORT.md` · `ASSESSMENT.md` ·
`evidence/` (indexed, hashed) · source, tests, IaC and workflows.

## Acceptance criteria

- [ ] 25–40 requirements, each with linked evidence
- [ ] CI green on `main`; all security checks required; blocked-PR examples
- [ ] Negative tests for IAM, network, OIDC and data controls
- [ ] Alert received end to end; restore timed against RTO
- [ ] Assessment report with retests; no unaccepted critical/high findings
- [ ] Sanitized (gitleaks + `sanitize_check.py`); published or shared
- [ ] Teardown procedure tested; costs checked

## Rubric (self-assess, 16/20 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Design | none | diagram | diagram + threat model + requirements |
| Application security | basic | most controls | all controls, tested |
| Pipeline | none | some gates | all gates required, evidence of blocking |
| Containers | default | hardened | hardened + verified + scanned |
| Cloud | console | Terraform | Terraform + least privilege + private + encrypted |
| Delivery identity | stored keys | OIDC | OIDC split roles + negative tests |
| Detection & response | none | logs | tested detections + IR report |
| Recovery | none | backups | verified, immutable, timed restore |
| Assessment | none | findings | CVSS + rationale + retests |
| Presentation | messy | readable | evidence-linked README; optional demo |
