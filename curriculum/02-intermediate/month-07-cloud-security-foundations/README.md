# Month 7 — Cloud Security Foundations

> 🔵 **Level 2 · Intermediate** · Weeks 25–28 · ~40 h · Tracking issue: [#11](https://github.com/mascot200/cybersecurity-roadmap/issues/11)

**Goal:** understand how identity, networking and managed services affect application security.

The examples use **AWS** (free tier where possible). The concepts (identities and policies, private
networks, managed encryption keys, audit logs) carry over to Azure and Google Cloud with different names.

> 💸 **Budget first.** Before Week 25's AWS steps: MFA on root, a budget alert, and a habit of deleting
> resources after each lab. See [Safety & budget](../../../docs/safety-and-ethics.md#cloud-budget-protection-checklist).

![Reference architecture](images/cloud-architecture.svg)

## Weekly plan

| Week | Lesson | You will build / prove | Est. time |
|---|---|---|---|
| 25 | [IAM and identity](week-25-iam-identity.md) | SSO admin with MFA, least-privilege app role, policy linting | 10 h |
| 26 | [Cloud networking](week-26-cloud-networking.md) | Private subnets, SG-to-SG rules, Session Manager, flow logs | 10 h |
| 27 | [Data protection](week-27-data-protection.md) | Locked-down S3 with KMS, Secrets Manager, denied-access evidence | 10 h |
| 28 | [Logging and governance](week-28-logging-governance.md) | CloudTrail, GuardDuty, alerts, an investigation timeline | 10 h |
| — | [Month project](project.md) | **Cloud security architecture diagram + checklist** | woven into weeks |
| — | [Monthly drill](drill.md) | ≥ 80% | 45 min |

## Lab files

| File | Status |
|---|---|
| [`labs/policies/`](labs/policies/) | 5 sample policies (app task role, ECS trust, bucket policy, MFA guardrail, deliberately broad example). All valid JSON. |
| [`labs/policy-lint/`](labs/policy-lint/) | Python IAM policy linter, **9/9 unit tests passing**: good policies produce no findings, and the broad example triggers every rule |
| AWS console/CLI steps | Not run where this course was written (no AWS account). Commands follow AWS documentation. |

While building this month, a mistake in the bucket policy was caught and fixed: `StringNotEqualsIfExists`
would also have denied uploads with no key header. Week 27 explains why.

## Milestone (must demonstrate before Month 8)

- [ ] Explain why application identities should have **minimal permissions**, with your app role as the example
- [ ] Explain why **databases should remain private**, and show how your network enforces it
- [ ] Show the CloudTrail investigation timeline from Week 28

## Recommended resources

- **AWS documentation** — <https://docs.aws.amazon.com/>
- **AWS Skill Builder** — <https://skillbuilder.aws/>

---
[← Month 6](../month-06-docker-host-deployment-security/README.md) · [Course home](../../../README.md) · [Start Week 25 →](week-25-iam-identity.md)
