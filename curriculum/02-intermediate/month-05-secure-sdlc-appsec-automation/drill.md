# Month 5 Drill — Secure SDLC and AppSec Automation

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #9](https://github.com/mascot200/cybersecurity-roadmap/issues/9).
> Interactive version: ask Claude *"Drill me on Month 5 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What does SCA stand for and what does it find?
<details><summary>Answer</summary>Software Composition Analysis: known vulnerabilities (and licenses) in third-party dependencies.</details>

**A2.** Which `npm audit` flag excludes dev dependencies?
<details><summary>Answer</summary><code>--omit=dev</code>.</details>

**A3.** What are the STRIDE categories that apply to a data flow?
<details><summary>Answer</summary>Tampering, Information disclosure, Denial of service.</details>

**A4.** What GitHub feature blocks secrets before they're pushed?
<details><summary>Answer</summary>Secret scanning push protection.</details>

**A5.** What should every security exception include?
<details><summary>Answer</summary>Owner, justification, expiry/review date.</details>

**A6.** What's the safest way to reference a third-party GitHub Action?
<details><summary>Answer</summary>By full commit SHA (with the version in a comment), updated by Dependabot.</details>

**A7.** How do Semgrep rule tests mark expected matches?
<details><summary>Answer</summary><code>// ruleid: &lt;id&gt;</code> for lines that must match, <code>// ok: &lt;id&gt;</code> for lines that must not.</details>

## Part B — Review it (2 points each: 1 problem, 1 fix)

**B1.**
```yaml
on: pull_request_target
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: npm ci && npm test
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
<details><summary>Answer</summary>Untrusted fork code runs with repository secrets (and a write token). Fix: use <code>pull_request</code> for building PR code; keep secrets out of jobs that run untrusted code.</details>

**B2.**
```yaml
- run: ./deploy.sh "${{ github.head_ref }}"
```
<details><summary>Answer</summary>Script injection through an attacker-chosen branch name. Fix: pass it through <code>env:</code> and quote the variable in the script.</details>

**B3.**
```yaml
permissions: write-all
```
<details><summary>Answer</summary>Every job gets a token that can write to the repo, packages and more. Fix: <code>permissions: contents: read</code> at the top and narrow grants per job.</details>

**B4.** A finding suppressed with `// nosemgrep`.
<details><summary>Answer</summary>No rule ID and no reason, so it hides every rule on that line and nobody can review the decision. Fix: <code>// nosemgrep: rule-id — reason</code>, and review suppressions.</details>

**B5.** A teammate removes a leaked API key from the latest commit and says it's fixed.
<details><summary>Answer</summary>The key is still in history, forks and caches, and may already be used. Fix: revoke and rotate the key first, check logs for misuse, then clean history.</details>

**B6.** CI runs `npm install` with a lockfile that isn't committed.
<details><summary>Answer</summary>Builds aren't reproducible and can pull new (possibly malicious) versions. Fix: commit <code>package-lock.json</code>, use <code>npm ci</code> (with <code>--ignore-scripts</code> where possible).</details>

## Part C — Scenarios (2 points each)

**C1.** Your SAST tool produces 400 findings on day one and the team wants to turn it off. What do you propose?
<details><summary>Answer</summary>Block only new findings in PRs; tune or disable noisy rules; triage the backlog by severity with owners and deadlines; add custom rules for patterns you actually care about.</details>

**C2.** A design adds a payment provider callback endpoint. Name the threat and the requirement.
<details><summary>Answer</summary>Spoofing of the provider (forged callbacks). Requirement: verify the callback's signature with the shared secret, check a timestamp to reject replays, and process each event idempotently, with tests.</details>

**C3.** How do you show an auditor that security checks run on every change?
<details><summary>Answer</summary>Branch protection with required security checks, workflow files in the repo, run history, examples of blocked PRs, and the documented gate policy with exceptions.</details>

## Month 3–4 review (bonus, 1 point each)

**R1.** Where must the tenant ID in a query come from?
<details><summary>Answer</summary>The verified identity on the server.</details>

**R2.** What does pinning the resolved IP defeat in SSRF defense?
<details><summary>Answer</summary>DNS rebinding.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
