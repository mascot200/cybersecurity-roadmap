# Month 5 — Secure Software Development and AppSec Automation

> 🔵 **Level 2 · Intermediate** · Weeks 17–20 · ~40 h · Tracking issue: [#9](https://github.com/mascot200/cybersecurity-roadmap/issues/9)

**Goal:** integrate security into code review, development and delivery.

Level 1 taught you how individual weaknesses work and how to fix them. Level 2 is about making
fixes stick: catching problems in review, encoding them as automated rules, designing them out with
threat models, and stopping them at the pipeline.

![Secure SDLC](images/secure-sdlc.svg)

## Weekly plan

| Week | Lesson | You will build / prove | Est. time |
|---|---|---|---|
| 17 | [Secure code review](week-17-secure-code-review.md) | Endpoint inventory, `REVIEW.md` with ≥ 8 findings | 10 h |
| 18 | [SAST and dependency analysis](week-18-sast-dependency-analysis.md) | Semgrep custom rules with tests, triaged scan results | 10 h |
| 19 | [Threat modeling](week-19-threat-modeling.md) | DFD + STRIDE per element, mitigations tracked as issues | 10 h |
| 20 | [Secure CI/CD](week-20-secure-ci-cd.md) | Security workflow, documented gates, hardened pipeline | 10 h |
| — | [Month project](project.md) | **Project 2: secure Node.js API template** | woven into weeks |
| — | [Monthly drill](drill.md) | ≥ 80% | 45 min |

## Lab files

| File | Status |
|---|---|
| [`labs/semgrep-rules/`](labs/semgrep-rules/) | 6 rules + annotated tests. YAML validated and every rule has test cases; **`semgrep --test` not yet run** (Semgrep couldn't be installed where this was written). Running it is Week 18's first step. |
| [`labs/ci/security.yml`](labs/ci/security.yml) | 5-job workflow. YAML validated; **not yet run on GitHub Actions**. Getting it green is Week 20's lab. |

## Milestone (must demonstrate before Month 6)

- [ ] A code change triggers security checks automatically
- [ ] You can triage scanner findings and justify each decision
- [ ] Your project has a current threat model with tracked mitigations

## Recommended resources

- **GitHub security features** — <https://docs.github.com/en/code-security/getting-started/github-security-features>
- **OWASP Dependency-Check** — <https://owasp.org/projects/Dependency-Check>
- **Microsoft Security Development Lifecycle** — <https://learn.microsoft.com/en-us/compliance/assurance/assurance-microsoft-security-development-lifecycle>

---
[← Course home](../../../README.md) · [Start Week 17 →](week-17-secure-code-review.md)
