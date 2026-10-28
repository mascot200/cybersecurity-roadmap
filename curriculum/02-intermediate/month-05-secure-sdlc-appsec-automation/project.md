# Month 5 Project — Secure Node.js API Template (Portfolio Project 2/3)

> Builds on Months 1–5 · ~8 h beyond the weekly assignments

## Goal

Create a **template repository** a team could use to start a new API with security built in. Every new
service created from it starts with secure defaults, tests and CI gates, instead of each team rebuilding them.

## Requirements

**Secure defaults (code)**
- Express app with `helmet`, JSON body limit, safe error handler with correlation IDs
- JWT authentication middleware (pinned algorithm, issuer, audience, expiry), applied globally with explicit public routes
- An authorization helper (policy in one module) and an example resource that uses it
- zod validation helper; example strict schemas for create/update; output allowlist
- Rate limiting (configurable store)
- Structured JSON logging with redaction of `authorization`, `cookie`, `password`, `token` fields
- Audit log helper for security-relevant actions
- Config loaded from environment, validated at startup; app refuses to start with missing secrets

**Tests**
- Example authorization matrix test
- Tests for each default: headers, body limit, auth failures, validation, rate limit, log redaction

**Pipeline and repository**
- The Week 20 security workflow (all jobs green), actions pinned to SHAs
- Custom Semgrep rules in `.semgrep/` with passing `semgrep --test`
- Dependabot for npm and GitHub Actions
- `SECURITY.md` (how to report vulnerabilities), `CODEOWNERS`, PR template with a security checklist
- `THREAT_MODEL.md` for the template's example service

## README must include

- What the template gives you, and what each team still has to do (authorization policy, threat model)
- How to create a new service from it
- The security gates and how to request an exception
- Limitations

## Acceptance criteria

- [ ] All secure defaults implemented and tested
- [ ] CI green; a deliberately bad PR is blocked (evidence)
- [ ] `semgrep --test` passes
- [ ] Repository marked as a GitHub template
- [ ] README, `SECURITY.md`, `CODEOWNERS`, PR template, `THREAT_MODEL.md` present

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Secure defaults | few | most | all, tested |
| Pipeline | none | runs | gates block bad changes, actions pinned |
| Custom rules | none | written | tested and passing |
| Docs | missing | partial | README, gates, threat model, security policy |
| Usability | hard to reuse | template works | new service in < 10 minutes |
