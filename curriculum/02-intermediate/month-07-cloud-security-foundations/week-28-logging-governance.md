# Week 28 — Logging and Governance

> **Level:** Intermediate · **Time:** ~10 h · **Tracking:** [issue #11](https://github.com/mascot200/cybersecurity-roadmap/issues/11)

## 🎯 Objectives

1. Enable CloudTrail across all regions with logs protected from tampering.
2. Read CloudTrail events: who did what, when, from where, with which credentials.
3. Set up baseline detection: GuardDuty, alerts for root use, IAM changes and logging changes.
4. Use posture tools (AWS Config, Security Hub) and guardrails (SCPs) for governance.
5. Investigate a simulated identity event from the logs.

## 🌍 Why it matters

When something goes wrong in a cloud account, CloudTrail is how you answer "what happened?". Without it,
you can't tell which data a leaked key accessed, so you may have to assume the worst. Attackers know this:
disabling or deleting logs is one of the first things they try, which is why logs should go to a separate
account that production credentials can't touch.

---

## 📖 Concepts

### 1. What gets logged

| Source | Records | Enable |
|---|---|---|
| **CloudTrail management events** | Control-plane API calls (IAM changes, creating instances, changing SGs) | Organization trail, all regions |
| **CloudTrail data events** | Data-plane calls (S3 GetObject, Lambda Invoke) | Selectively: sensitive buckets (costs more) |
| **VPC flow logs** | Network connections | Per VPC (Week 26) |
| **S3 / load balancer access logs** | Requests to buckets and load balancers | Per resource |
| **App logs** | Your application's events | Month 10 |

### 2. Reading a CloudTrail event

Key fields:

| Field | Tells you |
|---|---|
| `eventTime`, `eventName`, `eventSource` | What API call, when |
| `userIdentity` (`type`, `arn`, `accessKeyId`, `sessionContext`) | Which identity, and for roles, which session and who assumed it |
| `sourceIPAddress`, `userAgent` | From where, with what tool |
| `requestParameters`, `responseElements` | What was asked for and what happened |
| `errorCode` (e.g. `AccessDenied`) | Failed attempts, often the first sign of an attacker exploring |

Investigation questions: which credential? since when? what did it call (successes **and** failures)? from
which IPs? did it create anything that persists (users, keys, roles, policies, instances)?

### 3. Protecting logs

- **Organization trail** to an S3 bucket in a dedicated **log archive account**.
- Bucket: versioning, Object Lock (or at least deny delete), SSE-KMS, access only for the security team.
- **Log file validation** enabled (detects modified or deleted log files).
- SCP denying `cloudtrail:StopLogging`, `cloudtrail:DeleteTrail`, `cloudtrail:UpdateTrail` for everyone except a break-glass role.

### 4. Baseline detection and governance

| Tool | Gives you |
|---|---|
| **GuardDuty** | Managed threat detection from CloudTrail, flow logs, DNS (e.g. credentials used from unusual places, crypto-mining) |
| **CloudWatch / EventBridge alarms** | Alerts on specific events: root login, IAM policy changes, CloudTrail changes, security group changes |
| **AWS Config** | Resource configuration history and rules (e.g. "S3 buckets not public", "RDS encrypted") |
| **Security Hub** | Aggregated findings and checks against CIS / AWS Foundational Security Best Practices |
| **Service control policies (SCPs)** | Account-wide guardrails: deny unused regions, protect logging, deny leaving the organization |
| **Budgets** | Cost alarms, which also catch abuse like cryptomining |

Example EventBridge pattern for root user activity:

```json
{
  "detail-type": ["AWS API Call via CloudTrail", "AWS Console Sign In via CloudTrail"],
  "detail": { "userIdentity": { "type": ["Root"] } }
}
```

---

## 🧪 Lab — Turn on the lights and investigate (3–4 h, AWS)

1. Create a CloudTrail trail for all regions, writing to a dedicated, encrypted, versioned bucket with log file validation on.
2. Enable GuardDuty (30-day free trial) and review sample findings (*Settings → Generate sample findings*).
3. Create an EventBridge rule with the root-activity pattern above, sending to an SNS email topic. Sign in as root once (with MFA) and confirm the alert.
4. **Simulated identity event:** create a test IAM user with a test access key and a narrow policy (read one bucket). From the CLI, use the key to list the bucket (allowed), then try `iam:ListUsers` and `s3:ListAllMyBuckets` (denied). Then delete the key and user.
5. **Investigate it** in CloudTrail Event history (or Athena on the trail bucket): find every call made with that access key ID, the source IP, user agent, which calls failed, and when the key was created and deleted.
6. Turn on AWS Config with a couple of managed rules (e.g. `s3-bucket-public-read-prohibited`, `rds-instance-public-access-check`) and check compliance.
7. Disable or delete anything with ongoing cost you don't need (Config recorders, GuardDuty after the trial if you won't use it).

---

## 📝 Assignment — Audit logging and a simulated identity event

**Task:** enable audit logging and investigate a simulated identity event.

`LOGGING.md` with: what's logged and where; how logs are protected; the alerts you configured; and an
**investigation write-up** of lab step 4–5: a timeline table (time, identity, action, result, source IP),
conclusions, and what you'd do if this had been a real leaked key.

### Acceptance criteria
- [ ] Multi-region trail to a protected bucket with log validation
- [ ] GuardDuty enabled; root-activity alert tested
- [ ] Investigation timeline from CloudTrail, including denied calls
- [ ] Config rules evaluated
- [ ] Costs checked; unneeded services disabled

---

## 💼 On the job

- Cloud incident response starts with CloudTrail queries, often with Athena or a SIEM.
- Security teams own the logging account and the SCPs that keep it intact.

## ⚠️ Common mistakes

- CloudTrail only in one region (attackers use the others).
- Logs in the same account, deletable by the same admins.
- Alerts that go to an unmonitored inbox.
- Ignoring `AccessDenied` events, which are often the earliest sign of misuse.

## 🥊 Drill (pass mark 8/10)

**1.** Management events vs data events?
<details><summary>Answer</summary>Management events are control-plane operations (configuring resources, IAM changes); data events are operations on data (S3 object reads/writes, Lambda invocations).</details>

**2.** Why send CloudTrail to a separate account?
<details><summary>Answer</summary>So compromised production credentials can't delete or alter the logs.</details>

**3.** What does log file validation detect?
<details><summary>Answer</summary>Whether delivered log files were modified or deleted after CloudTrail wrote them.</details>

**4.** Which CloudTrail field shows who assumed a role for a session?
<details><summary>Answer</summary><code>userIdentity.sessionContext.sessionIssuer</code> (plus the session name in the ARN).</details>

**5.** Why care about `AccessDenied` events?
<details><summary>Answer</summary>They often show an attacker testing what stolen credentials can do, before anything succeeds.</details>

**6.** What does GuardDuty use as input?
<details><summary>Answer</summary>CloudTrail, VPC flow logs and DNS logs (plus optional sources like S3 data events, EKS audit logs).</details>

**7.** Give an SCP that protects logging.
<details><summary>Answer</summary>Deny <code>cloudtrail:StopLogging</code>, <code>cloudtrail:DeleteTrail</code> and <code>cloudtrail:UpdateTrail</code> for all principals except a break-glass security role.</details>

**8.** What does AWS Config add?
<details><summary>Answer</summary>Configuration history of resources and rules that flag non-compliant configurations.</details>

**9.** Why can a budget alarm be a security control?
<details><summary>Answer</summary>Unexpected spend often reveals abuse such as cryptomining with stolen credentials.</details>

**10.** Scenario: GuardDuty reports an EC2 instance's role credentials used from an external IP. What does it suggest and what do you do?
<details><summary>Answer</summary>The instance's credentials were likely stolen (e.g. via SSRF or compromise). Revoke the role's active sessions (deny on token issue time), investigate the instance and its CloudTrail activity, isolate it, enforce IMDSv2, and rotate anything the role could access.</details>

## ✅ Checklist
- [ ] Lab steps 1–7
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #11
- [ ] Cloud resources deleted / billing checked

## 📚 Resources
- CloudTrail user guide — <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html>
- GuardDuty — <https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html>
- AWS Security Reference Architecture — <https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/welcome.html>
- AWS Config managed rules — <https://docs.aws.amazon.com/config/latest/developerguide/managed-rules-by-aws-config.html>

---
[← Week 27](week-27-data-protection.md) · [Month project →](project.md)
