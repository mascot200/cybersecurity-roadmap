# Week 48 — Assessment and Publication

> **Level:** Advanced · **Time:** ~10–12 h · **Tracking:** [issue #16](https://github.com/mascot200/cybersecurity-roadmap/issues/16)
> **Lab code:** [`labs/sanitize/`](labs/sanitize/): pre-publication checker (6/6 tests passing)
> **Career guide:** [`career-guide.md`](career-guide.md)

## 🎯 Objectives

1. Assess the finished capstone (Month 11 method), remediate and retest.
2. Sanitize the repository before publishing.
3. Write a README that lets a reviewer understand and verify the project in minutes.
4. Optionally record a short demo video.
5. Prepare for applications and interviews.

## 🌍 Why it matters

A portfolio project only helps if people can see it and trust it. Publishing badly (leaked keys, real
account IDs, an unreadable README) can hurt more than help. This week turns a year of work into a public,
verifiable story.

---

## 📖 Concepts

### 1. Final assessment

Run a compact version of Month 11 on the capstone: refresh the test plan from your Week 45 requirements,
execute it (most of it is automated now), write findings with CVSS and rationale, fix and retest, and write
the residual-risk section.

### 2. Sanitize before publishing

Check for: secrets and keys (current files **and** git history), real account IDs and ARNs, internal
hostnames and IPs, real names and emails, screenshots showing any of these, `.tfstate` or `.env` files,
and logs with real data.

Tools:

```bash
gitleaks git --redact .                                        # secrets across history
python3 labs/sanitize/sanitize_check.py path/to/capstone       # account IDs, keys, private IPs, emails, internal hosts
```

[`sanitize_check.py`](labs/sanitize/sanitize_check.py) flags AWS account IDs (only right after an ARN prefix or the word
"account", so order numbers don't trigger it), access key IDs, private key blocks, private-range IPs,
email addresses and internal hostnames. It allows documentation placeholders (`111122223333`,
`123456789012`, RFC 5737 documentation IPs, `example.com`, `.test`, the course's `lab.local`), and skips
`.git`, `node_modules` and `fixtures`.

What its development showed:
- A first version flagged any 12-digit number on a line containing "account", including an order number next to the phrase "not account IDs". Context now has to come **immediately before** the number.
- Run over this whole course, it reports no account IDs, access keys or private keys. What remains are teaching examples (private CIDR ranges like `10.0.0.0/16` in networking lessons) and two email addresses (the public OverTheWire login and a placeholder in a Month 1 lab). That's the expected kind of "items to review".
- On its own folder it reports the private IP used in its test file. A checker produces items **to review**; a human decides.

If anything sensitive was ever committed, **rotate it first**, then rewrite history (e.g. `git filter-repo`) before making the repo public.

### 3. A README that sells and proves

| Section | Content |
|---|---|
| One-paragraph summary | What it is, what it demonstrates, the stack |
| Architecture | Diagram with trust boundaries |
| Security highlights | 6–10 bullets, each linking to evidence |
| Requirement → evidence table | From Weeks 46–47 |
| How to run | Local in < 10 minutes; cloud deploy + teardown |
| How to verify | Commands for tests, scans and `verify.sh` |
| Assessment | Link to the report; summary of findings and retests |
| Limitations and next steps | Honest list |

### 4. Demo video (optional, 5–8 minutes)

1. The problem and architecture (1 min)
2. A security control working: e.g. cross-tenant request denied, with the test that proves it (2 min)
3. A gate blocking a bad PR (1 min)
4. An alert firing and the restore drill (2 min)
5. What you'd do next (1 min)

---

## 🧪 Lab — Assess, sanitize, publish (6 h)

```bash
cd curriculum/03-advanced/month-12-capstone-career/labs/sanitize
python3 -m unittest -v                     # 6 tests
python3 sanitize_check.py ~/path/to/capstone
```

1. Run the final assessment and retest fixes.
2. Run gitleaks over history and `sanitize_check.py` over the repo. Resolve or justify every item.
3. Write the README using the structure above. Ask someone unfamiliar with the project to read it for 5 minutes, then tell you what it does and how they'd verify one claim.
4. Make the repo public (or share it privately with reviewers), with CI badges.
5. Optional: record the demo video.

---

## 📝 Assignment — Publish the capstone

**Task:** publish a sanitized project README, assessment report and optional demo video.

### Acceptance criteria
- [ ] Final assessment report with retests
- [ ] gitleaks clean; `sanitize_check.py` items resolved or justified
- [ ] README with architecture, highlights, evidence table, run/verify instructions and limitations
- [ ] A reader test done and feedback applied
- [ ] Repository published (or shared) with CI passing

---

## 💼 On the job

- Hiring managers for AppSec and cloud security roles often look for exactly this: evidence-backed projects and clear writing.
- The same sanitization habit applies to every conference talk, blog post and bug report you publish.

## ⚠️ Common mistakes

- Publishing with secrets in git history.
- READMEs that describe intentions but link no evidence.
- Hiding limitations. Honest limitations read as maturity.

## 🥊 Drill (pass mark 8/10)

**1.** What must you do first if a secret was ever committed?
<details><summary>Answer</summary>Revoke and rotate it; then remove it from history before publishing.</details>

**2.** Why scan git history, not just the current files?
<details><summary>Answer</summary>Deleted secrets remain in earlier commits and anyone can read them once the repo is public.</details>

**3.** Why does the checker look for context before 12-digit numbers?
<details><summary>Answer</summary>To avoid false positives from order numbers, timestamps and IDs that aren't AWS account IDs.</details>

**4.** Name four things to sanitize besides secrets.
<details><summary>Answer</summary>Any four of: account IDs/ARNs, internal hostnames/IPs, real names/emails, screenshots with sensitive data, state/env files, logs with real data.</details>

**5.** What's the purpose of the reader test?
<details><summary>Answer</summary>To check that someone else can understand the project and verify a claim quickly.</details>

**6.** Why link evidence from the README?
<details><summary>Answer</summary>Claims without evidence aren't convincing; links let reviewers verify in one click.</details>

**7.** What should a demo video show?
<details><summary>Answer</summary>The architecture, controls working (with tests), a gate blocking a bad change, an alert and a restore, and next steps.</details>

**8.** Why include limitations?
<details><summary>Answer</summary>They show honest understanding of what's covered and what isn't.</details>

**9.** Why does a checker produce "items to review" rather than pass/fail certainty?
<details><summary>Answer</summary>Patterns can't know intent; some matches are intentional teaching examples, so a human decides.</details>

**10.** Scenario: the checker flags `10.0.1.0/24` in your networking docs. Fix or justify?
<details><summary>Answer</summary>Justify if it's an illustrative private range unrelated to a real network; change it if it reveals your actual internal addressing.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #16

## 📚 Resources
- GitHub: removing sensitive data from a repository — <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository>
- gitleaks — <https://github.com/gitleaks/gitleaks>
- NIST NICE Framework — <https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center>

---
[← Week 47](week-47-infrastructure-operations.md) · [Career guide →](career-guide.md) · [Capstone project →](project.md)
