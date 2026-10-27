# Week 3 — Security Principles

> **Level:** Beginner · **Time:** ~10 h · **Tracking:** [issue #5](https://github.com/mascot200/cybersecurity-roadmap/issues/5)

## 🎯 Objectives

1. Use the CIA triad to describe what an attack harms.
2. Apply least privilege, defense in depth and attack-surface reduction to a design.
3. Distinguish asset, threat, vulnerability, risk and control — and score risk.
4. Run a basic threat model: draw a data-flow diagram, find trust boundaries, list threats with STRIDE.

## 🌍 Why it matters

Tools change every year; principles don't. When you face a system you've never seen, these principles
tell you **where to look** and **how to argue** for a fix in a way managers understand (risk).

**Real-world scenario — Colonial Pipeline (2021):** attackers reportedly got in through a VPN account
protected only by a password (no MFA), likely reused from another breach. One missing layer
(MFA) on one forgotten account led to a ransomware incident that shut down fuel pipeline operations.
Least privilege (disable unused accounts), defense in depth (MFA + segmentation) and attack-surface
reduction (remove legacy VPN profiles) each would have helped.

---

## 📖 Concepts

### 1. The CIA triad

| Property | Means | Attack example | Control example |
|---|---|---|---|
| **Confidentiality** | Only authorized people can read it | Data leak via IDOR | Authorization checks, encryption |
| **Integrity** | Data/systems aren't altered improperly | Attacker changes order price | Server-side validation, signatures, audit logs |
| **Availability** | It works when needed | DDoS, ransomware | Rate limiting, backups, redundancy |

Often added: **Authenticity** (it's really from who it claims) and **Non-repudiation** (they can't deny doing it — audit logs).

### 2. Core design principles

| Principle | Plain meaning | Developer example |
|---|---|---|
| **Least privilege** | Minimum access, minimum time | DB user for the API can `SELECT/INSERT/UPDATE` on app tables — not `DROP`, not superuser |
| **Defense in depth** | Several independent layers | Input validation **and** parameterized queries **and** least-privilege DB user **and** WAF |
| **Secure defaults / fail closed** | If unsure, deny | Auth middleware applied globally; routes opt *out* explicitly |
| **Minimize attack surface** | Fewer entry points | Remove unused endpoints, debug routes, open ports |
| **Separation of duties** | No single person/identity can do everything | Deploy pipeline can deploy, but not edit its own permissions |
| **Complete mediation** | Check authorization on *every* request | Don't cache "is admin" in a client-side flag |
| **Keep it simple** | Complex = bugs | One well-tested auth library over custom crypto |
| **Don't rely on secrecy of design** | Assume attacker knows your code | Security comes from keys/controls, not hidden URLs |

![Defense in depth](images/defense-in-depth.svg)

### 3. Risk vocabulary

- **Asset:** something valuable (customer PII, payment flow, admin accounts, uptime).
- **Vulnerability:** a weakness (missing auth check).
- **Threat:** who/what could exploit it (a curious customer, a criminal group, a malicious insider).
- **Risk:** likelihood × impact.
- **Control:** a safeguard — **preventive** (stops), **detective** (notices), **corrective** (recovers).

Simple risk matrix used throughout this course:

| Likelihood ↓ / Impact → | Low (1) | Medium (2) | High (3) |
|---|---|---|---|
| **High (3)** | 3 Medium | 6 High | 9 Critical |
| **Medium (2)** | 2 Low | 4 Medium | 6 High |
| **Low (1)** | 1 Low | 2 Low | 3 Medium |

Responses to risk: **mitigate** (add control), **avoid** (remove the feature), **transfer** (insurance, vendor), **accept** (documented, by someone with authority).

### 4. Threat modeling — the four questions

From the Threat Modeling Manifesto:

1. **What are we working on?** → draw it (data-flow diagram).
2. **What can go wrong?** → STRIDE per element / trust boundary.
3. **What are we going to do about it?** → mitigations.
4. **Did we do a good job?** → review, test, update.

**Data-flow diagram (DFD) elements:** external entity (user), process (API), data store (DB), data flow (arrows), **trust boundary** (dashed line where privilege/trust changes).

```mermaid
flowchart LR
  U[User browser] -->|"POST /login (email, password)"| API
  subgraph TB1["Trust boundary: our infrastructure"]
    API[Login API] -->|"SELECT user by email"| DB[(Users DB)]
    API -->|"send reset email"| MAIL[Email service]
  end
  ATT[Attacker] -.->|"same endpoint"| API
```

**STRIDE:**

| Threat | Violates | Login API example | Mitigation |
|---|---|---|---|
| **S**poofing | Authenticity | Credential stuffing with leaked passwords | MFA, breached-password check, rate limiting |
| **T**ampering | Integrity | Modifying `role` in a client-side token | Signed tokens, server-side role lookup |
| **R**epudiation | Non-repudiation | User denies changing their email | Audit log with user, time, IP |
| **I**nformation disclosure | Confidentiality | "No account with that email" reveals which emails exist | Generic error messages |
| **D**enial of service | Availability | Flooding login with slow hash requests | Rate limits, request size limits |
| **E**levation of privilege | Authorization | Mass assignment sets `isAdmin=true` at signup | Allowlist fields |

---

## 🧪 Lab — Principles hunt (90 min)

**1. Attack surface inventory of your VM**

```bash
sudo ss -tulpn                         # network entry points
systemctl list-units --type=service --state=running
getent group sudo docker               # privileged users
find / -perm -4000 -type f 2>/dev/null # SUID binaries
```
List every entry point, who can reach it, and whether it's needed. Disable one unneeded service.

**2. Least privilege in PostgreSQL**

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=labpass -p 127.0.0.1:5432:5432 postgres:16
psql postgresql://postgres:labpass@127.0.0.1:5432/postgres <<'SQL'
CREATE DATABASE shop;
\c shop
CREATE TABLE users (id serial primary key, email text unique, pw_hash text);
CREATE ROLE app_user LOGIN PASSWORD 'app_pass';
GRANT CONNECT ON DATABASE shop TO app_user;
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
GRANT USAGE ON SEQUENCE users_id_seq TO app_user;
SQL
psql postgresql://app_user:app_pass@127.0.0.1:5432/shop -c "INSERT INTO users(email,pw_hash) VALUES ('a@x.io','x');"   # works
psql postgresql://app_user:app_pass@127.0.0.1:5432/shop -c "DROP TABLE users;"   # expect: must be owner
docker rm -f pg
```

Explain: if SQL injection existed in the app, how does this role limit the damage?

**3. Microsoft Threat Modeling learning path** — complete the first module (link below).

---

## 📝 Assignment — Threat-model a login API

**Task:** threat-model a login API and identify five attack scenarios with mitigations.

### System to model
`POST /login`, `POST /signup`, `POST /password-reset/request`, `POST /password-reset/confirm`,
backed by a users table and an email provider. Sessions via cookies.

### Steps
1. **Draw the DFD** with all entities, processes, stores, flows and at least two trust boundaries.
2. **List assets:** e.g. password hashes, sessions, reset tokens, user emails, availability.
3. **Apply STRIDE** to each trust-boundary crossing. Aim for 10+ raw threats.
4. **Pick the top five** and document each:

   | # | Scenario (attacker story) | STRIDE | Likelihood | Impact | Risk | Mitigation(s) | How to verify |
   |---|---|---|---|---|---|---|---|
   | 1 | Attacker uses a list of leaked email/password pairs (credential stuffing) | S | 3 | 3 | 9 | Rate limit per IP+account, MFA, breached-password check | Test: 20 failed logins → 429 |

5. **Note residual risk** for each (what's left after mitigation).

### Acceptance criteria
- [ ] DFD with trust boundaries (rendered image in your repo)
- [ ] ≥ 10 STRIDE threats identified, top 5 fully documented in the table format
- [ ] Every mitigation has a "how to verify" (a test or evidence)
- [ ] Includes at least one threat each for: password reset, user enumeration, brute force

---

## 💼 On the job

AppSec engineers run threat-modeling sessions with dev teams at design time ("design reviews"). The
output is a list of security requirements and tickets — cheaper than finding the same bugs in a pentest.

## ⚠️ Common mistakes

- Listing generic threats ("hackers") instead of concrete attacker stories.
- Mitigations without verification.
- Forgetting non-obvious flows: password reset, email change, admin tools, logs, backups.
- Treating threat modeling as a one-time document; it should change with the system.

## 🥊 Drill (pass mark 8/10)

**1.** A ransomware attack encrypts your database. Which CIA property is primarily affected? If they also leak it?
<details><summary>Answer</summary>Availability (and integrity). Leaking adds confidentiality.</details>

**2.** Give a developer example of "fail closed".
<details><summary>Answer</summary>If the authorization service is unreachable, deny the request rather than allow it; or global auth middleware with explicit public-route exceptions.</details>

**3.** What's the difference between a threat and a vulnerability?
<details><summary>Answer</summary>A vulnerability is a weakness in the system; a threat is an actor or event that could exploit a weakness.</details>

**4.** Map to STRIDE: "an attacker reads other users' invoices by changing an ID".
<details><summary>Answer</summary>Information disclosure (caused by an elevation-of-privilege / broken authorization flaw).</details>

**5.** Map to STRIDE: "a user deletes their order then claims they never placed it, and we have no logs".
<details><summary>Answer</summary>Repudiation.</details>

**6.** Why does a least-privilege DB role matter if you already use parameterized queries?
<details><summary>Answer</summary>Defense in depth: if any query is ever vulnerable (or credentials leak), the role limits what an attacker can do.</details>

**7.** What are the four threat-modeling questions?
<details><summary>Answer</summary>What are we working on? What can go wrong? What are we going to do about it? Did we do a good job?</details>

**8.** Why is "the login page says 'email not found'" a security issue?
<details><summary>Answer</summary>User enumeration — it confirms which emails have accounts, enabling targeted credential stuffing and phishing.</details>

**9.** Name a preventive, a detective and a corrective control for credential stuffing.
<details><summary>Answer</summary>Preventive: rate limiting/MFA. Detective: alert on many failed logins across accounts from one IP. Corrective: force password reset / revoke sessions for affected accounts.</details>

**10.** Scenario: your PM wants to "accept the risk" of no MFA for admins. What do you need for that to be a valid decision?
<details><summary>Answer</summary>A documented risk assessment (likelihood, impact), an owner with authority to accept it, an expiry/review date, and ideally compensating controls (IP restriction, alerts).</details>

## ✅ Checklist
- [ ] Lab steps 1–3
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10
- [ ] Weekly log on issue #5

## 📚 Resources
- Microsoft Threat Modeling fundamentals — <https://learn.microsoft.com/en-us/training/paths/tm-threat-modeling-fundamentals/>
- Threat Modeling Manifesto — <https://www.threatmodelingmanifesto.org/>
- OWASP Threat Modeling Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html>

---
[← Week 2](week-02-networking-fundamentals.md) · [Next: Week 4 — Cryptography & web identity →](week-04-cryptography-web-identity.md)
