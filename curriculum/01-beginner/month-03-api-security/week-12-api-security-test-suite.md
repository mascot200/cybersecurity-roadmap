# Week 12 — API Security Test Suite

> **Level:** Beginner · **Time:** ~10 h · **Tracking:** [issue #7](https://github.com/mascot200/cybersecurity-roadmap/issues/7)
> **Example:** [`labs/authz/authz-matrix.test.js`](labs/authz/authz-matrix.test.js) (19 matrix rows, all passing)

## 🎯 Objectives

1. Organize security tests by what they protect: authentication, authorization, input and limits, data exposure.
2. Write table-driven authorization tests that scale as endpoints and roles grow.
3. Make tests trustworthy: positive controls, database-state checks, mutation testing.
4. Map your suite to the OWASP API Security Top 10 and find the gaps.
5. Run the suite in CI against a real database on every push.

## 🌍 Why it matters

Authorization bugs usually come back through regressions: a new endpoint copies an old one without its
checks, or a refactor drops a `WHERE` clause. A security test suite that runs on every change catches
these before release. It also turns "we fixed it" into evidence you can show a reviewer, an auditor or a
pentester doing a retest.

---

## 📖 Concepts

### 1. What to test

| Category | Example tests | Week |
|---|---|---|
| **Authentication** | no token → 401; expired / wrong-issuer / wrong-audience token → 401 | 10 |
| **Object-level authorization** | other tenant's ID → 404, data unchanged | 9 |
| **Function-level authorization** | member calling an admin operation → 403 | 9 |
| **Property-level** | unknown or privileged fields in body → 400; internal fields never in responses | 11 |
| **Resource limits** | oversized body → 413; page size cap; rate limit → 429 | 11 |
| **Errors** | malformed input → 400 with no stack trace or SQL | 5, 11 |
| **Sensitive data** | password hashes, tokens and secrets never returned or logged | 4, 8 |

### 2. Table-driven authorization tests

Writing one hand-made test per case doesn't scale: 10 endpoints × 4 roles × 3 ownership cases is 120 tests.
Put the expectations in a table and generate the tests:

```js
const MATRIX = [
  // caller,               method,   id, expected
  ['alice (Acme admin)',   'get',    3,  404],   // other tenant
  ['bob (Acme member)',    'get',    1,  404],   // colleague's invoice
  ['bob (Acme member)',    'delete', 2,  403],   // admin-only operation
  ['anonymous',            'get',    1,  401],
  // ...
];

it.each(MATRIX)('%s %s /invoices/%i → %i', async (caller, method, id, expected) => { /* ... */ });
```

Benefits:
- The matrix **is** the authorization policy in readable form. Reviewers can check it without reading handler code.
- Adding an endpoint or role means adding rows. Missing rows are easy to spot.
- In the lab, every denied write also checks that the database row is unchanged.

### 3. Making tests trustworthy

| Practice | Why |
|---|---|
| **Positive control** for every negative test | Proves the request *would* work for an allowed caller, so a 404 means "denied", not "broken" |
| **Assert on state**, not just status | A handler can change data and still return an error |
| **Mutation testing** | Break a control on purpose and confirm a test fails. If none fails, there's a gap |
| **Real database** in tests | Mocks can't catch a missing `WHERE` clause or an RLS policy problem |
| **Isolated, reset fixtures** | Tests don't depend on order; the lab reloads `schema.sql` before each test |
| **Run files serially** when they share a database | The lab's `vitest.config.js` sets `fileParallelism: false` |

A real example from building this course: in Month 1, a "session expires" test passed only because the
test client never sent the cookie. The positive-control test is what exposed it.

### 4. Mapping to the OWASP API Security Top 10

Fill this in for your own API. Each row should point to a test or say why it doesn't apply.

| OWASP API risk | Covered by |
|---|---|
| API1 Broken Object Level Authorization | authz matrix (other tenant, colleague) |
| API2 Broken Authentication | JWT verifier tests |
| API3 Broken Object Property Level Authorization | strict schemas, output allowlist tests |
| API4 Unrestricted Resource Consumption | body, page size and rate-limit tests |
| API5 Broken Function Level Authorization | member → admin operation rows |
| API6 Unrestricted Access to Sensitive Business Flows | Month 4, Week 15 |
| API7 Server Side Request Forgery | Month 4, Week 13 |
| API8 Security Misconfiguration | headers and error-handling tests (Month 2) |
| API9 Improper Inventory Management | list of endpoints vs. matrix rows |
| API10 Unsafe Consumption of APIs | validate third-party responses like user input |

### 5. Running it in CI

Example GitHub Actions workflow with a PostgreSQL service container (adjust paths for your repo):

```yaml
name: api-security-tests
on: [push, pull_request]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: labpass
          POSTGRES_DB: authz_lab
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s --health-timeout 5s --health-retries 10
    defaults:
      run:
        working-directory: labs/authz
    env:
      ADMIN_DATABASE_URL: postgresql://postgres:labpass@localhost:5432/authz_lab
      DATABASE_URL: postgresql://api_app:api_app_pw@localhost:5432/authz_lab
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx vitest run
```

Notes: `npm ci` needs a committed `package-lock.json`. The credentials are throwaway lab values, so
they're fine in a workflow file; real secrets go in GitHub Secrets (Month 5). Make the job a **required
status check** on your main branch so a failing security test blocks the merge.

---

## 🧪 Lab — Run the matrix and find gaps (3 h)

```bash
cd curriculum/01-beginner/month-03-api-security/labs/authz
npx vitest run    # expect: 2 test files, 28 passed
```

1. Read [`authz-matrix.test.js`](labs/authz/authz-matrix.test.js). Check every row against the policy table in Week 9. Are any combinations missing (e.g. Carol deleting her own invoice)? Add them.
2. Repeat the Week 9 mutation (unscoped `GET`) and note which matrix rows fail. Expected: only *bob → get invoice 1*, because RLS still blocks the cross-tenant rows.
3. Fill in the OWASP API Top 10 mapping table for the three Month 3 labs. Mark gaps.
4. Add a **sensitive data** test: no response from any endpoint contains `pw_hash`, `password` or `token` keys.

---

## 📝 Assignment — Repeatable API security tests

**Task:** create repeatable tests for cross-tenant access, privilege escalation and sensitive-data exposure.

1. Combine the three labs into one API (this becomes the Month project): JWT authentication, the Week 9 policy and RLS, Week 11 validation and limits.
2. Organize tests into folders: `tests/authn`, `tests/authz` (matrix), `tests/input`, `tests/limits`, `tests/data-exposure`.
3. Add a CI workflow that runs the suite against PostgreSQL and is a required check.
4. Record three mutations and the tests that caught them in `TESTING.md`, along with the OWASP mapping table.

### Acceptance criteria
- [ ] Table-driven authorization matrix covering every endpoint × role × ownership case
- [ ] Privilege-escalation tests (member → admin operations, role field in body)
- [ ] Sensitive-data tests on every response
- [ ] CI runs the suite on every push with a real database
- [ ] `TESTING.md` with mutation results and OWASP mapping

---

## 💼 On the job

- AppSec teams often provide shared test helpers (authorization matrix runners, token factories) so product teams can add security tests cheaply.
- Pentest findings get retested by adding a regression test. "Fixed" means a test that fails before the fix and passes after.
- Audits (SOC 2, ISO 27001) ask for evidence that access controls are tested. A matrix in CI is strong evidence.

## ⚠️ Common mistakes

- Only testing the happy path, or only checking status codes.
- Mocking the database in authorization tests.
- Shared fixtures that make tests depend on run order.
- A security test job that isn't a required check, so failures can be merged anyway.

## 🥊 Drill (pass mark 8/10)

**1.** Why use a table-driven matrix for authorization tests?
<details><summary>Answer</summary>It scales across endpoints × roles × ownership, makes the policy readable for reviewers, and makes missing cases easy to spot.</details>

**2.** What is a positive control, and why does every negative test need one?
<details><summary>Answer</summary>A test showing the allowed caller succeeds. Without it, a "denied" result might really be a broken endpoint or a test setup problem.</details>

**3.** Why check the database after a denied write?
<details><summary>Answer</summary>A handler can modify data and still return an error code. Only checking state proves the write was blocked.</details>

**4.** What does mutation testing tell you about a security suite?
<details><summary>Answer</summary>Whether the tests actually detect a broken control. A mutation that no test catches is a gap.</details>

**5.** Why use a real database instead of mocks for authorization tests?
<details><summary>Answer</summary>Authorization often lives in queries and RLS policies. Mocks would hide a missing filter or a misconfigured policy.</details>

**6.** In the lab, why did the unscoped-GET mutation only fail one matrix row?
<details><summary>Answer</summary>RLS still blocked the cross-tenant reads. Only the ownership rule inside a tenant (member reading a colleague's invoice) was left unenforced.</details>

**7.** Name four test categories for an API security suite.
<details><summary>Answer</summary>Any four of: authentication, object-level authorization, function-level authorization, property-level / mass assignment, resource limits, error handling, sensitive-data exposure.</details>

**8.** How do you make sure a failing security test blocks a merge?
<details><summary>Answer</summary>Run it in CI and mark the job as a required status check with branch protection on the main branch.</details>

**9.** Why might test files that share a database fail randomly?
<details><summary>Answer</summary>They run in parallel and reset or modify the same data. Run them serially, or give each file its own database or schema.</details>

**10.** Scenario: a pentest finds a BOLA bug. What does "done" look like?
<details><summary>Answer</summary>A matrix row or test that reproduces the finding fails before the fix and passes after; similar endpoints were checked; the fix is merged with CI green; the pentester retests and confirms.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #7

## 📚 Resources
- OWASP API Security Top 10 — <https://owasp.org/API-Security/>
- OWASP Web Security Testing Guide (authorization testing) — <https://owasp.org/www-project-web-security-testing-guide/>
- Vitest `test.each` — <https://vitest.dev/api/#test-each>
- GitHub Actions service containers — <https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers>

---
[← Week 11](week-11-api-abuse-validation.md) · [Month project →](project.md)
