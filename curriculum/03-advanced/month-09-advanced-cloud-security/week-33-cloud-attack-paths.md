# Week 33 — Cloud Attack Paths

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #13](https://github.com/mascot200/cybersecurity-roadmap/issues/13)
> **Lab code:** [`labs/attack-paths/`](labs/attack-paths/) (Python, 7/7 tests passing, synthetic data)

## 🎯 Objectives

1. Think about cloud risk as **paths**: chains of permissions and trust that connect an entry point to sensitive data.
2. Recognize common links in those chains: workload credentials, code-update permissions, role trust, `iam:PassRole`, over-broad admin.
3. Model an environment as a graph and find every path from a foothold to sensitive data.
4. Choose fixes that cut the most paths for the least effort, and record preventive and detective controls for each link.

## 🌍 Why it matters

Defenders often review permissions one policy at a time; real incidents chain them together. A small foothold
(one vulnerable web container) can become full account control through two or three permissions that each
looked reasonable alone. Graph thinking shows which permission is the real problem. Tools such as AWS IAM
Access Analyzer, PMapper and commercial cloud security platforms all use this idea.

---

## 📖 Concepts

### 1. Links in a cloud attack path

| Link | Example | Preventive control | Detective control |
|---|---|---|---|
| Workload credentials | A compromised container uses its task role | Least-privilege role; IMDSv2; no secrets in env | GuardDuty credential-exfiltration findings |
| Code-update permissions | `lambda:UpdateFunctionCode`, `ecs:RegisterTaskDefinition` on other services | Only CI can deploy; scope by resource | Alert on code updates outside CI |
| Role trust | A role that trusts another role it shouldn't | Trust only specific principals; conditions | Alert on `AssumeRole` into admin roles |
| `iam:PassRole` | Give a powerful role to a new resource you control | Scope PassRole to named roles | Alert on resources launched with admin roles |
| Policy editing | `iam:CreatePolicyVersion`, `iam:AttachRolePolicy` | Only a small admin group; permissions boundaries | Alert on IAM changes (Month 7) |
| Logging control | Admin can stop CloudTrail | SCP protecting logs; separate log account | Alert on `StopLogging`/`DeleteTrail` |

### 2. The lab environment as a graph

![Attack-path graph](images/attack-paths.svg)

[`environment.json`](labs/attack-paths/environment.json) describes a synthetic account: nodes (entry point,
workloads, roles, data) and edges (what lets one node reach the next, plus the control that would stop it).
The scenario **assumes** the public web task is compromised. The question is: what can that foothold reach?

[`attack_paths.py`](labs/attack-paths/attack_paths.py) does two things:
1. Lists every simple path from the start node to any sensitive node.
2. Ranks each edge by how many of those paths disappear if it's removed.

```text
4 path(s) from 'internet' to sensitive data
  internet -> web-task -> web-task-role -> uploads-bucket
  internet -> web-task -> web-task-role -> reports-lambda -> reports-role -> customer-db-secret
  internet -> web-task -> web-task-role -> reports-lambda -> reports-role -> admin-role -> cloudtrail-logs
  internet -> web-task -> web-task-role -> reports-lambda -> reports-role -> admin-role -> customer-db-secret
```

### 3. Reading the ranking with judgment

The tool's ranking (from the real output):

| Paths broken | Edge | Can you actually remove it? |
|---|---|---|
| 4 | internet → web task | Not really: it's the product. Reduce likelihood (patching, AppSec, WAF) |
| 4 | web task → web-task role | No: the app needs credentials. **Narrow** the role instead |
| 3 | web-task role → reports Lambda | **Yes**: the web tier never needs to deploy code. Best cut |
| 3 | reports Lambda → reports role | No: the function needs its role. Narrow it |
| 2 | reports role → admin role | **Yes**: nothing should assume admin except humans via SSO + MFA |

The highest number isn't always the best fix. Look for edges that are **unnecessary** (remove them) versus
**necessary** (narrow them and add detection).

Try it:

```bash
cd labs/attack-paths
python3 attack_paths.py environment.json
python3 attack_paths.py environment.json --remove web-task-role:reports-lambda   # 1 path left
python3 attack_paths.py environment.json --start ci-deploy-role                   # CI compromise view
python3 -m unittest -v                                                             # 7 tests
```

### 4. Where the edges come from in a real account

- IAM policies and trust policies (Access Analyzer, `aws iam get-account-authorization-details`)
- Resource policies (S3, KMS, Lambda, SQS)
- Network reachability (Week 26: which workloads are exposed)
- Secrets and credentials stored where workloads can read them

Building the graph by hand for a small lab account is a great exercise; for real accounts use tools.

---

## 🧪 Lab — Map and cut (3 h)

1. Run the tool and tests. Then answer: which edge would you remove first, and why?
2. Add a new node `support-tool` (workload) whose role can read `customer-db-secret`, reachable from `internet` via a vulnerable admin page. Rerun. How does the ranking change? Add a test for the new path.
3. Model **your own** Month 7/8 lab account: nodes for each role and workload, edges for each permission or trust that lets one reach another. Mark sensitive data. Run the tool.
4. For every edge in your model, fill the preventive and detective control columns.

---

## 📝 Assignment — Attack paths and preventive controls

**Task:** map possible attack paths in a lab and identify preventive controls.

`ATTACK_PATHS.md` with: your graph (JSON + a diagram), all paths from at least two starting points
(internet-exposed workload and CI), the ranked cuts with your judgment on each, and the preventive and
detective controls you implemented or planned.

### Acceptance criteria
- [ ] Graph of your lab account with ≥ 8 nodes
- [ ] Paths from ≥ 2 starting points
- [ ] At least two unnecessary edges removed in the real lab (evidence: updated policies, tool rerun)
- [ ] Preventive and detective control for each remaining edge
- [ ] Tests for your graph's key paths

---

## 💼 On the job

- Cloud security teams prioritize findings by attack path: "this misconfiguration matters because it connects the internet to production data".
- Architecture reviews ask "if this component is compromised, what can it reach?" for every new service.

## ⚠️ Common mistakes

- Reviewing each policy in isolation.
- Treating every edge as removable. Some are the product.
- Forgetting non-human paths (CI, automation, third-party integrations).
- Fixing a path without adding detection for the edges that must stay.

## 🥊 Drill (pass mark 8/10)

**1.** What is an attack path?
<details><summary>Answer</summary>A chain of access steps (credentials, permissions, trust, network reachability) that connects an entry point to a sensitive asset.</details>

**2.** Why can three "reasonable" permissions be dangerous together?
<details><summary>Answer</summary>Each one moves an attacker one step; combined, they connect a low-value foothold to high-value assets.</details>

**3.** Why is `lambda:UpdateFunctionCode` a privilege-escalation link?
<details><summary>Answer</summary>Replacing a function's code lets you run code as that function's execution role, gaining its permissions.</details>

**4.** Why is `iam:PassRole` on `*` dangerous?
<details><summary>Answer</summary>It lets the holder attach any role, including admin roles, to resources they control.</details>

**5.** The tool says removing "web task → web-task role" breaks 4 paths. Why not remove it?
<details><summary>Answer</summary>The application needs credentials to work. Narrow the role's permissions and add detection instead.</details>

**6.** What makes an edge a good removal candidate?
<details><summary>Answer</summary>It isn't needed for the system's function (e.g. a web tier able to deploy code, a workload role able to assume admin).</details>

**7.** Name a detective control for the role-trust link.
<details><summary>Answer</summary>Alert on <code>AssumeRole</code> events into admin or sensitive roles, especially from workload roles.</details>

**8.** Why model CI as a separate starting point?
<details><summary>Answer</summary>CI systems have powerful deploy permissions and their own compromise paths (stolen tokens, malicious dependencies, compromised actions).</details>

**9.** What does IMDSv2 protect in this graph?
<details><summary>Answer</summary>The "workload → role credentials" link against SSRF-style theft of instance credentials.</details>

**10.** Scenario: leadership asks "what's the single most valuable fix?" How do you answer?
<details><summary>Answer</summary>Show the paths, then the edge that cuts the most paths and can actually be removed, with its effort and the residual paths afterwards, plus the detection you'll add for edges that must stay.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #13

## 📚 Resources
- AWS IAM Access Analyzer — <https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html>
- PMapper (principal mapper) — <https://github.com/nccgroup/PMapper>
- MITRE ATT&CK Cloud matrix — <https://attack.mitre.org/matrices/enterprise/cloud/>
- AWS Skill Builder — <https://skillbuilder.aws/>

---
[← Month overview](README.md) · [Next: Week 34 — Misconfiguration assessment →](week-34-misconfiguration-assessment.md)
