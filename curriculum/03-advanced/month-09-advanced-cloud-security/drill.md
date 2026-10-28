# Month 9 Drill — Advanced Cloud Security

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #13](https://github.com/mascot200/cybersecurity-roadmap/issues/13).
> Interactive version: ask Claude *"Drill me on Month 9 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What does an attack-path analysis connect?
<details><summary>Answer</summary>Entry points to sensitive assets, through credentials, permissions, trust and network reachability.</details>

**A2.** Which AWS managed policies suit a read-only audit role?
<details><summary>Answer</summary><code>SecurityAudit</code> and <code>ViewOnlyAccess</code>.</details>

**A3.** Which namespace label enforces Pod Security "restricted"?
<details><summary>Answer</summary><code>pod-security.kubernetes.io/enforce: restricted</code>.</details>

**A4.** What does a default-deny NetworkPolicy select?
<details><summary>Answer</summary>All pods in the namespace (<code>podSelector: {}</code>) with no allowed ingress/egress.</details>

**A5.** Are Kubernetes Secrets encrypted at rest by default?
<details><summary>Answer</summary>No; they're base64-encoded unless etcd encryption is configured.</details>

**A6.** How do you validate a preventive control?
<details><summary>Answer</summary>A negative test: attempt the forbidden action and confirm it's denied.</details>

**A7.** Name a permission that lets a workload run code as another role.
<details><summary>Answer</summary><code>lambda:UpdateFunctionCode</code> (also <code>iam:PassRole</code> with a compute launch, <code>ecs:RegisterTaskDefinition</code> + run task).</details>

## Part B — Review it (2 points each: 1 problem, 1 fix)

**B1.**
```yaml
kind: ClusterRoleBinding
roleRef: { kind: ClusterRole, name: cluster-admin }
subjects: [{ kind: ServiceAccount, name: ci, namespace: build }]
```
<details><summary>Answer</summary>CI has full control of the whole cluster. Fix: namespace-scoped Role with only the verbs/resources needed for deployment.</details>

**B2.**
```yaml
securityContext:
  privileged: true
volumes:
  - name: host
    hostPath: { path: / }
```
<details><summary>Answer</summary>Privileged container with the node's root filesystem: node takeover. Fix: remove both; PSA restricted plus a policy engine to block them.</details>

**B3.** A role trust policy allows `arn:aws:iam::111122223333:role/reports-role` to assume `admin-role`.
<details><summary>Answer</summary>A workload role can become admin, so compromising the workload means compromising the account. Fix: remove the trust; admin only via SSO + MFA; alert on AssumeRole into admin.</details>

**B4.** NetworkPolicies are applied and documented, but no test ever checked a blocked connection.
<details><summary>Answer</summary>They may be silently ignored by a CNI that doesn't enforce them. Fix: a negative connectivity test (ideally scheduled).</details>

**B5.** Prowler run with an admin role to "save time".
<details><summary>Answer</summary>Audit tools only need read access; a compromised tool or leaked credentials would have admin. Fix: dedicated read-only audit role.</details>

**B6.** A finding is fixed in the console; the resource is managed by Terraform.
<details><summary>Answer</summary>The next apply may revert it, and the change bypassed review. Fix: change the Terraform, apply through the pipeline, add a guardrail.</details>

## Part C — Scenarios (2 points each)

**C1.** Your attack-path tool ranks "web task → web-task role" highest. Do you remove it?
<details><summary>Answer</summary>No: the app needs credentials. Narrow the role to exactly what's needed, enforce IMDSv2/egress limits, and add detection; remove unnecessary edges elsewhere.</details>

**C2.** A pod is compromised in a namespace with PSA restricted, default-deny NetworkPolicies and no service account token. What can the attacker still do?
<details><summary>Answer</summary>Whatever the app itself can: read its mounted secret, talk to the DB on 5432 with the app's DB role, and read data the app can read. That's why the DB role and secrets are also least privilege, and why detection matters.</details>

**C3.** How do you prove to leadership that this month made the environment safer?
<details><summary>Answer</summary>Before/after attack-path numbers, closed critical/high audit findings, new guardrails, and a validation matrix with evidence that key controls work.</details>

## Month 8 review (bonus, 1 point each)

**R1.** What must every GitHub OIDC trust policy restrict?
<details><summary>Answer</summary>The <code>sub</code> claim (repo and branch/environment), plus <code>aud</code>.</details>

**R2.** Why is Terraform state sensitive?
<details><summary>Answer</summary>It can contain secrets in plaintext, and writing to it can change real infrastructure on the next apply.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
