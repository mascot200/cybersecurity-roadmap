# Month 3 Project — Multi-Tenant API Security Lab (Portfolio Project 1)

> Builds on Weeks 9–12 · ~8 h beyond the weekly assignments

## Goal

Build a small multi-tenant Node.js API with PostgreSQL whose security is **designed, documented and
proven**. Combine the three Month 3 labs into one service.

## Requirements

**Functionality**
- Tenants, users with roles (`admin`, `member`), and one resource type (invoices or similar)
- Endpoints: list, read, create, update, delete

**Security controls**
1. JWT authentication with a pinned algorithm and issuer, audience and expiry checks (Week 10)
2. Authorization policy in one module: tenant isolation, role checks, ownership rules (Week 9)
3. PostgreSQL Row-Level Security with a non-owner app role (Week 9)
4. Strict input schemas, an output allowlist, body/page/rate limits (Week 11)
5. Safe error handling with correlation IDs (Month 2)
6. Audit log of allowed and denied actions

**Tests and CI**
- Authorization matrix covering every endpoint × role × ownership case
- Authentication, input, limits and sensitive-data tests
- CI runs everything against PostgreSQL on every push, as a required check

## README must include

- Architecture diagram with trust boundaries
- Authorization policy table
- Threat model: top 5 threats, mitigation, and the test proving each
- How to run locally and how to run the tests
- Mutation testing results (at least 3 mutations and the tests that caught them)
- OWASP API Security Top 10 mapping
- Limitations

## Acceptance criteria

- [ ] All six control areas implemented
- [ ] Matrix and other tests pass in CI; required check enabled
- [ ] Every threat-model mitigation links to a test
- [ ] At least 3 recorded mutations
- [ ] No secrets in the repo (`gitleaks detect` clean)

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Authorization model | implicit | written | written + centralized + RLS |
| Authentication | weak | verified tokens | all checks + tests for each |
| Input & limits | none | some | strict schemas + all limits tested |
| Tests | few | broad | matrix + mutations + CI required |
| Documentation | missing | partial | diagram, policy, threat model, limitations |
