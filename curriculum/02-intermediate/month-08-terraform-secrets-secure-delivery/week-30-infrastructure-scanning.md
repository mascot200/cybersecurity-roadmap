# Week 30 — Infrastructure Scanning

> **Level:** Intermediate · **Time:** ~10 h · **Tracking:** [issue #12](https://github.com/mascot200/cybersecurity-roadmap/issues/12)
> **Lab files:** [`labs/ci/terraform.yml`](labs/ci/terraform.yml) (YAML-validated workflow)

## 🎯 Objectives

1. Scan Terraform with Checkov (or Trivy's config scanning) and triage the findings.
2. Write a custom policy for a rule specific to your organization.
3. Decide which findings block a release, and document exceptions.
4. Put scanning, plan review and apply behind gates in CI.

## 🌍 Why it matters

A misconfiguration caught in a pull request costs a comment. The same misconfiguration in production can
cost a breach. IaC scanners check every resource against hundreds of known-bad patterns (public buckets,
open security groups, unencrypted storage, missing logs) before anything is created.

---

## 📖 Concepts

### 1. Tools

| Tool | Checks | Notes |
|---|---|---|
| `terraform validate` | Syntax and internal consistency | Not security, but catches broken code |
| **Checkov** | Terraform, CloudFormation, Kubernetes, Dockerfiles… against built-in policies | Python or YAML custom policies |
| **Trivy** (`trivy config`) | Same idea; also images (Month 6) | One tool for several jobs |
| **tflint** | Provider-specific mistakes and style | Complements security scanners |
| **OPA / Conftest** | Your own policies in Rego against the plan JSON | Powerful for org-specific rules |

```bash
checkov -d labs/terraform
checkov -d labs/terraform --compact --quiet          # only failed checks
trivy config labs/terraform
```

### 2. Triage, again

Same decisions as Month 5: **fix**, **false positive** (skip with a reason), or **accepted risk** (owner + expiry).

Checkov skip with a reason, inline on the resource:

```hcl
resource "aws_s3_bucket" "uploads" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not needed for lab data (risk accepted, review 2027-01)
  bucket = "..."
}
```

Expect some findings on the lab bucket (for example, access logging or cross-region replication not
configured). Decide for each: add the control, or skip it with a reason. Both are acceptable. Silence isn't.

**The same lesson from Month 7's linter:** when building this month's CI deploy role, the Month 7 IAM
linter flagged `kms:CreateKey` on `Resource: "*"` as HIGH. That action *can't* be scoped to an ARN, since
the key doesn't exist yet. The policy limits it with an `aws:RequestTag/project` condition instead, which
the simple linter doesn't evaluate. It's a false positive: record it, and consider improving the tool
(an exercise below).

### 3. What blocks a release

| Finding type | Gate |
|---|---|
| Public exposure (bucket, DB, `0.0.0.0/0` on admin/DB ports) | **Block** |
| Missing encryption at rest for data stores | **Block** |
| IAM wildcards on actions/resources (without justification) | **Block** |
| Logging disabled / CloudTrail changes | **Block**, plus security review |
| Missing best-practice extras (access logs, replication) | Warn; track |
| New check not yet tuned | Warn for a sprint, then decide |

Document it in `IAC_GATES.md`, the same format as Month 5's `SECURITY_GATES.md`.

### 4. Gates in the pipeline

The lab workflow [`terraform.yml`](labs/ci/terraform.yml):

| Job | When | Does | Credentials |
|---|---|---|---|
| `scan` | Every PR and push | `fmt -check`, `validate`, Checkov (fails on findings) | None |
| `plan` | PRs | `plan`, uploads the plan text as an artifact for review | **Read-only** plan role via OIDC |
| `apply` | Push to `main` | `apply` in the `production` environment (required reviewer, one at a time) | **Deploy** role via OIDC |

The plan job can't change anything, even if a malicious PR alters the Terraform code, because its role is
read-only and its trust policy only accepts tokens from `pull_request` runs (Week 31).

> The plan text can include resource attributes. Terraform masks values marked `sensitive`, but review what
> you upload, and keep artifact retention short (the workflow uses 7 days).

---

## 🧪 Lab — Scan, triage, gate (3–4 h)

1. Run Checkov on [`labs/terraform/`](labs/terraform/). For each failed check: fix it or skip it with a reason.
2. Deliberately add a bad resource (a security group with `0.0.0.0/0` on 5432) and confirm Checkov fails. Remove it.
3. **Custom policy:** write a Checkov YAML policy requiring every `aws_s3_bucket` to have a `project` tag (or that `aws_db_instance.publicly_accessible` is false). Test it against a passing and a failing example.
4. Copy [`terraform.yml`](labs/ci/terraform.yml) into a repo with your Terraform under `infra/`. Get `scan` green (plan/apply come in Week 31).
5. **Improve the IAM linter (optional):** in your copy of the Month 7 linter, report `WILDCARD_RESOURCE` as MEDIUM instead of HIGH when the statement has a `Condition`, and add a test using `deploy-role-permissions.json`.

---

## 📝 Assignment — Infrastructure scanning with documented gates

**Task:** add infrastructure scanning and document which findings block release.

- `IAC_GATES.md`: tools, the blocking categories, exception process, current exceptions with owners and expiry dates.
- Evidence: a PR blocked by the scanner, and a green run after the fix.
- Your custom policy and its tests.

### Acceptance criteria
- [ ] Checkov (or Trivy) runs in CI and blocks the agreed categories
- [ ] Every current finding fixed or skipped with a reason
- [ ] Custom policy written and tested
- [ ] Blocked-PR evidence

---

## 💼 On the job

- Platform security teams own the IaC policy set and tune it so it's trusted rather than ignored.
- Many organizations add policy-as-code (OPA/Sentinel) for rules no off-the-shelf scanner knows.

## ⚠️ Common mistakes

- `soft_fail: true` forever.
- Blanket skips (`--skip-check` for whole categories) instead of per-resource skips with reasons.
- Scanning only `main`, after the change is merged.
- Giving the plan job write credentials.

## 🥊 Drill (pass mark 8/10)

**1.** What can IaC scanning catch that runtime tools can't?
<details><summary>Answer</summary>Misconfigurations before the resources exist, in review, when they're cheapest to fix.</details>

**2.** How should a Checkov finding be skipped?
<details><summary>Answer</summary>Inline on the specific resource with the check ID and a reason (and an expiry for accepted risks).</details>

**3.** Why does the plan job use a separate read-only role?
<details><summary>Answer</summary>PR code is untrusted until reviewed; a read-only role means it can't change infrastructure even if the code is malicious.</details>

**4.** Name three finding types that should block a release.
<details><summary>Answer</summary>Any three of: public exposure, missing encryption for data stores, wildcard IAM without justification, logging disabled or tampered with.</details>

**5.** What's OPA/Conftest used for here?
<details><summary>Answer</summary>Writing organization-specific policies (in Rego) evaluated against Terraform plans or configuration.</details>

**6.** Why was the `kms:CreateKey` finding a false positive?
<details><summary>Answer</summary><code>CreateKey</code> can't be scoped to a resource ARN; the policy restricts it with a request-tag condition, which the simple linter doesn't evaluate.</details>

**7.** Why upload the plan as an artifact?
<details><summary>Answer</summary>So reviewers can read exactly what will change before approving the PR.</details>

**8.** What should you check before uploading plan output?
<details><summary>Answer</summary>That it doesn't expose sensitive values; mark variables/outputs <code>sensitive</code>, and keep retention short.</details>

**9.** Why scan PRs instead of only `main`?
<details><summary>Answer</summary>To stop problems before merge and apply, while the author is still working on the change.</details>

**10.** Scenario: a team wants to skip all encryption checks because "our data isn't sensitive". Your answer?
<details><summary>Answer</summary>Encryption at rest is cheap and default-on in most services; data sensitivity changes over time. Ask for per-resource skips with justification and expiry if there's a real reason, approved by the data owner; otherwise fix.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #12

## 📚 Resources
- Checkov — <https://www.checkov.io/>
- Trivy misconfiguration scanning — <https://trivy.dev/latest/docs/scanner/misconfiguration/>
- Conftest — <https://www.conftest.dev/>
- tflint — <https://github.com/terraform-linters/tflint>

---
[← Week 29](week-29-terraform-foundations.md) · [Next: Week 31 — Secrets & identity →](week-31-secrets-identity-management.md)
