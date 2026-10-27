# Month 2 Drill — Web Application Security Fundamentals

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #6](https://github.com/mascot200/cybersecurity-roadmap/issues/6).
> Interactive version: ask Claude *"Drill me on Month 2 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What does OWASP ASVS give you that the Top 10 doesn't?
<details><summary>Answer</summary>A detailed, testable set of security requirements for verifying an application. The Top 10 is an awareness list.</details>

**A2.** What is the one-sentence root cause of every injection bug?
<details><summary>Answer</summary>Untrusted data reaches an interpreter as part of the command or query, so it can change the structure instead of staying data.</details>

**A3.** Which header stops your site from being framed?
<details><summary>Answer</summary>CSP <code>frame-ancestors 'none'</code> (or the older <code>X-Frame-Options: DENY</code>).</details>

**A4.** Name the three things that must be true for CSRF to work.
<details><summary>Answer</summary>A state-changing action, authentication the browser sends automatically (e.g. cookies), and no unpredictable value such as a CSRF token.</details>

**A5.** Does CORS protect against CSRF?
<details><summary>Answer</summary>No. CORS controls whether another origin can <em>read</em> responses, not whether it can <em>send</em> requests.</details>

**A6.** Where should a password reset link's base URL come from?
<details><summary>Answer</summary>Server configuration, never the request's <code>Host</code> header.</details>

**A7.** Which MFA type resists phishing?
<details><summary>Answer</summary>WebAuthn / FIDO2 (passkeys, security keys).</details>

## Part B — Spot the bug and give the fix (2 points each: 1 bug, 1 fix)

**B1.**
```js
const { rows } = await pool.query(`SELECT * FROM orders WHERE status = '${req.query.status}'`);
```
<details><summary>Answer</summary>SQL injection through string interpolation. Fix: <code>pool.query('SELECT * FROM orders WHERE status = $1', [status])</code>, plus an allowlist of valid statuses.</details>

**B2.**
```js
const col = req.query.sort;
pool.query(`SELECT * FROM products ORDER BY ${col}`);
```
<details><summary>Answer</summary>The identifier comes from user input, and identifiers can't be parameterized. Fix: map input to a hard-coded allowlist of column names.</details>

**B3.**
```jsx
<div dangerouslySetInnerHTML={{ __html: comment.body }} />
```
<details><summary>Answer</summary>Stored XSS when <code>comment.body</code> comes from users. Fix: render as text (<code>{comment.body}</code>), or sanitize with DOMPurify using a strict allowlist if rich text is required.</details>

**B4.**
```js
app.use(cors({ origin: true, credentials: true }));
```
<details><summary>Answer</summary>It reflects any origin while allowing credentials, so any website can read logged-in users' data. Fix: an exact allowlist of trusted origins, and <code>Vary: Origin</code>.</details>

**B5.**
```js
app.get('/account/delete', requireSession, deleteAccount);
```
<details><summary>Answer</summary>A state change on GET. SameSite=Lax cookies are still sent on top-level GET navigations, so a link can trigger it. Fix: use POST/DELETE with a CSRF token, and re-authenticate for destructive actions.</details>

**B6.**
```js
if (!user) return res.status(404).json({ error: 'No account with that email' });
```
<details><summary>Answer</summary>User enumeration. Fix: the same status, message and similar timing as a wrong password.</details>

## Part C — Scenarios (2 points each)

**C1.** A scanner finds `https://app.example.com/.env` returns your database password. List your response, in order.
<details><summary>Answer</summary>Block the path immediately (proxy deny rule or remove the file). Rotate the exposed credentials. Check logs for who fetched it and whether the database was accessed. Fix the deployment so dotfiles never ship. Add a CI or scanner check to catch it next time.</details>

**C2.** Your team wants to add rich-text comments. What controls do you require before launch?
<details><summary>Answer</summary>Server-side sanitization with an allowlist (e.g. DOMPurify), safe URL schemes only, output through an auto-escaping template, a strict CSP without <code>'unsafe-inline'</code>, and tests showing scripts and <code>javascript:</code> links are removed.</details>

**C3.** Login failures jump from 200/hour to 40,000/hour across thousands of accounts and IPs. What is it, and what do you do?
<details><summary>Answer</summary>Credential stuffing. Tighten rate limits and bot defenses. Force resets or step-up authentication for accounts that logged in successfully, and invalidate their sessions. Check passwords against breach lists. Notify affected users and monitor for fraud.</details>

## Month 1 review (1 point each)

**R1.** What octal permission should a private SSH key have?
<details><summary>Answer</summary>600.</details>

**R2.** Why must passwords be hashed with a slow function instead of SHA-256?
<details><summary>Answer</summary>Fast hashes let attackers test billions of guesses per second. Argon2id or bcrypt make each guess expensive.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (Month 1 review is a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
