# Drills — How You'll Be Tested

Reading feels like learning. Drills prove it. This course has four kinds:

| Drill | Where | When | Pass mark |
|---|---|---|---|
| **Diagnostic** | Below | Before Week 1 | none — it's a baseline |
| **Weekly drill** | 🥊 section at the end of every lesson | End of each week | 80% |
| **Monthly drill** | `drill.md` in each month folder | End of each month (mixes earlier months) | 80% |
| **Level checkpoint** | Month 4, 8 and 12 `drill.md` | Before moving up a level | 80% + practical task |

## Drill formats

- **Recall** — short factual questions ("What does the `HttpOnly` cookie flag do?").
- **Explain** — answer in your own words in 2–4 sentences, as if to a teammate.
- **Spot the bug** — a code or config snippet; find the vulnerability and write the fix.
- **Scenario** — a realistic situation ("You get this alert at 2 a.m. …"); describe what you'd do.
- **Hands-on** — do something in your lab under a time limit and show evidence.

Answers are hidden in collapsible blocks:

<details>
<summary>Show answer</summary>

Like this. Score yourself honestly: full point only if your answer contains the key idea.
</details>

## Scoring and what to do with a low score

| Score | Action |
|---|---|
| 90–100% | Move on. Note any misses in your log. |
| 80–89% | Move on, but re-read the sections behind every miss. |
| 60–79% | Re-study the weak sections, redo the lab, retake the drill in 2–3 days. |
| < 60% | Repeat the week. This is normal — note what blocked you. |

Record the score in your weekly log on the month's issue.

## Getting drilled by Claude (interactive)

You can ask Claude (in a Claude Code session on this repo, or claude.ai) to drill you. Use prompts like:

```
Drill me on Month 2, Week 6 (SQL injection). Ask one question at a time,
mix recall, spot-the-bug and scenario questions, wait for my answer,
grade it strictly, explain what I missed, and give me a score out of 10 at the end.
```

```
Give me a 20-minute mixed drill on Months 1–3. Prioritize what I got wrong last time:
<paste the weak areas from your log>.
```

```
Interview-drill me as if for a junior Application Security Engineer role.
Ask follow-up questions when my answer is vague.
```

Or open a **Drill request** issue (New issue → *Drill request*) so the request and your results are tracked.

**When to ask for a drill:** at the end of each week, whenever you feel "I think I get it",
before each level gate, and any time you return after a break.

---

## 🧪 Diagnostic Drill (take it now — no studying first)

This tells you where you're starting. Don't worry about the score. 15 questions, 1 point each.

**1.** What is the difference between authentication and authorization?

<details><summary>Answer</summary>

Authentication proves **who** you are (login, token). Authorization decides **what** you're allowed to do (can user 42 read invoice 1001?).
</details>

**2.** Why is storing passwords with SHA-256 a bad idea, even with a salt?

<details><summary>Answer</summary>

SHA-256 is designed to be **fast**; attackers can try billions of guesses per second on GPUs. Passwords need a **slow, memory-hard** password-hashing function (Argon2id, scrypt, bcrypt) with a per-user salt.
</details>

**3.** What happens, in order, when you type `https://example.com` into a browser? (Name at least 4 steps.)

<details><summary>Answer</summary>

DNS resolution → TCP connection (3-way handshake) to port 443 → TLS handshake (certificate validation, key exchange) → HTTP request sent over the encrypted channel → server responds → browser renders, fetching sub-resources.
</details>

**4.** Spot the bug:

```js
const rows = await db.query(`SELECT * FROM users WHERE email = '${req.query.email}'`);
```

<details><summary>Answer</summary>

**SQL injection** — user input is concatenated into SQL. Fix: parameterized query: `db.query('SELECT * FROM users WHERE email = $1', [req.query.email])`.
</details>

**5.** What does file permission `-rwxr-x---` mean?

<details><summary>Answer</summary>

Owner: read/write/execute. Group: read/execute. Others: no access. (Octal 750.)
</details>

**6.** Name the three properties of the CIA triad.

<details><summary>Answer</summary>Confidentiality, Integrity, Availability.</details>

**7.** A user changes `GET /api/invoices/1001` to `/api/invoices/1002` and sees someone else's invoice. What is this vulnerability called?

<details><summary>Answer</summary>

**IDOR** (Insecure Direct Object Reference), called **BOLA** (Broken Object Level Authorization) in the OWASP API Top 10. The server didn't check that the invoice belongs to the caller.
</details>

**8.** What is XSS, in one sentence?

<details><summary>Answer</summary>

Cross-Site Scripting: attacker-controlled input is rendered as executable script in another user's browser, running with that site's privileges.
</details>

**9.** Why shouldn't a container run as root?

<details><summary>Answer</summary>

If the app is compromised, root in the container makes escaping to the host and tampering with the container far easier (and with misconfigurations like mounted Docker socket or privileged mode, it's often direct host root). Non-root limits blast radius.
</details>

**10.** What is the principle of least privilege?

<details><summary>Answer</summary>

Every user, process and service gets **only** the permissions it needs, for only as long as it needs them — nothing more.
</details>

**11.** Is Base64 encryption?

<details><summary>Answer</summary>

No. It's an **encoding** — anyone can reverse it without a key. JWT payloads are Base64URL-encoded, so they are **readable by anyone**.
</details>

**12.** Your teammate pushed an AWS access key to a public GitHub repo and deleted the commit 5 minutes later. Is it safe now?

<details><summary>Answer</summary>

**No.** Bots scrape public commits within seconds/minutes and it remains in git history/forks/caches. **Revoke/rotate the key immediately**, then review CloudTrail for usage, then clean history.
</details>

**13.** What's the difference between a vulnerability, a threat and a risk?

<details><summary>Answer</summary>

Vulnerability = a weakness. Threat = someone/something that could exploit it. Risk = likelihood × impact of the threat exploiting the weakness.
</details>

**14.** What does HTTPS protect, and what does it *not* protect?

<details><summary>Answer</summary>

Protects confidentiality and integrity of data **in transit** and authenticates the server. It does **not** protect against vulnerabilities in the app (SQLi, XSS, IDOR), compromised endpoints, or data at rest.
</details>

**15.** What would you look at first to know whether someone is brute-forcing SSH on a Linux server?

<details><summary>Answer</summary>

Auth logs: `journalctl -u ssh` (or `/var/log/auth.log`), looking for many `Failed password` / `Invalid user` lines from the same IPs.
</details>

**Record your score in issue #1.** Typical starting scores for experienced developers: 5–9. By the end of Month 3 you should be at 15/15.
