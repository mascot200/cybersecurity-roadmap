# Week 13 — Server-Side Request Forgery (SSRF)

> **Level:** Beginner · **Time:** ~10 h · **Tracking:** [issue #8](https://github.com/mascot200/cybersecurity-roadmap/issues/8)
> **Lab code:** [`labs/ssrf-guard/`](labs/ssrf-guard/) (tested: 27/27 passing, no network needed)

## 🎯 Objectives

1. Explain why a server fetching a user-supplied URL is a trust-boundary problem.
2. Find the features in an app that make server-side requests (webhooks, URL previews, imports, image fetchers, PDF renderers).
3. Implement a layered URL guard: parse, allowlist, resolve and check every IP, pin the address, no redirects.
4. Describe the infrastructure controls that limit SSRF impact: IMDSv2, egress filtering, least-privilege roles.
5. Prove the guard with tests that need no network access.

## 🌍 Why it matters

Your server sits inside your network. It can reach internal admin panels, databases, other services and,
in the cloud, the **instance metadata service** at `169.254.169.254`, which can hand out temporary
credentials. If a user can choose the URL your server fetches, they borrow that network position.

**Real-world scenario:** in the **Capital One breach (2019)**, an SSRF weakness in a misconfigured web
application firewall was used to obtain cloud credentials from the metadata service, which then allowed
access to storage buckets holding data on about 100 million customers. AWS later made **IMDSv2**
(session-token-based metadata) available, which blocks many SSRF paths to credentials.

---

## 📖 Concepts

### 1. Where SSRF hides

Any feature where the server makes an outbound request based on user input:

| Feature | Example input |
|---|---|
| Webhooks | "Notify this URL when an order ships" |
| Link previews / unfurling | URL pasted into a chat message |
| Import from URL | "Import CSV from URL", "Fetch avatar from URL" |
| Document/image rendering | HTML-to-PDF renderers that load external resources |
| Integrations | User-configured API base URLs |
| File parsers | XML external entities, SVG with external references (Week 14) |

### 2. Layered defense

![SSRF defense layers](images/ssrf-defense.svg)

| Layer | Control | Why one layer isn't enough |
|---|---|---|
| Parse | Use the platform URL parser; https only; no credentials; standard port | String checks miss encodings; the parser normalizes them |
| **Allowlist** | Exact hostnames from configuration | The strongest control, but some features (webhooks) can't use a fixed list |
| Resolve + check IPs | Resolve DNS and reject if **any** address is internal | A public-looking hostname can resolve to `127.0.0.1` or a private IP |
| Pin the address | Connect to the IP you checked, not a fresh lookup | **DNS rebinding:** the name can resolve differently between check and use |
| No redirects | Don't follow, or re-check every hop | A safe URL can redirect to an internal one |
| Limits | Timeouts, response-size caps, content-type checks | Limits slow scans and resource abuse |
| Infrastructure | IMDSv2, egress firewall/proxy, minimal IAM role | Limits damage if the app-level guard ever fails |

For features that can't use a fixed allowlist (user webhooks), send outbound requests through a
dedicated **egress proxy** in an isolated network segment that can only reach the internet.

### 3. The lab's guard

[`url-guard.js`](labs/ssrf-guard/url-guard.js) uses only Node built-ins:

- `new URL(input)` for parsing: decimal or other unusual IP encodings are normalized, so `https://2130706433/` becomes host `127.0.0.1`.
- `net.BlockList` with loopback, RFC 1918 private ranges, link-local (`169.254.0.0/16`, covering the metadata service), carrier-grade NAT, multicast/reserved, and IPv6 loopback, unique-local and link-local ranges.
- IPv4-mapped IPv6 (`::ffff:10.0.0.5`) is unwrapped and checked as IPv4.
- `dns.lookup(host, { all: true })`: **every** returned address must be allowed.
- Returns the vetted address so the caller can pin it.

**Tests** ([`url-guard.test.js`](labs/ssrf-guard/url-guard.test.js)) inject a fake DNS resolver, so they're
deterministic. They cover: a positive control; http, `file:`, unlisted host, credentials, non-standard port;
names resolving to the metadata IP, loopback, IPv6 loopback and mapped private IPv6; a name with one
public and one internal answer; literal and decimal-encoded internal IPs; and garbage input. Plus direct
block-list checks for 11 internal and 3 public addresses.

---

## 🧪 Lab — Guard, then pin (3 h)

```bash
cd curriculum/01-beginner/month-04-advanced-web-testing/labs/ssrf-guard
npm install && npx vitest run    # expect: 27 passed
```

1. **Read the guard and the tests.** For each rejected case, write which layer catches it. Some are caught by the allowlist *and* would be caught by the IP check. Why is that overlap useful?
2. **Mutation test:** remove `{ all: true }` and use only the first address; drop the IPv4-mapped unwrapping; remove the `169.254.0.0/16` entry. Which tests fail?
3. **Pin the address (extension):** write `safeGet(url)` that calls `assertSafeUrl`, then makes the request with `https.get` using a custom `lookup` option that returns the vetted address, keeps `servername` set to the hostname for TLS, treats any 3xx response as an error (`https.get` doesn't follow redirects, so don't add a library that does), applies a 5 s timeout, and caps the response at 2 MB. Test it against a local HTTPS server with a self-signed certificate.
4. **Cloud check (reading):** read the AWS docs on IMDSv2 and write three sentences on why requiring a session token blocks most SSRF-to-credentials paths.

---

## 📝 Assignment — Local-only SSRF scenarios and mitigations

**Task:** test controlled local-only scenarios and document mitigations.

1. Add an "import avatar from URL" endpoint to your Month 3 API that uses your `safeGet`.
2. Run two local services on `127.0.0.1` (a fake "internal admin" and a fake "metadata" endpoint returning dummy data). Write integration tests proving the import endpoint **cannot** reach either, and that an allowlisted local test host *can* be fetched (positive control).
3. Add tests for redirects: an allowed host that redirects to an internal URL must be refused.
4. Write `SSRF.md`: features in your app that make outbound requests, the controls on each, which layer stops which case, and the infrastructure controls you'd add in the cloud.

### Acceptance criteria
- [ ] Import endpoint uses the guard and pins the address
- [ ] Tests: internal services unreachable, allowed host reachable, redirect to internal refused, oversized response refused
- [ ] Mutation results recorded
- [ ] `SSRF.md` complete

---

## 💼 On the job

- Design reviews flag any "fetch a URL" feature early and route it through a shared, hardened HTTP client.
- Cloud security teams enforce IMDSv2 across accounts and restrict egress from application subnets.
- In assessments, SSRF findings are rated by what the server can reach: internal-only data or cloud credentials make it critical.

## ⚠️ Common mistakes

- Blocklisting strings (`localhost`, `127.0.0.1`) instead of checking resolved addresses.
- Checking only the first DNS answer, or resolving once for the check and again for the request.
- Following redirects without re-checking.
- Forgetting IPv6 and IPv4-mapped IPv6.
- Returning the fetched response body or detailed errors to the user, which turns a blind SSRF into a readable one.

## 🥊 Drill (pass mark 8/10)

**1.** Why is SSRF dangerous even when the client can't reach your internal network?
<details><summary>Answer</summary>The server makes the request from inside your network, so it can reach internal services and the cloud metadata service on the attacker's behalf.</details>

**2.** What is the strongest SSRF control when the set of destinations is known?
<details><summary>Answer</summary>An exact allowlist of hostnames (and schemes/ports) from configuration.</details>

**3.** Why must you check the resolved IP, not just the hostname?
<details><summary>Answer</summary>Any hostname can be made to resolve to an internal address.</details>

**4.** What is DNS rebinding and how do you defeat it?
<details><summary>Answer</summary>The name resolves to a safe IP during the check and an internal IP when the request is made. Defeat it by connecting to the exact IP you checked (pinning).</details>

**5.** Why check *every* DNS answer?
<details><summary>Answer</summary>A name can return several addresses, and the HTTP client might connect to an internal one.</details>

**6.** Which range contains the cloud metadata address?
<details><summary>Answer</summary>Link-local, <code>169.254.0.0/16</code> (the service is at <code>169.254.169.254</code>).</details>

**7.** How does IMDSv2 reduce SSRF risk?
<details><summary>Answer</summary>Metadata requests need a session token obtained with a PUT request and a custom header, which a typical SSRF (a simple GET) can't produce. A hop limit also keeps the token from leaving the instance.</details>

**8.** Why shouldn't the endpoint return the fetched content or detailed errors?
<details><summary>Answer</summary>It would let an attacker read internal responses or map the network from error differences.</details>

**9.** Name three app features that commonly cause SSRF.
<details><summary>Answer</summary>Any three of: webhooks, link previews, import from URL, avatar fetch from URL, HTML-to-PDF rendering, user-configured integrations, XML/SVG parsers.</details>

**10.** Scenario: product wants user-defined webhooks to any URL. What do you propose?
<details><summary>Answer</summary>Send webhooks from an isolated worker through an egress proxy that can only reach the public internet; apply the URL guard (https, resolved-IP checks, pinning, no redirects, timeouts); never return responses to users; sign webhook payloads; and rate-limit.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #8

## 📚 Resources
- OWASP SSRF Prevention Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html>
- AWS: Use IMDSv2 — <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html>
- Node.js `net.BlockList` — <https://nodejs.org/api/net.html#class-netblocklist>

---
[← Month overview](README.md) · [Next: Week 14 — File & parser risks →](week-14-file-parser-risks.md)
