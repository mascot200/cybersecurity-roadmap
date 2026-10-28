# Level 1 Checkpoint Drill — Months 1–4

> This is the **Level 1 gate**. Pass mark: **80% (32/40)** **and** the practical task.
> Time box: 75 minutes, no notes. Record your score on [issue #8](https://github.com/mascot200/cybersecurity-roadmap/issues/8) and the Level 1 epic [#2](https://github.com/mascot200/cybersecurity-roadmap/issues/2).
> Interactive version: ask Claude *"Give me the Level 1 checkpoint drill for my roadmap (Months 1–4), one question at a time, grade strictly."*

## Part A — Month 4 recall (1 point each)

**A1.** Why is SSRF dangerous even when clients can't reach your internal network?
<details><summary>Answer</summary>The server makes the request from inside the network, so it can reach internal services and the cloud metadata endpoint.</details>

**A2.** What does pinning the resolved IP defeat?
<details><summary>Answer</summary>DNS rebinding (the name resolving differently between check and use).</details>

**A3.** Which range contains the cloud metadata address?
<details><summary>Answer</summary>Link-local, <code>169.254.0.0/16</code>.</details>

**A4.** How should an upload's type be determined?
<details><summary>Answer</summary>From its content (magic bytes) against an allowlist, not the filename or Content-Type.</details>

**A5.** Why give uploads server-chosen names?
<details><summary>Answer</summary>To prevent path traversal and overwrites through crafted filenames.</details>

**A6.** What's the main fix for XXE?
<details><summary>Answer</summary>Disable DTDs and external entities in the parser (or use JSON).</details>

**A7.** What is a check-then-act race condition?
<details><summary>Answer</summary>Code reads a value, decides, then writes; concurrent requests all pass the check before any write.</details>

**A8.** What does an idempotency key prevent?
<details><summary>Answer</summary>The same logical operation (e.g. a payment) being processed twice on retries.</details>

## Part B — Months 1–3 recall (1 point each)

**B1.** Octal for `rw-r-----`?
<details><summary>Answer</summary>640.</details>

**B2.** Four certificate checks a browser performs?
<details><summary>Answer</summary>Trusted chain, hostname match, validity dates, proof of private-key possession.</details>

**B3.** Fix for SQL injection?
<details><summary>Answer</summary>Parameterized queries (allowlists for identifiers).</details>

**B4.** What do `HttpOnly` and `SameSite=Lax` each protect against?
<details><summary>Answer</summary>Script access to the cookie (XSS theft); cross-site requests carrying the cookie (CSRF).</details>

**B5.** Where must the tenant ID in a query come from?
<details><summary>Answer</summary>The verified identity on the server.</details>

**B6.** JWT checks besides the signature?
<details><summary>Answer</summary><code>exp</code>, <code>iss</code>, <code>aud</code>, pinned algorithm, required claims.</details>

## Part C — Review it (2 points each: 1 problem, 1 fix)

**C1.**
```js
const r = await fetch(req.body.imageUrl);
```
<details><summary>Answer</summary>SSRF: the server fetches any user-chosen URL. Fix: allowlist, resolved-IP checks with pinning, no redirects, timeouts and size limits; IMDSv2 and egress limits as backup.</details>

**C2.**
```js
res.sendFile(path.join(UPLOADS, req.params.name));
```
<details><summary>Answer</summary>Path traversal via <code>..</code>. Fix: strict name format (server-generated IDs) and check the resolved path stays inside the root; better, look up a DB record.</details>

**C3.**
```js
const { rows } = await db.query('SELECT seats FROM events WHERE id=$1', [id]);
if (rows[0].seats > 0) await db.query('UPDATE events SET seats=$2 WHERE id=$1', [id, rows[0].seats - 1]);
```
<details><summary>Answer</summary>Race condition (check-then-act) allows overselling. Fix: atomic <code>UPDATE … SET seats = seats - 1 WHERE id=$1 AND seats > 0 RETURNING</code> plus a <code>CHECK (seats >= 0)</code> constraint; concurrency test.</details>

**C4.**
```js
const total = req.body.price * req.body.quantity;
```
<details><summary>Answer</summary>Price taken from the client. Fix: look up prices server-side; validate quantity as a positive integer.</details>

**C5.**
```js
Object.assign(user, req.body);
```
<details><summary>Answer</summary>Mass assignment. Fix: strict schema, copy only allowlisted fields.</details>

**C6.**
```js
app.get('/invoices/:id', auth, async (req, res) =>
  res.json((await db.query('SELECT * FROM invoices WHERE id=$1', [req.params.id])).rows[0]));
```
<details><summary>Answer</summary>BOLA, plus a whole-row response. Fix: scope by tenant/owner from the identity, return 404 otherwise, output allowlist; matrix tests.</details>

## Part D — Scenarios (2 points each)

**D1.** Product wants "import a profile picture from any URL". What do you require?
<details><summary>Answer</summary>The URL guard (https only, resolved-IP checks, pinning, no redirects, limits), content-type checks on the result, storage via the upload pipeline, IMDSv2/egress limits, tests including internal and redirect cases.</details>

**D2.** A coupon can be used once per user, but support reports someone used it five times. What likely happened, and how do you fix it?
<details><summary>Answer</summary>Concurrent requests passed a check-then-act test. Fix: a unique <code>(coupon_id, user_id)</code> constraint inserted in the order transaction, and a concurrency test.</details>

**D3.** How do you show a developer that your remediation works?
<details><summary>Answer</summary>A regression test that failed before the fix and passes after, plus a check for the same pattern elsewhere.</details>

## Part E — Practical (required; pass/fail)

Within 30 minutes, in your own lab: run all three Month 4 lab test suites, then break **one** protection on
purpose (e.g. remove the IP block-list check, the path check, or the atomic update), show which test fails,
and restore it. Explain in two sentences what the failing test proves.

## Scoring

Part A 8 + Part B 6 + Part C 12 + Part D 6 = 32, plus **8 points** for the month project report
(rubric score ÷ 10 × 8, rounded). Total **40**. Pass: **≥ 32 and the practical**. Then close the Level 1 epic.
