# Portfolio Requirements

Employers hiring for AppSec / Cloud Security want **evidence**: "show me something you secured and how
you know it's secure." Each project below becomes a public repo (or folder) in your portfolio.

## Every project README must contain

1. **Problem** — what the system does and what you were protecting.
2. **Architecture diagram** with trust boundaries.
3. **Threat model** — top threats and how each is mitigated.
4. **Setup** — how someone else can run it locally in < 10 minutes.
5. **Test method** — which tools/tests, and how to run them.
6. **Results** — evidence: test output, scan summaries, screenshots.
7. **Remediation** — what you fixed and why that fix works.
8. **Limitations** — what is *not* covered. (This shows maturity, not weakness.)

## The eight projects

| # | Project | Month | Evidence to publish |
|---|---|---|---|
| 1 | Linux hardening | 1 (+6) | Hardening checklist, configuration scripts, verification notes |
| 2 | API security lab | 3 | Multi-tenant API, role boundaries, automated regression tests, fixes |
| 3 | Secure API template | 5 | Secure defaults, code scanning, dependency checks, CI security gates |
| 4 | Hardened container deployment | 6 | Docker hardening, private DB, image scanning, network controls |
| 5 | Secure cloud/IaC pipeline | 8 | Terraform, least privilege, secret handling, policy checks, teardown |
| 6 | Monitoring & incident response | 10 | Detection rules, simulated incident, response report |
| 7 | End-to-end assessment | 11 | Threat model, scope, findings, severity, remediation, retest |
| 8 | Capstone platform | 12 | Integrated secure app + cloud deployment with evidence |

## Publishing safely

- Sanitize: no real IPs, account IDs, hostnames, tokens, names or emails of real people.
- Never publish a *working* exploit against a real third-party product that isn't already public/patched.
- Vulnerable-by-design code must say so clearly at the top of the README and must default to `127.0.0.1`.
- Run `gitleaks detect` on the repo before making it public.

## Quality bar (self-review before publishing)

- [ ] A stranger can run it from the README alone
- [ ] Tests pass in CI (badge in README)
- [ ] Diagrams render on GitHub
- [ ] Every claim ("users cannot access other tenants' data") has a test or evidence link
- [ ] Limitations section exists
