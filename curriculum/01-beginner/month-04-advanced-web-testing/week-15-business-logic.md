# Week 15 — Business Logic

> **Level:** Beginner · **Time:** ~10 h · **Tracking:** [issue #8](https://github.com/mascot200/cybersecurity-roadmap/issues/8)
> **Lab code:** [`labs/booking/`](labs/booking/) (tested: 5/5 passing against PostgreSQL, mutation-checked)

## 🎯 Objectives

1. Identify the **invariants** of a workflow: the rules that must always hold (no overselling, pay once, steps in order).
2. Threat-model a payment or booking flow for misuse of legitimate features.
3. Enforce invariants on the server and in the database: atomic updates, constraints, idempotency keys, state machines.
4. Test invariants under **concurrency**, not just one request at a time.

## 🌍 Why it matters

Business-logic flaws are bugs in *what the application allows*, not in how it parses input. Every request
can be well-formed and authenticated, and the system still loses money: a coupon applied twice, a
negative quantity that produces a refund, a checkout step skipped, two simultaneous requests that both see
"1 seat left". Scanners almost never find these, because they need an understanding of the business.
OWASP lists them as **A06 Insecure Design** and **API6 Unrestricted Access to Sensitive Business Flows**.

---

## 📖 Concepts

### 1. Start from invariants

For a ticket booking and payment flow:

| Invariant | Enforced by |
|---|---|
| Seats sold ≤ seats available | Atomic conditional `UPDATE` + `CHECK (seats_left >= 0)` |
| One booking per user per event | `UNIQUE (event_id, user_id)` |
| A payment request charges at most once | Idempotency key with a `UNIQUE` constraint |
| Amounts are positive | Schema validation + `CHECK (amount_cents > 0)` |
| Price comes from the server | Look up the price; never accept it from the client |
| Steps happen in order (cart → pay → confirm) | Server-side state machine; each transition checks the current state |
| A coupon is used once | Unique `(coupon_id, user_id)` row inserted in the same transaction as the order |

**Put invariants in the database where you can.** Constraints hold no matter which code path, script or
future endpoint touches the data.

### 2. Race conditions (check-then-act)

```mermaid
sequenceDiagram
  participant A as Request A
  participant B as Request B
  participant DB as Database (1 seat left)
  A->>DB: SELECT seats_left → 1
  B->>DB: SELECT seats_left → 1
  A->>DB: UPDATE seats_left = 0, insert booking
  B->>DB: UPDATE seats_left = 0, insert booking
  Note over A,DB: Two bookings for one seat: both checks passed before either write
```

Fixes, from simplest to most general:

| Technique | Example |
|---|---|
| **Atomic conditional update** | `UPDATE events SET seats_left = seats_left - 1 WHERE id = $1 AND seats_left > 0 RETURNING …`, then `rowCount === 0` means sold out |
| **Constraints** | `UNIQUE`, `CHECK`: the second write fails |
| **Row lock** | `SELECT … FOR UPDATE` inside a transaction, then decide and write |
| **Serializable isolation** | `BEGIN ISOLATION LEVEL SERIALIZABLE` with retry on serialization failure |
| **Idempotency keys** | Client sends a unique key per logical operation; server stores it with a unique constraint |

The lab ([`booking.js`](labs/booking/booking.js)) uses an atomic conditional update for seats, a unique
constraint for one-booking-per-user (rolling back the seat decrement when it fires), and
`INSERT … ON CONFLICT (idempotency_key) DO NOTHING` for payments.

### 3. Misusing legitimate features

When threat-modeling a flow, ask for each step:

- **Order:** can steps be skipped, repeated or reordered?
- **Values:** what if quantities are zero, negative, huge or fractional? Who decides the price?
- **Limits:** what if this is done 1,000 times (coupons, invites, free trials, password resets, SMS sends)?
- **Timing:** what if two requests arrive at the same moment?
- **Identity:** can the user act on someone else's cart, order or account (Week 9)?
- **Reversal:** can refunds, cancellations or chargebacks be combined to gain value?

---

## 🧪 Lab — Prove the invariants under load (3 h)

```bash
docker run -d --name booking-pg -e POSTGRES_PASSWORD=labpass -p 127.0.0.1:5432:5432 postgres:16
docker exec -i booking-pg psql -U postgres -c "CREATE DATABASE booking_lab"
cd curriculum/01-beginner/month-04-advanced-web-testing/labs/booking
npm install
export DATABASE_URL=postgresql://postgres:labpass@127.0.0.1:5432/booking_lab
npx vitest run    # expect: 5 passed
```

What the tests in [`booking.test.js`](labs/booking/booking.test.js) prove:

| Test | Expected |
|---|---|
| one booking (positive control) | ok, 4 seats left |
| 20 simultaneous requests, 5 seats | exactly 5 bookings, 0 seats left |
| one user, 5 simultaneous requests | 1 booking, 4 seats left (no seats lost) |
| same idempotency key ×5 at once | 1 payment |
| negative amount | rejected by the database |

1. **Mutation test (important):** replace the atomic `UPDATE` with the check-then-act pattern: `SELECT seats_left`, `if <= 0` return, wait 20 ms, then `UPDATE … SET seats_left = <value - 1>`. Run the tests. When this course was built, the 20-concurrent test failed with this change, while the single-request test still passed. That's why concurrency tests matter.
2. Remove the `UNIQUE (event_id, user_id)` constraint. Which test fails, and what happens to `seats_left`?
3. Rewrite `bookSeat` using `SELECT … FOR UPDATE` instead of the conditional update. Confirm all tests still pass.
4. Add a coupon table and a `redeemCoupon` function that can be used once per user. Add a concurrent test.

---

## 📝 Assignment — Threat-model and test a workflow

**Task:** threat-model a payment or booking workflow and test its invariants in a local environment.

1. Pick a flow (checkout with coupons, appointment booking, wallet top-up and transfer).
2. Draw it as a state machine (Mermaid `stateDiagram-v2`) and list its invariants.
3. For each step, answer the misuse questions above. Record at least 8 misuse cases with impact and control.
4. Implement the flow (it can extend the lab) with database constraints, atomic updates, idempotency and a server-side state machine.
5. Write tests for every invariant, including at least two concurrency tests and one test that a step can't be skipped.

### Acceptance criteria
- [ ] State diagram and invariant list
- [ ] ≥ 8 misuse cases with impact and control
- [ ] Every invariant enforced server-side (preferably also in the database)
- [ ] Concurrency tests that fail when the protection is removed (mutation recorded)
- [ ] Step-order test

---

## 💼 On the job

- Fraud and abuse teams work closely with AppSec on these flows: promotions, referrals, payouts.
- Payment APIs (Stripe, Adyen) require idempotency keys for exactly this reason. Copy the pattern in your own APIs.
- Reviews of checkout and payout code focus on where prices come from, state transitions and concurrency.

## ⚠️ Common mistakes

- Trusting price, discount or total from the client.
- Validating each request in isolation and never testing two at once.
- Check-then-act logic in application code without locks or atomic updates.
- Business limits enforced only in the UI (e.g. a disabled button).

## 🥊 Drill (pass mark 8/10)

**1.** What is a business-logic flaw?
<details><summary>Answer</summary>A flaw in what the application allows (its rules and workflows) that lets someone misuse legitimate features, even with valid, well-formed requests.</details>

**2.** Why do scanners rarely find them?
<details><summary>Answer</summary>They require knowing the business rules (e.g. a coupon should be used once), which a generic scanner doesn't.</details>

**3.** What is a check-then-act race?
<details><summary>Answer</summary>Code reads a value, decides, then writes. Concurrent requests can all pass the check before any of them writes.</details>

**4.** Give the atomic SQL pattern for "decrement if available".
<details><summary>Answer</summary><code>UPDATE … SET n = n - 1 WHERE id = $1 AND n > 0 RETURNING …</code> and treat zero updated rows as "none left".</details>

**5.** What does an idempotency key do?
<details><summary>Answer</summary>It identifies one logical operation, so retries or duplicate submissions with the same key are only processed once.</details>

**6.** Why put invariants in database constraints too?
<details><summary>Answer</summary>Constraints hold for every code path, script and future endpoint, including ones that skip the application check.</details>

**7.** Where should an order's price come from?
<details><summary>Answer</summary>The server (database or pricing service), never from the client request.</details>

**8.** Why did the check-then-act mutation pass the single-request test?
<details><summary>Answer</summary>The bug only appears when requests overlap. One request at a time behaves correctly.</details>

**9.** How do you stop users skipping a workflow step?
<details><summary>Answer</summary>Keep the order's state on the server and only allow valid transitions (e.g. <code>pending_payment → paid</code>), checking the current state in each step.</details>

**10.** Scenario: a "refer a friend" bonus is being abused with fake accounts. Which controls help?
<details><summary>Answer</summary>Pay the bonus only after a qualifying action (verified payment), limit bonuses per user/device/payment method, detect linked accounts, delay payouts, and monitor for patterns.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #8

## 📚 Resources
- OWASP Business Logic Security Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html>
- OWASP API6: Unrestricted Access to Sensitive Business Flows — <https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/>
- PostgreSQL explicit locking — <https://www.postgresql.org/docs/current/explicit-locking.html>
- Stripe idempotent requests — <https://docs.stripe.com/api/idempotent_requests>

---
[← Week 14](week-14-file-parser-risks.md) · [Next: Week 16 — Assessment workflow →](week-16-assessment-workflow.md)
