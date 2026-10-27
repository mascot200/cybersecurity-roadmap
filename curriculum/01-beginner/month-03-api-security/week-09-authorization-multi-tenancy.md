# Week 9 — Authorization and Multi-Tenancy

> **Level:** Beginner · **Time:** ~10 h · **Tracking:** [issue #7](https://github.com/mascot200/cybersecurity-roadmap/issues/7)
> **Lab code:** [`labs/authz/`](labs/authz/) (tested: 28/28 passing, including the Week 12 matrix)

## 🎯 Objectives

1. Keep **authentication** (who is calling?) and **authorization** (may they do this?) as separate steps in code.
2. Write an explicit authorization policy for a multi-tenant API: tenant, role, ownership.
3. Enforce that policy in every query, with PostgreSQL Row-Level Security (RLS) as a safety net.
4. Prove isolation with tests covering every endpoint, every role, and another tenant's data.

## 🌍 Why it matters

In a multi-tenant SaaS product, all customers share one database. One query that forgets the tenant
filter can expose one customer's data to another. Broken object-level authorization is the top risk in
the [OWASP API Security Top 10](https://owasp.org/API-Security/), and scanners rarely catch it, because
a scanner can't know which records belong to whom. Only your tests can.

---

## 📖 Concepts

### 1. Three levels of authorization

![Authentication vs authorization](images/bola-idor.svg)

| Level | Question | What goes wrong | Where it's enforced in the lab |
|---|---|---|---|
| **Object** | May this caller access *this record*? | Records from another tenant or user are returned | Every query is scoped by `tenant_id` (and `owner_id` for members) |
| **Function** | May this caller use *this operation*? | A regular member can use admin-only operations | `DELETE` checks `role === 'admin'` first |
| **Property** | May this caller read or write *this field*? | Internal fields are returned, or the client can set them | Week 11: schema allowlists for input and output |

Status codes: `401` when the caller isn't authenticated. `403` when they're authenticated but the
*operation* isn't allowed. `404` when the *object* doesn't exist **or** isn't theirs, so you never
confirm that someone else's record exists.

### 2. Write the policy before the code

| Role | Read invoice | Update status | Delete |
|---|---|---|---|
| `admin` | Any invoice in their own tenant | Any in own tenant | Any in own tenant |
| `member` | Only invoices they own | Only their own | Not allowed |
| Everyone | Nothing in other tenants | Nothing | Nothing |

Design rules:
- **The tenant comes from the verified identity**, never from the URL, request body or a client-set header.
- **Deny by default.** Authentication middleware runs on every route; public routes are explicit exceptions.
- **One policy module.** The lab's `scope(user)` function is the only place that decides what a user can see. Handlers don't write their own `if` checks.
- **Unguessable IDs are not access control.** UUIDs make IDs harder to guess, but they still end up in URLs, logs, emails and exports. The check is still required.

### 3. How the lab enforces it

```mermaid
flowchart TB
  R[Request + Bearer token] --> AUTHN["authenticate()<br/>who is calling? → req.user<br/>(tenant_id, role, id)"]
  AUTHN -->|no / bad token| E401[401]
  AUTHN --> FN{"function-level check<br/>e.g. DELETE needs admin"}
  FN -->|not allowed| E403[403]
  FN --> Q["query scoped by scope(user)<br/>WHERE id = $1 AND tenant_id = $2 …"]
  Q --> RLS["PostgreSQL RLS<br/>only rows where tenant_id = app.tenant_id"]
  RLS -->|no row| E404[404]
  RLS --> OK[200 / 204]
```

The core pattern in [`app.js`](labs/authz/app.js):

```js
function scope(user) {
  return user.role === 'admin'
    ? { sql: 'tenant_id = $T', params: [user.tenant_id] }
    : { sql: 'tenant_id = $T AND owner_id = $O', params: [user.tenant_id, user.id] };
}
// every read/update/delete: WHERE id = $1 AND <scope(user)>
```

**Row-Level Security as defense in depth** ([`schema.sql`](labs/authz/schema.sql), [`db.js`](labs/authz/db.js)):
- The app connects as `api_app`, which is **not** the table owner. RLS doesn't apply to table owners.
- Each request runs in a transaction that sets `app.tenant_id` with `set_config(..., true)`, so the setting ends with the transaction.
- The policy compares `tenant_id` to `NULLIF(current_setting('app.tenant_id', true), '')::uuid`. The `NULLIF` matters: once a transaction-local setting ends, it reads back as `''`, not NULL, and casting `''` to uuid throws an error.
- If a developer later writes a query **without** the tenant filter, RLS still returns only that tenant's rows. A test proves this.

> **RLS is a safety net, not the authorization model.** It isolates tenants, but it can't express
> "only admins may delete" or "members see only their own invoices". Keep the policy in application
> code and use RLS to catch the query someone forgets to scope.

### 4. Test isolation the way a reviewer would

Fixtures: two tenants (Acme, Globex), an admin and a member in Acme, an admin in Globex, and invoices
owned by each. The tests in [`authz.test.js`](labs/authz/authz.test.js) cover:

| Test | What it proves |
|---|---|
| requires authentication | No token → 401 |
| admin reads own-tenant invoice | **Positive control**: legitimate access works |
| cross-tenant read / update / delete | Another tenant's invoice → 404, and the data is unchanged |
| member reads colleague's invoice | Ownership rule enforced → 404 |
| member deletes | Function-level rule → 403 |
| RLS hides other tenants without a filter | The safety net works on its own |
| RLS returns nothing when no tenant is set | It fails closed |

Always assert on the **database state** after a blocked write, not only the status code. A handler can
return 404 *after* it has already changed the row.

---

## 🧪 Lab — Run, read, extend (3–4 h)

```bash
docker run -d --name authz-pg -e POSTGRES_PASSWORD=labpass -p 127.0.0.1:5432:5432 postgres:16
docker exec -i authz-pg psql -U postgres -c "CREATE DATABASE authz_lab"
cd curriculum/01-beginner/month-03-api-security/labs/authz   # or copy into your journal repo
npm install
export ADMIN_DATABASE_URL=postgresql://postgres:labpass@127.0.0.1:5432/authz_lab
export DATABASE_URL=postgresql://api_app:api_app_pw@127.0.0.1:5432/authz_lab
npx vitest run    # expect: 2 test files, 28 passed (9 in authz.test.js + 19 matrix rows)
```

1. **Read the code in order:** `schema.sql` → `db.js` → `auth.js` → `app.js` → `authz.test.js`. Draw the request flow from memory.
2. **Prove the tests protect you (mutation testing).** Make one change at a time, rerun, and record which test fails:
   - change the `GET` query to look up by ID only: `db.query('SELECT * FROM invoices WHERE id = $1', [id])`.
     Expected: the cross-tenant tests **still pass** (RLS catches them), but *member reads colleague's
     invoice* fails, because RLS doesn't know about ownership. (Deleting only the `AND ${where}` text
     isn't a clean mutation: the leftover parameters make every query error out with a 500.)
   - remove the `role !== 'admin'` check in `DELETE`
   - in `scope()`, give members the admin branch
   - connect the app as `postgres` (the table owner) instead of `api_app`, and remove the tenant filter from a query

   If a change doesn't break any test, that's a gap in your tests. Write the missing test.
3. **Add a list endpoint** `GET /invoices` that returns only what the caller may see. Write the tests first: admin sees both Acme invoices, member sees only their own, Globex sees only theirs.
4. **Add an audit log** table (`who, action, invoice_id, tenant_id, at`) and record denied attempts as well as allowed ones. You'll use this in Month 10.

---

## 📝 Assignment — Prove tenant isolation

**Task:** test that one tenant cannot access another tenant's resources by changing resource identifiers.

1. Write an **authorization matrix** for every endpoint (including your new list endpoint): rows are endpoints, columns are roles × (own record, colleague's record, other tenant's record), and each cell holds the expected status.
2. Turn the matrix into a **table-driven test**, one test case per cell, generated from a data array.
3. Add a `POST /invoices` endpoint. The tenant and owner come from `req.user`, never from the body. Test that a body containing `tenant_id` is rejected or ignored.
4. Document the model in `labs/authz/README.md`: roles, policy table, where it's enforced, how RLS fits in, and the limitations.

### Acceptance criteria
- [ ] Authorization matrix covers every endpoint × role × ownership case
- [ ] Table-driven tests generated from the matrix, all passing
- [ ] Blocked writes are verified against database state, not just status codes
- [ ] At least 4 mutations recorded, each caught by a test
- [ ] README documents the model, the enforcement points and RLS

---

## 💼 On the job

- **Design review:** "Where does the tenant ID come from?" is one of the first questions to ask about any multi-tenant API.
- **Code review:** look for queries that use an ID from the request without the caller's tenant or ownership in the `WHERE` clause, and for admin routes with no role check.
- **Retesting a pentest finding:** a fix is accepted when a regression test shows the other tenant's request is denied and the data is unchanged.

## ⚠️ Common mistakes

- Taking `tenantId` from the request body or a header.
- Checking ownership on reads but forgetting updates and deletes.
- Returning `403` for other tenants' objects, which confirms they exist (use `404`).
- Testing only the positive path, or only the status code.
- Treating RLS (or UUIDs) as a replacement for application authorization.

## 🥊 Drill (pass mark 8/10)

**1.** What's the difference between a 401 and a 403?
<details><summary>Answer</summary>401: the caller isn't authenticated (no or invalid credentials). 403: the caller is authenticated but not allowed to perform the operation.</details>

**2.** Why return 404 rather than 403 when a user requests another tenant's invoice?
<details><summary>Answer</summary>403 confirms the object exists. 404 treats "doesn't exist" and "not yours" the same, so nothing leaks.</details>

**3.** Where must the tenant ID used in queries come from?
<details><summary>Answer</summary>The verified identity (session or validated token) on the server, never from client-controlled input.</details>

**4.** Name the three levels of authorization.
<details><summary>Answer</summary>Object level (this record), function level (this operation), property level (this field).</details>

**5.** Why doesn't RLS apply when the app connects as the table owner?
<details><summary>Answer</summary>PostgreSQL skips RLS policies for table owners (and superusers) unless the table uses <code>FORCE ROW LEVEL SECURITY</code>. The app should connect as a separate, non-owner role.</details>

**6.** Why does the lab's policy wrap `current_setting` in `NULLIF(..., '')`?
<details><summary>Answer</summary>After a transaction-local setting ends, <code>current_setting(..., true)</code> returns an empty string, and casting <code>''</code> to uuid raises an error. <code>NULLIF</code> turns it into NULL, so the policy matches no rows. It fails closed instead of erroring.</details>

**7.** Do UUIDs fix authorization bugs?
<details><summary>Answer</summary>No. They make IDs harder to guess, but IDs leak through URLs, logs and shared links. The server must still check access on every request.</details>

**8.** A blocked update returns 404. Why should the test also query the database?
<details><summary>Answer</summary>The handler might change the row and then return 404. Only checking the stored data proves the write was blocked.</details>

**9.** What can RLS *not* enforce in this lab?
<details><summary>Answer</summary>Role and ownership rules inside a tenant: "only admins delete" and "members see only their own invoices". Those stay in application code.</details>

**10.** Scenario: a teammate adds `GET /invoices/export?tenantId=...` for an admin dashboard. What do you ask for in review?
<details><summary>Answer</summary>Take the tenant from <code>req.user</code>, not the query string. Require the admin role. Scope the query through the shared policy. Add matrix tests, including another tenant's ID. Log the export in the audit log.</details>

## ✅ Checklist
- [ ] Lab tests pass; mutations recorded
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #7

## 📚 Resources
- OWASP API Security Top 10 — <https://owasp.org/API-Security/>
- OWASP Authorization Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html>
- PostgreSQL Row Security Policies — <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

---
[← Month overview](README.md) · [Next: Week 10 — Tokens & identity protocols →](week-10-tokens-identity-protocols.md)
