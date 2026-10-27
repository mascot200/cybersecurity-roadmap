# Month 3 Drill — Backend and API Security

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #7](https://github.com/mascot200/cybersecurity-roadmap/issues/7).
> Interactive version: ask Claude *"Drill me on Month 3 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** What is #1 in the OWASP API Security Top 10?
<details><summary>Answer</summary>Broken Object Level Authorization (BOLA).</details>

**A2.** Which status code for "authenticated, but this operation isn't allowed"?
<details><summary>Answer</summary>403.</details>

**A3.** Which JWT claims must an API check besides the signature?
<details><summary>Answer</summary><code>exp</code>, <code>iss</code>, <code>aud</code> (plus <code>nbf</code> if present, and required claims like <code>sub</code>).</details>

**A4.** What does PKCE protect?
<details><summary>Answer</summary>The authorization code: it can't be exchanged without the original code verifier.</details>

**A5.** Which zod method rejects unknown fields?
<details><summary>Answer</summary><code>.strict()</code>.</details>

**A6.** Does PostgreSQL RLS apply to the table owner by default?
<details><summary>Answer</summary>No, unless the table has <code>FORCE ROW LEVEL SECURITY</code>. The app should connect as a non-owner role.</details>

**A7.** Status code for an oversized request body?
<details><summary>Answer</summary>413.</details>

## Part B — Review the code (2 points each: 1 problem, 1 fix)

**B1.**
```js
app.get('/projects/:id', authenticate, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  res.json(rows[0]);
});
```
<details><summary>Answer</summary>No authorization: any authenticated user can read any project. Fix: scope the query by the caller's tenant (and ownership if required), return 404 when no row matches, and add matrix tests.</details>

**B2.**
```js
const tenantId = req.headers['x-tenant-id'];
```
<details><summary>Answer</summary>The tenant comes from a client-controlled header. Fix: take it from the verified identity (token claims or a server-side user lookup).</details>

**B3.**
```js
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url'));
req.user = payload;
```
<details><summary>Answer</summary>The token is decoded, not verified. Fix: verify with a JWT library, a trusted key, a pinned algorithm and issuer/audience/expiry checks.</details>

**B4.**
```js
await db.users.update(req.user.id, req.body);
res.json(await db.users.find(req.user.id));
```
<details><summary>Answer</summary>Mass assignment (the body can set any column) and an unfiltered response (internal fields leak). Fix: a strict input schema and an output allowlist.</details>

**B5.**
```js
app.get('/export', authenticate, async (req, res) => {
  const limit = Number(req.query.limit);
  res.json(await db.query('SELECT * FROM orders LIMIT $1', [limit]));
});
```
<details><summary>Answer</summary>No page-size cap, no tenant scoping, and no rate limit on an expensive endpoint. Fix: validate and cap <code>limit</code>, scope by tenant, rate-limit, and consider an async export job.</details>

**B6.**
```js
jwtVerify(token, key)   // no options
```
<details><summary>Answer</summary>No issuer, audience or algorithm restrictions. Fix: pass <code>issuer</code>, <code>audience</code>, <code>algorithms</code> and <code>requiredClaims</code>.</details>

## Part C — Scenarios (2 points each)

**C1.** Your team will add a mobile app that calls the API. Which OAuth flow, and which three controls do you require?
<details><summary>Answer</summary>Authorization Code with PKCE. Controls: exact-match redirect URIs, the <code>state</code> parameter, and short-lived access tokens with rotating refresh tokens (plus minimal scopes).</details>

**C2.** A refactor removed the tenant filter from one query, but RLS is enabled. What still protects you, and what doesn't?
<details><summary>Answer</summary>RLS still prevents cross-tenant reads. It doesn't enforce role or ownership rules inside the tenant, so a member may now see colleagues' records. The matrix tests should catch this.</details>

**C3.** How would you show an auditor that tenant isolation works?
<details><summary>Answer</summary>The written policy table, the authorization matrix tests running in CI as a required check, recorded mutation results, and RLS configuration as a second layer.</details>

## Month 2 review (bonus, 1 point each)

**R1.** What's the fix for SQL injection?
<details><summary>Answer</summary>Parameterized queries (with allowlists for identifiers).</details>

**R2.** Does CORS prevent CSRF?
<details><summary>Answer</summary>No. It controls reading responses, not sending requests.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
