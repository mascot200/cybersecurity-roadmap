# Month 10 Drill — Monitoring and Incident Response

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #14](https://github.com/mascot200/cybersecurity-roadmap/issues/14).
> Interactive version: ask Claude *"Drill me on Month 10 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What is a correlation ID for?
<details><summary>Answer</summary>Linking all log events for one request across services.</details>

**A2.** Brute force vs password spraying in one line each?
<details><summary>Answer</summary>Brute force: many guesses against one account. Spraying: one source, few guesses each against many accounts.</details>

**A3.** What is Sigma?
<details><summary>Answer</summary>A portable YAML format for detection rules, convertible to SIEM queries.</details>

**A4.** First phase of incident response?
<details><summary>Answer</summary>Preparation.</details>

**A5.** Define RTO.
<details><summary>Answer</summary>Maximum acceptable time to restore service.</details>

**A6.** What makes a backup immutable in AWS?
<details><summary>Answer</summary>S3 Object Lock (compliance mode) or AWS Backup Vault Lock.</details>

**A7.** Why alert when a log source goes quiet?
<details><summary>Answer</summary>A broken or disabled pipeline looks the same as "no attacks".</details>

## Part B — Review it (2 points each: 1 problem, 1 fix)

**B1.** `logger.info('login', { email, password, ip })`
<details><summary>Answer</summary>Logs the password. Fix: never log credentials; central redaction with a test.</details>

**B2.** A detection: "alert on every failed login".
<details><summary>Answer</summary>Far too noisy: typos happen all the time, so it gets ignored. Fix: thresholds per account and per source, with context (success after failures), tested for false positives.</details>

**B3.** Incident notes: "Rotated the key, then checked CloudTrail. Rebuilt the instance to be safe."
<details><summary>Answer</summary>The order is okay for the key, but rebuilding destroyed evidence before it was preserved, and there are no timestamps. Fix: preserve (snapshot, log export, hashes) before rebuilding; record times.</details>

**B4.** Nightly `pg_dump` to the same server's disk; restores never tested.
<details><summary>Answer</summary>Same failure domain (lost with the server or attacker), and the restore is unproven. Fix: off-host/off-account copies, immutability, checksums, scheduled restore verification.</details>

**B5.** Post-incident review: "Root cause: Bob committed the key. Action: Bob to be more careful."
<details><summary>Answer</summary>Blames a person; no systemic fix. Fix: ask why the system allowed it (no push protection, long-lived keys) and act on that (secret scanning + push protection, OIDC, pre-commit hooks), with owners and dates.</details>

**B6.** Logs stored only on each host, timestamps in local time.
<details><summary>Answer</summary>Attackers can edit them; correlation across hosts is error-prone. Fix: ship to a central store quickly; UTC with NTP.</details>

## Part C — Scenarios (2 points each)

**C1.** An alert says: 12 failed logins for a customer admin, then success from a new country, then a 40,000-record export. Your first five actions?
<details><summary>Answer</summary>Open an incident and assign roles; disable the account and invalidate its sessions; preserve the relevant logs; scope what the session did (exports, admin actions, tokens); notify the customer/legal per process. Then hunt for persistence and plan recovery.</details>

**C2.** Your restore drill took 4 hours but your RTO target is 1 hour. What now?
<details><summary>Answer</summary>Record the gap; find the bottlenecks (data size, manual steps, approvals); automate and parallelize, consider PITR or warm standby; rerun the drill; or renegotiate the target with the business if the cost is unjustified.</details>

**C3.** How would you show that your detections actually work?
<details><summary>Answer</summary>Tests with true- and false-positive data in CI, plus controlled harmless triggers in the live stack and evidence the alert reached the channel in the expected time (Week 36 style).</details>

## Month 9 review (bonus, 1 point each)

**R1.** What does PSA "restricted" reject?
<details><summary>Answer</summary>Privileged pods, host namespaces/paths, root users, privilege escalation, missing seccomp, added capabilities, etc.</details>

**R2.** How do you validate a preventive control?
<details><summary>Answer</summary>A negative test that the forbidden action fails.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
