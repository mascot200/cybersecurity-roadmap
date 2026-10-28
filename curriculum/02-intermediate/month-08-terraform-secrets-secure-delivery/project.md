# Month 8 Project — Terraform Deployment with Least-Privilege CI (Project 4 · portfolio item 5: secure cloud/IaC pipeline)

> Builds on Months 5–8 · ~8 h beyond the weekly assignments

## Goal

Deploy part of your Month 7 architecture with Terraform through a pipeline that scans every change, plans
with a read-only identity, applies only after approval, and holds no long-lived secrets. Then prove you can
tear it all down.

## Scope (keep costs near zero)

Pick resources that are free or cheap and can be destroyed quickly, for example:
- secure-bucket module (S3 + KMS) for uploads
- VPC with public/private subnets and security groups (no NAT gateway)
- IAM roles: app task role (Month 7) and the two CI roles
- Secrets Manager secret for the app, with a rotation runbook
- CloudTrail data events on the state bucket

## Requirements

1. **Code:** modules, pinned providers, lock file, variables with validation, `default_tags`.
2. **State:** bootstrapped bucket, SSE-KMS, versioning, locking, restricted access.
3. **Pipeline:** fmt/validate/Checkov on PRs, plan with the read-only role, apply in a protected environment with the deploy role, all via OIDC.
4. **Secrets:** none in repo, CI or state where avoidable; app reads at runtime; one rotation performed.
5. **Gates:** `IAC_GATES.md` with blocking categories and exceptions.
6. **Teardown:** documented and tested; billing checked afterwards.

## README must include

- Architecture diagram and what's in scope
- How code becomes infrastructure (the pipeline, step by step)
- Where secrets could leak and how each path is closed
- Evidence: blocked PR, plan artifact, approval, apply run, negative OIDC tests, restore drill, teardown
- Limitations and costs

## Acceptance criteria

- [ ] All six requirement areas met
- [ ] No long-lived AWS keys anywhere (gitleaks + CI settings checked)
- [ ] Negative tests: plan role can't apply; deploy role can't be assumed outside the environment
- [ ] Teardown run; no leftover resources

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Terraform quality | ad hoc | structured | modules, validation, pinned, scanned |
| CI identity | stored keys | OIDC | OIDC, split roles, specific `sub`, negative tests |
| Secrets | in code/state | some removed | runtime only, rotation tested |
| State | local | remote | protected, locked, restore drill done |
| Evidence | none | partial | full lifecycle including teardown |
