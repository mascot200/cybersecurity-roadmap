# Month 7 Drill — Cloud Security Foundations

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #11](https://github.com/mascot200/cybersecurity-roadmap/issues/11).
> Interactive version: ask Claude *"Drill me on Month 7 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What wins in IAM evaluation: Allow or explicit Deny?
<details><summary>Answer</summary>Explicit Deny.</details>

**A2.** What credentials do IAM roles provide?
<details><summary>Answer</summary>Temporary credentials (access key, secret key, session token) from STS.</details>

**A3.** Security groups are stateful or stateless?
<details><summary>Answer</summary>Stateful.</details>

**A4.** What makes a subnet public?
<details><summary>Answer</summary>A route to an internet gateway.</details>

**A5.** Which S3 feature overrides policies that would make data public?
<details><summary>Answer</summary>Block Public Access.</details>

**A6.** Where should CloudTrail logs be stored?
<details><summary>Answer</summary>In a separate, protected log-archive account (encrypted, versioned, deletion restricted, log validation on).</details>

**A7.** What's the safe way to administer a private EC2 instance?
<details><summary>Answer</summary>Systems Manager Session Manager (or a VPN), not public SSH.</details>

## Part B — Review it (2 points each: 1 problem, 1 fix)

**B1.**
```json
{ "Effect": "Allow", "Action": "s3:*", "Resource": "*" }
```
<details><summary>Answer</summary>Every S3 action on every bucket. Fix: list the actions needed on specific bucket/prefix ARNs.</details>

**B2.**
```json
{ "Effect": "Allow", "Principal": { "AWS": "*" }, "Action": "sts:AssumeRole" }
```
(trust policy)
<details><summary>Answer</summary>Any AWS principal in any account can assume the role. Fix: name the specific principal(s), add conditions (e.g. <code>sts:ExternalId</code>, <code>aws:SourceAccount</code>).</details>

**B3.** RDS instance: `PubliclyAccessible: true`, SG allows 5432 from `0.0.0.0/0`.
<details><summary>Answer</summary>Database reachable from the internet. Fix: private subnets, not publicly accessible, SG allowing only the app's SG.</details>

**B4.** A bucket policy Deny with `"StringNotEqualsIfExists"` on the KMS key header, meant to only block wrong keys.
<details><summary>Answer</summary><code>...IfExists</code> evaluates to true when the header is missing, so uploads relying on default encryption are denied too. Fix: AND a <code>Null: false</code> check with <code>StringNotEquals</code> (or accept that every upload must send the header). Test with real requests.</details>

**B5.** The app's DB password is in the ECS task definition as a plain environment variable.
<details><summary>Answer</summary>Visible to anyone who can read task definitions and in the container environment. Fix: Secrets Manager reference (or IAM DB auth), with rotation.</details>

**B6.** CloudTrail enabled only in `us-east-1`.
<details><summary>Answer</summary>Activity in other regions isn't recorded. Fix: a multi-region (organization) trail.</details>

## Part C — Scenarios (2 points each)

**C1.** A developer's access key leaked. Which logs answer "what did it do?", and what do you look for?
<details><summary>Answer</summary>CloudTrail: every event with that access key ID: successes and AccessDenied, source IPs, user agents, and anything persistent it created (users, keys, roles, policies, instances). Then disable the key and contain.</details>

**C2.** Explain to a teammate why the app role shouldn't have `AdministratorAccess` "just for now".
<details><summary>Answer</summary>If the app is compromised (SSRF to metadata, RCE, leaked credentials), the attacker gets admin over the whole account: data, logs, other workloads. Least privilege limits the blast radius to what the app actually needs.</details>

**C3.** Design multi-tenant file downloads from S3.
<details><summary>Answer</summary>Private bucket with Block Public Access, tenant-prefixed keys, SSE-KMS, TLS-only policy; the API authorizes each request (tenant and ownership) and returns a short-lived presigned URL for that one object; downloads logged.</details>

## Month 6 review (bonus, 1 point each)

**R1.** Why does mounting the Docker socket equal host root?
<details><summary>Answer</summary>The container can start a privileged container with the host filesystem mounted.</details>

**R2.** Where should runtime secrets come from?
<details><summary>Answer</summary>Mounted secret files or a secrets manager, not images or environment variables.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
