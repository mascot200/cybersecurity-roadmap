# Week 18 — SAST and Dependency Analysis

> **Level:** Intermediate · **Time:** ~10 h · **Tracking:** [issue #9](https://github.com/mascot200/cybersecurity-roadmap/issues/9)
> **Lab files:** [`labs/semgrep-rules/`](labs/semgrep-rules/): 6 custom rules with annotated test cases

## 🎯 Objectives

1. Run static analysis (Semgrep), dependency scanning (npm audit, OSV-Scanner) and secret scanning (Gitleaks) on a codebase.
2. Write and test custom Semgrep rules that encode lessons from earlier months.
3. Triage findings: true positive, false positive, or accepted risk, with a written reason.
4. Explain reachability, severity and fix availability when prioritizing dependency advisories.

## 🌍 Why it matters

Most code in a modern app is someone else's: a typical Node.js service pulls in hundreds of packages.
Known-vulnerable dependencies are a leading cause of breaches. **Equifax (2017)** was breached through
an Apache Struts vulnerability for which a patch had been available for about two months. Automated
scanning in every build makes "we didn't know" much less likely. Static analysis does the same for
your own code's risky patterns.

---

## 📖 Concepts

### 1. Tool categories

| Category | Finds | Example tools | Weak at |
|---|---|---|---|
| **SAST** (static application security testing) | Risky code patterns in your source | Semgrep, CodeQL, ESLint security plugins | Missing checks, business logic; false positives |
| **SCA** (software composition analysis) | Known vulnerabilities in dependencies | npm audit, OSV-Scanner, Dependabot, Snyk, OWASP Dependency-Check | Unknown (0-day) or unpublished issues |
| **Secret scanning** | Keys, tokens, passwords in code and history | Gitleaks, GitHub secret scanning + push protection, TruffleHog | Custom secret formats |
| **DAST** (dynamic) | Issues in a running app | OWASP ZAP | Coverage of authenticated and complex flows |

### 2. Semgrep in practice

```bash
pipx install semgrep
semgrep scan --config p/javascript .                 # community JavaScript rules
semgrep scan --config labs/semgrep-rules/ .          # your custom rules
semgrep --test labs/semgrep-rules/                   # run the rule tests
```

Custom rules turn your review findings into automatic checks. The lab's
[`express-security.yaml`](labs/semgrep-rules/express-security.yaml) encodes six lessons from Months 1–3:

| Rule | Catches | Lesson |
|---|---|---|
| `sql-built-from-template-literal` | SQL text built with `${}` or `+` | M2 W6 |
| `request-body-assigned-to-model` | `Object.assign(x, req.body)` | M3 W11 |
| `jwt-decoded-without-verification` | `jwt.decode(...)` | M3 W10 |
| `session-cookie-without-httponly` | `res.cookie(...)` missing `httpOnly: true` | M1 W4 |
| `cors-allows-any-origin-with-credentials` | `cors({ origin: true, credentials: true })` | M2 W7 |
| `shell-command-from-template-literal` | `exec(` with `${}` | M2 W6 |

**Rule tests:** [`express-security.js`](labs/semgrep-rules/express-security.js) has a `// ruleid: <id>` comment
above each line that must be flagged and `// ok: <id>` above each line that must not be.
`semgrep --test` reports any mismatch.

> ⚠️ **Not yet run.** These rules follow Semgrep's documented syntax and every rule has test cases (checked
> by script), but Semgrep couldn't be installed in the environment where this course was written. Running
> `semgrep --test labs/semgrep-rules/` is the first lab step. If a rule fails its tests, fixing it is part
> of the exercise: the [Semgrep playground](https://semgrep.dev/playground) helps.

### 3. Dependency scanning

```bash
npm audit --omit=dev                 # advisories for production dependencies
npm audit --omit=dev --json > audit.json
osv-scanner scan source -r .         # OSV-Scanner v2: finds lockfiles recursively; uses the OSV database
```

**Prioritizing an advisory:**

| Question | Why it matters |
|---|---|
| Is it a **production** dependency? | Dev-only tools usually aren't deployed |
| Is the vulnerable function **reachable** from your code? | Many advisories affect features you don't use |
| What's the **severity**, and is it **known exploited** (CISA KEV) or likely (EPSS score)? | Real-world exploitation raises urgency |
| Is a **fixed version** available? Breaking change? | Determines effort |
| Is there a **workaround**? | Buys time if upgrading is hard |

**Supply-chain hygiene:** commit `package-lock.json`, use `npm ci` in CI, consider
`--ignore-scripts` (install scripts run arbitrary code), review new dependencies before adding them,
and enable Dependabot or Renovate for updates.

### 4. Secret scanning

```bash
gitleaks git --redact .      # scan the full git history of the current repo
gitleaks dir --redact .      # scan files on disk
```

If a secret is found: **revoke and rotate it first**, then check logs for use, then clean history.
Deleting the commit doesn't make it safe, because clones, forks and caches keep it. Enable GitHub
secret scanning with **push protection** so secrets are blocked before they're pushed.

### 5. Triage

Every finding gets a decision and a reason:

| Decision | When | Record |
|---|---|---|
| **Fix** | True positive | Link to the fix PR and regression test |
| **False positive** | The pattern matched but it's safe | Why it's safe; suppress inline with a reason (`// nosemgrep: rule-id — reason`) |
| **Accept risk** | Real but low impact, or fix not possible yet | Owner, reason, review date |

A scanner whose findings aren't triaged gets ignored. Keep the noise down by tuning rules and
suppressing with reasons, never by turning the scanner off.

---

## 🧪 Lab — Scan, test rules, triage (4 h)

1. Install Semgrep, OSV-Scanner and Gitleaks (see [lab setup](../../../docs/lab-setup.md#step-7--security-tools-installed-as-needed-per-month)).
2. Run `semgrep --test labs/semgrep-rules/`. Fix any rule that fails its tests and note what you changed.
3. Run the custom rules and `p/javascript` against your Months 2–4 code (including any intentionally vulnerable versions you kept locally). Do the custom rules catch the bugs you fixed earlier?
4. Run `npm audit` and `osv-scanner` on your Month 3 project. Triage every finding using the table above.
5. Run `gitleaks git` on your journal repo. If it finds anything, follow the response steps.
6. **Write one new rule** from a finding in your Week 17 review, with `ruleid` and `ok` test cases.

---

## 📝 Assignment — Run scanners and triage

**Task:** run a supported code scanner and dependency checker; triage findings.

Produce `SCANNING.md` for your Month 3 project with:
- tools, versions and commands used
- a triage table: finding, tool, decision (fix / false positive / accepted), reason, link
- your custom rules and their test results
- what the tools **didn't** cover (compare with your Week 17 manual review)

### Acceptance criteria
- [ ] Semgrep (community + custom rules), npm audit/OSV-Scanner and Gitleaks all run
- [ ] Every finding triaged with a reason
- [ ] `semgrep --test` passes for all custom rules, including one you wrote
- [ ] Comparison of automated vs manual findings

---

## 💼 On the job

- AppSec teams tune SAST rule sets per language and maintain custom rules for company-specific patterns.
- Dependency triage is a weekly task in most teams; reachability and exploitation data keep it manageable.
- Secret leaks are among the most common incidents, and responding quickly (rotate first) matters most.

## ⚠️ Common mistakes

- Treating scanner output as the security review.
- "Fixing" noise by disabling the scanner.
- Suppressing findings without a written reason.
- Deleting a leaked secret from git instead of rotating it.
- Upgrading dependencies without running tests.

## 🥊 Drill (pass mark 8/10)

**1.** SAST vs SCA in one sentence each?
<details><summary>Answer</summary>SAST analyzes your own source code for risky patterns; SCA finds known vulnerabilities in third-party dependencies.</details>

**2.** What can't SAST find well?
<details><summary>Answer</summary>Missing checks and business-logic flaws (e.g. absent authorization), because it doesn't know the intended rules.</details>

**3.** What's the first thing to do when a secret is found in git history?
<details><summary>Answer</summary>Revoke and rotate it. Then check for misuse and clean up history.</details>

**4.** Why use `npm ci` instead of `npm install` in CI?
<details><summary>Answer</summary>It installs exactly what's in the lockfile, fails if the lockfile and package.json disagree, and gives reproducible builds.</details>

**5.** What does `--ignore-scripts` protect against?
<details><summary>Answer</summary>Packages running install scripts (arbitrary code) during installation, a common supply-chain attack path.</details>

**6.** Name three factors for prioritizing a dependency advisory.
<details><summary>Answer</summary>Any three of: production vs dev dependency, reachability, severity, known exploitation (KEV) / EPSS, fix availability, workaround.</details>

**7.** How does a Semgrep rule test file mark expected results?
<details><summary>Answer</summary><code>// ruleid: &lt;id&gt;</code> above lines that must match and <code>// ok: &lt;id&gt;</code> above lines that must not.</details>

**8.** How should a false positive be suppressed?
<details><summary>Answer</summary>Inline, scoped to the specific rule, with a written reason (e.g. <code>// nosemgrep: rule-id — value comes from a constant allowlist</code>).</details>

**9.** What's push protection?
<details><summary>Answer</summary>GitHub blocks a push that contains a detected secret, before it reaches the repository.</details>

**10.** Scenario: npm audit shows a critical advisory in a package used only by your test runner. What do you do?
<details><summary>Answer</summary>Lower priority than production issues (not deployed), but still upgrade when practical, and record the triage decision. Use <code>--omit=dev</code> for the blocking CI gate.</details>

## ✅ Checklist
- [ ] Lab steps 1–6
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #9

## 📚 Resources
- Semgrep docs: writing rules and testing rules — <https://semgrep.dev/docs/writing-rules/overview> · <https://semgrep.dev/docs/writing-rules/testing-rules>
- OSV-Scanner — <https://google.github.io/osv-scanner/>
- Gitleaks — <https://github.com/gitleaks/gitleaks>
- OWASP Dependency-Check — <https://owasp.org/projects/Dependency-Check>
- GitHub security features — <https://docs.github.com/en/code-security/getting-started/github-security-features>
- CISA Known Exploited Vulnerabilities — <https://www.cisa.gov/known-exploited-vulnerabilities-catalog>

---
[← Week 17](week-17-secure-code-review.md) · [Next: Week 19 — Threat modeling →](week-19-threat-modeling.md)
