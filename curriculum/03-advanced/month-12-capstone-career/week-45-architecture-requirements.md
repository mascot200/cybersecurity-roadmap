# Week 45 — Architecture and Requirements

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #16](https://github.com/mascot200/cybersecurity-roadmap/issues/16)

## 🎯 Objectives

1. Choose the capstone system and define its scope.
2. Identify assets, threats and trust boundaries for the whole system.
3. Write **security requirements** mapped to OWASP ASVS (and your own infrastructure controls).
4. Publish the architecture diagram and threat model as the capstone's foundation.

## 🌍 Why it matters

The capstone shows you can run a complete security lifecycle on one system: design, implement, test,
detect, remediate and report. Requirements written now become the checklist you prove in Weeks 46–48,
and the story you tell in interviews.

---

## 📖 Concepts

![Capstone architecture](images/capstone-architecture.svg)

### 1. Choosing the system

Use (or extend) what you've built: a multi-tenant Node.js API with PostgreSQL, deployed with hardened
containers on AWS through Terraform and a secure pipeline. Keep it **small in features and deep in
security**: a few resources (e.g. invoices, file attachments, users/roles) are enough. Cost: design for
free-tier or short-lived deployments with a tested teardown.

### 2. Assets, threats, boundaries

Reuse and update:
- Month 5 threat model (application), Month 7 architecture, Month 8 pipeline, Month 9 cloud threat model and attack paths, Month 10 detection catalogue.
- Re-draw one **current** architecture diagram with trust boundaries: internet → edge → app → data; CI → cloud; admin access; third parties.

### 3. Security requirements

Write requirements that are **specific and testable**, each with an ID, source and verification method:

| ID | Requirement | Source | Verified by |
|---|---|---|---|
| SR-01 | Every API request (except `/healthz`) requires a valid access token with pinned alg, issuer, audience and expiry | ASVS: tokens (self-contained tokens) | JWT test suite (M3) |
| SR-02 | A user can only access records of their own tenant; members only their own records | ASVS: authorization | Authorization matrix + RLS tests (M3) |
| SR-03 | Request bodies validated by strict schemas; unknown fields rejected | ASVS: validation and business logic | Schema tests (M3) |
| SR-04 | Passwords (if any) stored with Argon2id; sessions HttpOnly, Secure, SameSite | ASVS: authentication; session management | Auth tests (M1–M2) |
| SR-05 | Containers run non-root with read-only FS and no capabilities | CIS Docker / own | `verify.sh` (M6) |
| SR-06 | Database not reachable from the internet; app reaches it only via SG reference | Own (M7) | Reachability + connection tests |
| SR-07 | No long-lived cloud credentials in CI; deploys only from `main` via protected environment | Own (M8) | OIDC negative tests |
| SR-08 | Security events logged as structured JSON with redaction; alerts for defined detections | ASVS: security logging and error handling / own | Redaction + detection tests (M10) |
| SR-09 | Backups restorable within the RTO, verified on schedule | Own (M10) | `verify-restore.sh` |
| SR-10 | No high/critical unaccepted findings from SAST, SCA, image and IaC scans | Own (M5–M8) | CI gates |

> ASVS chapter numbers changed between versions (for example, *validation* is V5 in 4.0.3 but V2 in 5.0,
> where V5 is file handling). The table above uses chapter names; in your document, cite the ASVS version
> you use and its exact requirement IDs.

Aim for **25–40 requirements** covering application, infrastructure, pipeline, detection and recovery.

---

## 🧪 Lab — Foundation documents (4 h)

1. Create the capstone repository (or a `capstone/` folder) with: `README.md` (stub), `ARCHITECTURE.md`, `THREAT_MODEL.md`, `REQUIREMENTS.md`.
2. Draw the current architecture with trust boundaries (Mermaid or an image).
3. Update the threat model: STRIDE per element for new components, top 10 threats, and attack paths from Month 9.
4. Write 25–40 requirements with sources and verification methods. Mark which ones already pass (from earlier months) and which need work.

---

## 📝 Assignment — Publish architecture and threat model

**Task:** publish an architecture diagram and threat model.

### Acceptance criteria
- [ ] Architecture diagram with trust boundaries, data flows and identities
- [ ] Threat model with ≥ 10 prioritized threats and attack paths
- [ ] 25–40 testable security requirements with sources and verification methods
- [ ] A gap list: requirements not yet met, to fix in Weeks 46–47

---

## 💼 On the job

- Security requirements and threat models are what AppSec engineers produce in design reviews.
- Interviewers often ask you to "walk through the architecture and its threats". This document is your script.

## ⚠️ Common mistakes

- A capstone with many features and shallow security.
- Requirements that can't be tested ("the app is secure").
- Leaving the pipeline, detection and recovery out of the requirements.

## 🥊 Drill (pass mark 8/10)

**1.** What makes a security requirement good?
<details><summary>Answer</summary>Specific, testable, traceable to a source, with a verification method.</details>

**2.** Why keep the capstone small in features?
<details><summary>Answer</summary>Depth matters more: every control needs implementation and evidence, which takes time per feature.</details>

**3.** What does ASVS provide?
<details><summary>Answer</summary>A catalogue of verifiable application security requirements at three levels.</details>

**4.** Name four areas your requirements must cover.
<details><summary>Answer</summary>Any four of: authentication, authorization, input validation, data protection, infrastructure/network, containers, pipeline, logging/detection, recovery.</details>

**5.** Why cite the ASVS version?
<details><summary>Answer</summary>Requirement IDs and chapter numbers changed between versions.</details>

**6.** What is a gap list?
<details><summary>Answer</summary>Requirements not yet met, which become the work plan.</details>

**7.** Why include identities in the architecture diagram?
<details><summary>Answer</summary>Roles and trust relationships are part of the attack surface and the attack paths.</details>

**8.** Where do the verification methods come from?
<details><summary>Answer</summary>Mostly the tests and scripts built during the course, plus scans and negative tests.</details>

**9.** What should the threat model reuse from Month 9?
<details><summary>Answer</summary>The cloud threat model and attack-path graph (with any updates).</details>

**10.** Scenario: an interviewer asks "what's the biggest risk in your capstone?" How do you answer?
<details><summary>Answer</summary>Name the top threat from your model, the path it would take, the controls in place, the evidence that they work, and the residual risk you'd tackle next.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #16

## 📚 Resources
- OWASP ASVS — <https://owasp.org/www-project-application-security-verification-standard/>
- OWASP Threat Modeling Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html>

---
[← Month overview](README.md) · [Next: Week 46 — Application & pipeline →](week-46-application-pipeline.md)
