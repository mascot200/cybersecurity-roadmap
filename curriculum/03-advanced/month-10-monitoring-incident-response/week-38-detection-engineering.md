# Week 38 — Detection Engineering

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #14](https://github.com/mascot200/cybersecurity-roadmap/issues/14)
> **Lab code:** [`labs/detections/`](labs/detections/): four Python rules (8/8 tests passing) and two Sigma rules

## 🎯 Objectives

1. Turn a threat into a detection: data source, logic, threshold, severity, response.
2. Write detections for failed-login patterns, privilege changes and unusual data access.
3. Test detections like code: true positives **and** false positives.
4. Express rules in a portable format (Sigma) and map them to MITRE ATT&CK.
5. Tune noisy rules without losing real signal.

## 🌍 Why it matters

Alerts that fire constantly get ignored, and alerts that never fire might as well not exist. Detection
engineering treats detections as software: written from a threat, tested against known-good and known-bad
data, reviewed, versioned and tuned. That's what makes the difference between "we had logs" and "we caught it".

---

## 📖 Concepts

### 1. From threat to detection

| Step | Example: password spraying |
|---|---|
| Threat | Attacker tries one common password across many accounts (ATT&CK T1110.003) |
| Data source | App login events with `ip`, `user`, `outcome` |
| Logic | One IP fails against ≥ 15 **different** accounts within 10 minutes |
| Severity | High |
| Known false positives | Shared corporate/mobile IPs with users mistyping |
| Response | Block/rate-limit the IP, check for successful logins from it, force reset for any |
| Test | Planted spray in sample data → alert; office IP with 5 users failing → no alert |

### 2. The lab's rules

[`detections.py`](labs/detections/detections.py) runs four rules over [`events.jsonl`](labs/detections/events.jsonl)
(633 synthetic events: normal traffic with occasional typos, plus four planted incidents):

| Rule | Logic | Severity |
|---|---|---|
| `brute_force` | ≥ 10 failures for **one account** in 5 min | high if a success follows within 5 min, else medium |
| `password_spraying` | One IP failing against ≥ 15 **different accounts** in 10 min | high |
| `privilege_change` | Role set to `admin` | **critical** if the actor isn't an admin, low otherwise |
| `unusual_export` | One user exports > 10,000 records within an hour | high |

Real output:

```text
[HIGH    ] brute_force        10 failed logins for user7@acme.test within 0:05:00; followed by a SUCCESS - possible account takeover
[HIGH    ] password_spraying  192.0.2.200 failed logins against 25 different accounts within 0:10:00
[CRITICAL] privilege_change   user12@acme.test (member) set user12@acme.test member -> admin - actor is NOT an admin
[LOW     ] privilege_change   admin1@acme.test (admin) set user3@acme.test member -> admin - expected admin action, review
[HIGH    ] unusual_export     user22@acme.test exported 15000 records within 1:00:00
```

**Tests** ([`test_detections.py`](labs/detections/test_detections.py)) check that exactly the five planted
alerts appear (none from the ~5% of normal logins that fail), that every alert carries evidence
(`request_id`s), and six false-positive cases: occasional typos, slow failures spread over hours, a shared
office IP with few accounts, normal exports, and the severity downgrades.

Notice how context changes severity: brute force **followed by success**, and a role change by a
**non-admin**, are far more urgent than the same events without that context.

### 3. Sigma: a portable format

[Sigma](https://github.com/SigmaHQ/sigma) rules describe detections in YAML that can be converted to many SIEM
query languages. The lab includes
[`app_privilege_escalation_by_non_admin.yml`](labs/detections/sigma/app_privilege_escalation_by_non_admin.yml)
and [`app_password_spraying.yml`](labs/detections/sigma/app_password_spraying.yml), with ATT&CK tags, known
false positives and levels. Threshold logic (distinct accounts per IP over time) goes in a Sigma
**correlation rule** or the SIEM itself.

### 4. Tuning without going blind

| Problem | Better than "turn it off" |
|---|---|
| Too many alerts from one known source | Allowlist that specific source with an expiry and owner |
| Threshold fires on normal peaks | Base thresholds on measured baselines (e.g. 99th percentile) |
| Alert lacks context | Enrich: user role, recent successes, geo/ASN, asset owner |
| Many alerts per incident | Group by entity and time window |

Track for each rule: alerts per week, true-positive rate, and time to triage.

---

## 🧪 Lab — Write, test, tune (4 h)

```bash
cd curriculum/03-advanced/month-10-monitoring-incident-response/labs/detections
python3 -m unittest -v          # 8 tests
python3 detections.py events.jsonl
```

1. Read each rule and its tests. Lower `password_spraying`'s threshold to 5 and rerun: do false positives appear in the normal traffic? Restore it.
2. **New rule:** "authorization denials": one user getting ≥ 20 `403/404` on other tenants' resources in 5 minutes (probing for BOLA, Month 3). Add synthetic events to a test file, write the rule, and write a true-positive test and a false-positive test.
3. **New rule:** "login from a new country followed by an export within 30 minutes" (add a `country` field to your synthetic events).
4. Write the Sigma version of one new rule.
5. Implement two of the rules in your Week 37 stack (Grafana alert rules on LogQL, or OpenSearch alerting) and route them to a test channel. Trigger them with synthetic events.

---

## 📝 Assignment — Detection rules with simulated events

**Task:** create and test a few detection rules using simulated events.

`DETECTIONS.md`: for each rule (at least four), the threat and ATT&CK technique, data source, logic,
severity, known false positives, response steps, and test cases. Include the alert screenshots from your stack.

### Acceptance criteria
- [ ] ≥ 4 rules, at least 2 of them yours
- [ ] Each rule has true-positive and false-positive tests
- [ ] At least one Sigma rule
- [ ] Two rules running in your log stack and routed to a channel
- [ ] Each alert includes evidence and a suggested response

---

## 💼 On the job

- Detection engineers keep rules in git ("detections as code") with CI that runs their tests.
- Coverage is often mapped against MITRE ATT&CK to find gaps.

## ⚠️ Common mistakes

- Writing rules without test data, then discovering in production that they never fire (or always fire).
- Alerts with no context or next step.
- Disabling a noisy rule instead of tuning it.
- Ignoring "low" signals that matter in combination (failures followed by success).

## 🥊 Drill (pass mark 8/10)

**1.** What's the difference between brute force and password spraying in detection logic?
<details><summary>Answer</summary>Brute force: many failures for one account. Spraying: one source failing across many accounts (few attempts each).</details>

**2.** Why does "failures followed by a success" raise severity?
<details><summary>Answer</summary>It suggests the attacker guessed the password, so the account may be taken over.</details>

**3.** Why test for false positives?
<details><summary>Answer</summary>Noisy rules get ignored; tests prove normal behaviour doesn't alert.</details>

**4.** What is Sigma?
<details><summary>Answer</summary>A generic, YAML-based format for detection rules that can be converted to many SIEM query languages.</details>

**5.** What should every alert contain?
<details><summary>Answer</summary>What happened, the entity, severity, evidence (event IDs), and suggested response steps.</details>

**6.** What ATT&CK technique is password spraying?
<details><summary>Answer</summary>T1110.003 (Brute Force: Password Spraying).</details>

**7.** Name two ways to tune a noisy rule without disabling it.
<details><summary>Answer</summary>Any two of: scoped allowlists with owner and expiry, baseline-based thresholds, enrichment, grouping by entity/time.</details>

**8.** Why is a role change by a non-admin critical?
<details><summary>Answer</summary>It shouldn't be possible; it indicates broken authorization or account misuse (privilege escalation).</details>

**9.** What metrics show a rule is healthy?
<details><summary>Answer</summary>Alert volume, true-positive rate, and time to triage.</details>

**10.** Scenario: the spraying rule fires on your company's VPN egress IP every Monday morning. What do you do?
<details><summary>Answer</summary>Confirm it's benign, then tune: raise the threshold or require more distinct accounts for that known IP, or add context (only alert if any login from it then succeeds unusually). Record the exception with an owner and expiry; don't disable the rule.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #14

## 📚 Resources
- MITRE ATT&CK — <https://attack.mitre.org/>
- Sigma — <https://github.com/SigmaHQ/sigma>
- Palantir Alerting and Detection Strategy framework — <https://github.com/palantir/alerting-detection-strategy-framework>

---
[← Week 37](week-37-logging-observability.md) · [Next: Week 39 — Incident response →](week-39-incident-response.md)
