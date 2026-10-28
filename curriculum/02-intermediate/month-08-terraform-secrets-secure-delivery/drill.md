# Level 2 Checkpoint Drill — Months 5–8

> This is the **Level 2 gate**. Pass mark: **80% (32/40)** **and** the practical task.
> Time box: 75 minutes, no notes. Record your score on [issue #12](https://github.com/mascot200/cybersecurity-roadmap/issues/12) and the Level 2 epic [#3](https://github.com/mascot200/cybersecurity-roadmap/issues/3).
> Interactive version: ask Claude *"Give me the Level 2 checkpoint drill for my roadmap (Months 5–8), one question at a time, grade strictly, then a practical task."*

## Part A — Month 8 recall (1 point each)

**A1.** What does `terraform plan -out=tfplan` followed by `terraform apply tfplan` guarantee?
<details><summary>Answer</summary>The exact reviewed plan is what gets applied.</details>

**A2.** Which GitHub workflow permission is needed for OIDC?
<details><summary>Answer</summary><code>id-token: write</code>.</details>

**A3.** Which claim in GitHub's OIDC token identifies the repo and environment/branch?
<details><summary>Answer</summary><code>sub</code>.</details>

**A4.** Where are Terraform-managed secrets stored by default?
<details><summary>Answer</summary>In the state file, in plaintext.</details>

**A5.** What does `use_lockfile = true` do?
<details><summary>Answer</summary>Native S3 state locking via a lock file.</details>

**A6.** Name an IaC scanner.
<details><summary>Answer</summary>Checkov, Trivy (config), tfsec (now part of Trivy), KICS, Terrascan.</details>

## Part B — Months 5–7 recall (1 point each)

**B1.** SAST vs SCA?
<details><summary>Answer</summary>SAST: your code's risky patterns. SCA: known-vulnerable dependencies.</details>

**B2.** Why pin GitHub Actions by SHA?
<details><summary>Answer</summary>Tags can be moved; SHAs can't.</details>

**B3.** Name four runtime hardening options for a container.
<details><summary>Answer</summary>Non-root user, read-only root FS, drop all capabilities, no-new-privileges (also resource limits, no published ports).</details>

**B4.** What does `internal: true` do on a Docker network?
<details><summary>Answer</summary>No route to the internet.</details>

**B5.** In IAM, what wins: Allow or explicit Deny?
<details><summary>Answer</summary>Explicit Deny.</details>

**B6.** Why send CloudTrail logs to a separate account?
<details><summary>Answer</summary>So compromised production credentials can't delete them.</details>

## Part C — Review it (2 points each: 1 problem, 1 fix)

**C1.**
```json
"Condition": { "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" } }
```
(the deploy role's only trust condition)
<details><summary>Answer</summary>No <code>sub</code> condition: any GitHub repository can assume the role. Fix: <code>StringEquals</code> on <code>sub</code> = <code>repo:OWNER/REPO:environment:production</code>.</details>

**C2.**
```hcl
resource "aws_security_group_rule" "db" {
  type        = "ingress"
  from_port   = 5432
  to_port     = 5432
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.db.id
}
```
<details><summary>Answer</summary>Database open to the internet. Fix: <code>source_security_group_id = aws_security_group.api.id</code>; Checkov should block it.</details>

**C3.**
```yaml
- run: echo "Deploying ${{ github.event.head_commit.message }}"
```
<details><summary>Answer</summary>Script injection from an attacker-controlled commit message. Fix: pass via <code>env:</code> and reference <code>$VAR</code>.</details>

**C4.**
```dockerfile
FROM node:22
COPY . .
RUN npm install
CMD ["node", "server.js"]
```
<details><summary>Answer</summary>Runs as root; copies everything (secrets, .git); dev deps and install scripts; large unpinned base. Fix: multi-stage, .dockerignore, <code>npm ci --omit=dev --ignore-scripts</code>, <code>USER node</code>, pinned slim base.</details>

**C5.**
```hcl
resource "aws_s3_bucket" "logs" { bucket = "acme-logs" }
```
(nothing else configured)
<details><summary>Answer</summary>No public access block, encryption, versioning, ownership controls or TLS-only policy. Fix: use the secure-bucket module (or add each resource).</details>

**C6.** Every engineer has read access to the production Terraform state bucket.
<details><summary>Answer</summary>Secrets in state are exposed to everyone. Fix: restrict to CI and break-glass roles, audit reads, rotate secrets in state, move secrets out of state.</details>

## Part D — Scenarios (2 points each)

**D1.** Walk through how a change becomes infrastructure in your pipeline, naming each gate.
<details><summary>Answer</summary>PR → CODEOWNERS review → fmt/validate/Checkov → plan with read-only OIDC role → reviewers read plan → merge → apply job in protected environment (required reviewer, main only) with deploy OIDC role → CloudTrail records it.</details>

**D2.** List four places a secret could leak between developer and production, with the control for each.
<details><summary>Answer</summary>Git (gitleaks/push protection); CI variables/logs (OIDC, masking, no echo); container image layers/env (runtime secrets, scanning); Terraform state (restricted, encrypted, managed secrets). Also app logs (redaction).</details>

**D3.** A critical CVE lands in a base image library used by 12 services. What do you do?
<details><summary>Answer</summary>Query SBOMs to find affected images, prioritize internet-facing services, rebuild on a patched base (or mitigate if no fix), redeploy through the pipeline, verify with scans, track exceptions.</details>

**D4.** Your SAST tool flags 300 issues and the team wants to disable it. Your plan?
<details><summary>Answer</summary>Block only new findings in PRs, tune or disable noisy rules, triage the backlog by severity with owners and deadlines, add custom rules for what matters.</details>

**D5.** An app container is compromised. Which controls from Months 6–8 limit the damage?
<details><summary>Answer</summary>Non-root, read-only FS, dropped caps, no Docker socket, private networks/SGs, least-privilege task role (one bucket prefix, one secret), IMDSv2, no long-lived keys, CloudTrail/GuardDuty to detect it.</details>

## Part E — Practical (required; pass/fail)

Within 30 minutes, in your own lab:

1. Open a PR that adds an S3 bucket **without** encryption or a public access block. Show that CI blocks it.
2. Fix it using your secure-bucket module and show the green run and the plan artifact.
3. Show the CloudTrail event for the role session that ran the plan, and identify the `sub` it came from.

Pass = all three shown with evidence.

## Scoring

Parts A–B 12 + Part C 12 + Part D 10 = 34, plus **6 points** for explaining your Project 4 pipeline aloud
(or in writing) to someone else: 2 for the gates, 2 for secrets, 2 for recovery. Total **40**.
Pass: **≥ 32 and the practical**. Then close the Level 2 epic.
