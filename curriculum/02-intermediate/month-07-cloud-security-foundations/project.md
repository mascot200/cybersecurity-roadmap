# Month 7 Project — Cloud Security Architecture and Checklist

> Builds on Weeks 25–28 · ~6 h beyond the weekly assignments · Feeds Month 8 (Terraform) and the capstone

## Goal

Design how your API (Months 3–6) would run securely on AWS, and write the checklist you'll use to verify
it once Month 8 builds it with Terraform.

## Deliverables

1. **Architecture diagram** (draw.io, Excalidraw or Mermaid): accounts, VPC, subnets, load balancer, compute, database, storage, KMS, Secrets Manager, logging, and trust boundaries.
2. **Security checklist** with five sections. For each item: the control, why, and how you'll verify it.

   | Section | Example items |
   |---|---|
   | Identity | Root MFA, no root keys; humans via SSO + MFA; app role least privilege; CI via OIDC (Month 8); Access Analyzer clean |
   | Network | App and DB private; SGs reference SGs; no admin ports open; flow logs; endpoints for AWS services |
   | Data | Block Public Access; SSE-KMS; TLS-only bucket policy; Secrets Manager with rotation; RDS encrypted, not public, force TLS |
   | Logging | Org/multi-region CloudTrail to a protected account; GuardDuty; alerts (root, IAM, logging changes); Config rules |
   | Recovery | Automated backups; cross-account snapshot copies; documented restore with RPO/RTO; budget alarms |

3. **IAM policies** for the app role and a CI deploy role, linted with `lint_policies.py` (no HIGH/CRITICAL).
4. **Threat summary:** top 5 cloud-specific threats (leaked key, public bucket, exposed DB, SSRF to metadata, deleted logs) and which checklist items address each.

## Acceptance criteria

- [ ] Diagram shows every component and trust boundary
- [ ] Checklist covers identity, network, data, logging and recovery, each with a verification method
- [ ] Policies lint clean
- [ ] Threat summary maps threats to controls
- [ ] Evidence from at least two lab weeks attached (simulator results, denied requests, CloudTrail timeline)

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Diagram | missing | components only | components + boundaries + data flows |
| Checklist | generic | specific | specific + verification for each item |
| IAM | broad | scoped | scoped + conditions + linted |
| Logging & recovery | missing | logging only | logging, alerts, backups with targets |
| Evidence | none | one week | two+ weeks of lab evidence |
