# Month 2 Project — `web-security-labs`

> Builds on Weeks 5–8 · ~6 h beyond the weekly assignments · Feeds portfolio project #2

## Goal

Collect this month's labs into one repository that shows you can **explain a vulnerability, fix its
root cause and prove the fix with a test**. Someone reading it should come away knowing how to write
safe code. It is not a collection of attacks.

## Requirements

1. **One folder per topic.** Use at least six, chosen from: misconfiguration, SQL injection, reflected XSS,
   stored XSS, DOM XSS, CSRF, CORS, login throttling, password reset.
2. **Each folder contains:**
   - `README.md`: root cause in one sentence, the fix, *why* the fix works, and the test that proves it
   - the vulnerable and fixed versions of the code (reuse your weekly lab code)
   - a test suite that **fails on the vulnerable version and passes on the fixed one**
3. **Safe by default.** Every server binds to `127.0.0.1`. The top-level README says the vulnerable
   code is for local training only and must never be deployed.
4. **One command runs everything.** `npm test` at the root runs every folder's fixed-version tests.
5. **CI.** A GitHub Actions workflow runs `npm test` on every push. Add the badge to the README.

## Top-level README

- What the repo is for, and the safety warning
- A table: *topic → root cause → fix → test name → folder*
- How to run the tests locally
- Limitations: what isn't covered yet (APIs and authorization arrive in Month 3)

## Acceptance criteria

- [ ] ≥ 6 topic folders, each with README, vulnerable code, fixed code and tests
- [ ] For each topic, evidence that tests fail on vulnerable code and pass on fixed code (pasted output)
- [ ] All servers bind to `127.0.0.1`; safety warning present
- [ ] CI is green on the fixed versions
- [ ] `gitleaks detect` run before making the repo public; no secrets committed

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Coverage | < 4 topics | 4–5 | ≥ 6 |
| Proof | no tests | tests on fixed code only | fail-before / pass-after evidence |
| Explanation | missing | what | what + why |
| Safety | missing | partial | localhost-only + warning + no secrets |
| Usability | can't run | runs with effort | one command + CI badge |
