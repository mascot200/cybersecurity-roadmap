# Month 1 Drill — Security Foundations

> Pass mark: **80% (24/30)**. Time box: 45 minutes. No notes for Part A–C; Part D is hands-on.
> Record your score on [issue #5](https://github.com/mascot200/cybersecurity-roadmap/issues/5).
> Want it interactive? Ask Claude: *"Drill me on Month 1 of my cybersecurity roadmap, one question at a time, grade strictly."*

## Part A — Rapid recall (1 point each)

**A1.** What does `chmod 640 file` grant?
<details><summary>Answer</summary>Owner read/write, group read, others nothing.</details>

**A2.** Which file holds password hashes on Linux?
<details><summary>Answer</summary><code>/etc/shadow</code>.</details>

**A3.** Which port and protocol does DNS mainly use?
<details><summary>Answer</summary>53, UDP (TCP for large responses/zone transfers; also DoH over 443).</details>

**A4.** What range is `10.0.0.0/8`?
<details><summary>Answer</summary>10.0.0.0–10.255.255.255, private (RFC 1918).</details>

**A5.** What HTTP status code means "authenticated but not allowed"?
<details><summary>Answer</summary>403 Forbidden (401 means not authenticated).</details>

**A6.** Name the 6 STRIDE categories.
<details><summary>Answer</summary>Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.</details>

**A7.** Which Node.js API generates secure random tokens?
<details><summary>Answer</summary><code>crypto.randomBytes()</code> (or <code>crypto.randomUUID()</code> for IDs).</details>

**A8.** What cookie attribute stops JavaScript from reading a cookie?
<details><summary>Answer</summary><code>HttpOnly</code>.</details>

**A9.** What's the recommended password-hashing algorithm family per OWASP?
<details><summary>Answer</summary>Argon2id first; scrypt, bcrypt (and PBKDF2 for FIPS) as alternatives.</details>

**A10.** What does the sticky bit on `/tmp` do?
<details><summary>Answer</summary>Only a file's owner (or root) can delete/rename it in that directory.</details>

## Part B — Explain (2 points each: 1 for the key idea, 1 for precision)

**B1.** Explain the difference between hashing and encryption to a junior developer, with one correct use for each.
<details><summary>Answer</summary>Hashing is one-way (can't recover input) — used for password storage (slow hash) or integrity checks. Encryption is reversible with a key — used for confidential data at rest/in transit. Passwords must be hashed, not encrypted.</details>

**B2.** Explain what the browser validates during a TLS handshake.
<details><summary>Answer</summary>Certificate chains to a trusted root CA; hostname matches SAN; not expired/not yet valid; server proves private-key possession (CertificateVerify); optionally revocation. Then keys are derived via (EC)DHE.</details>

**B3.** Explain defense in depth using a SQL injection example.
<details><summary>Answer</summary>Layers: input validation, parameterized queries, least-privilege DB role (no DROP/superuser), WAF, monitoring for SQL errors, encrypted sensitive columns. If one fails, others limit the damage or detect it.</details>

**B4.** Why should every security control have a *negative* test?
<details><summary>Answer</summary>A control is only proven when the disallowed action actually fails. Positive tests show the feature works; negative tests show the restriction works (and catch "passes for the wrong reason" cases).</details>

## Part C — Spot the bug (2 points each)

**C1.**
```
# /etc/ssh/sshd_config.d/99-custom.conf
PermitRootLogin yes
PasswordAuthentication yes
```
<details><summary>Answer</summary>Root can log in remotely and passwords are accepted → brute force/credential stuffing directly to root. Fix: <code>PermitRootLogin no</code>, <code>PasswordAuthentication no</code>, key-only, <code>AllowUsers</code>.</details>

**C2.**
```js
const hash = crypto.createHash('md5').update(password).digest('hex');
await db.query('INSERT INTO users(email, pw) VALUES ($1, $2)', [email, hash]);
```
<details><summary>Answer</summary>MD5 is fast and broken; no salt. Use Argon2id/bcrypt via a vetted library. (The parameterized query is fine.)</details>

**C3.**
```js
res.cookie('sid', sid, { httpOnly: false, secure: false, maxAge: 365*24*3600*1000 });
```
<details><summary>Answer</summary>Readable by JS (XSS can steal), sent over HTTP (sniffable), valid for a year, no SameSite. Fix: <code>httpOnly: true, secure: true, sameSite: 'lax'</code>, short lifetime + server-side expiry.</details>

**C4.** Security group: `Inbound: TCP 6379 from 0.0.0.0/0`
<details><summary>Answer</summary>Redis exposed to the internet (often unauthenticated) → data theft, and historically RCE via config abuse. Restrict to app security group/private subnet only.</details>

## Part D — Hands-on (time box 15 min, 4 points)

On your lab VM, without notes:
1. Create user `drilluser` (1 pt)
2. Create `/srv/drill/secret.txt` that only `drilluser` can read (1 pt)
3. Prove another user can't read it (1 pt)
4. Show which process is listening on port 22 and which user it runs as (1 pt)

<details><summary>Reference solution</summary>

```bash
sudo adduser --disabled-password --gecos "" drilluser
sudo mkdir -p /srv/drill && echo s3cret | sudo tee /srv/drill/secret.txt >/dev/null
sudo chown drilluser:drilluser /srv/drill/secret.txt && sudo chmod 600 /srv/drill/secret.txt
sudo -u drilluser cat /srv/drill/secret.txt   # works
cat /srv/drill/secret.txt                     # Permission denied
sudo ss -tlpn 'sport = :22'; ps -o user,pid,cmd -C sshd
```
</details>

## Scoring
Part A 10 + Part B 8 + Part C 8 + Part D 4 = **30**. Below 24? See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
