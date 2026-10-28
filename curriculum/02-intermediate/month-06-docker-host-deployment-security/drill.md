# Month 6 Drill — Docker, Linux and Deployment Security

> Pass mark: **80% (20/25)**. Time box: 45 minutes, no notes.
> Record your score on [issue #10](https://github.com/mascot200/cybersecurity-roadmap/issues/10).
> Interactive version: ask Claude *"Drill me on Month 6 of my roadmap, one question at a time, grade strictly."*

## Part A — Recall (1 point each)

**A1.** Which Compose option makes a container's root filesystem read-only?
<details><summary>Answer</summary><code>read_only: true</code>.</details>

**A2.** Which option stops setuid binaries from raising privileges?
<details><summary>Answer</summary><code>security_opt: [no-new-privileges:true]</code>.</details>

**A3.** What does SBOM stand for?
<details><summary>Answer</summary>Software Bill of Materials.</details>

**A4.** Which Docker network setting removes internet access?
<details><summary>Answer</summary><code>internal: true</code>.</details>

**A5.** Which command shows sshd's effective configuration?
<details><summary>Answer</summary><code>sshd -T</code>.</details>

**A6.** Which tool bans IPs after repeated failed logins?
<details><summary>Answer</summary>fail2ban.</details>

**A7.** Where should a container read secrets from (lab pattern)?
<details><summary>Answer</summary>Mounted files, e.g. <code>/run/secrets/&lt;name&gt;</code> via <code>*_FILE</code> variables (or a secrets manager).</details>

## Part B — Review it (2 points each: 1 problem, 1 fix)

**B1.**
```yaml
services:
  agent:
    image: vendor/agent
    volumes: ["/var/run/docker.sock:/var/run/docker.sock"]
```
<details><summary>Answer</summary>Docker socket access equals host root. Fix: avoid it; if required, use a socket proxy limited to needed API calls, on a dedicated host, with documented risk.</details>

**B2.**
```dockerfile
FROM node:22
COPY . .
RUN npm install
ENV DB_PASSWORD=prod-secret
CMD npm start
```
<details><summary>Answer</summary>Runs as root; copies everything (possibly <code>.env</code>, <code>.git</code>); dev dependencies and install scripts; secret baked into the image; shell-form CMD. Fix: multi-stage, <code>.dockerignore</code>, <code>npm ci --omit=dev --ignore-scripts</code>, <code>USER node</code>, runtime secrets, exec-form CMD.</details>

**B3.**
```yaml
  db:
    image: postgres:16
    ports: ["5432:5432"]
```
<details><summary>Answer</summary>Database exposed on all host interfaces (and Docker bypasses ufw). Fix: no published port; internal network only.</details>

**B4.**
```nginx
server {
  listen 443 ssl;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  location / { proxy_pass http://api; }
}
```
<details><summary>Answer</summary>Old TLS versions enabled; no HSTS or security headers; no body/rate limits; version not hidden. Fix: TLS 1.2/1.3 only, add headers, <code>server_tokens off</code>, limits.</details>

**B5.** `app.set('trust proxy', true)` on an API reachable directly from the internet.
<details><summary>Answer</summary>Clients can spoof <code>X-Forwarded-For</code> to fake their IP and evade IP-based limits. Fix: make the API reachable only through the proxy and trust exactly that hop.</details>

**B6.** Image pinned as `FROM node:22-alpine` with no automated updates.
<details><summary>Answer</summary>Tag can change underneath you, and nothing rebuilds for patches. Fix: pin by digest and let Dependabot/Renovate update it; rebuild regularly.</details>

## Part C — Scenarios (2 points each)

**C1.** A new critical CVE is announced in a common library. How do you find out which of your images are affected within an hour?
<details><summary>Answer</summary>Query stored SBOMs (or rescan images/registry with Grype/Trivy) for the package and versions, then prioritize internet-facing services.</details>

**C2.** An attacker gets code execution in your API container. Which of this month's controls limit what they can do next?
<details><summary>Answer</summary>Non-root user, read-only filesystem, dropped capabilities, no-new-privileges, code not writable, no Docker socket, network segmentation (DB only via app credentials, no internet from backend), least-privilege DB role, resource limits.</details>

**C3.** Your verification script shows `FAIL /etc/shadow not world-readable` but `ls -l` shows `-rw-r-----`. What do you suspect?
<details><summary>Answer</summary>A bug in the check itself (e.g. treating <code>0640</code> as octal in shell arithmetic). Test the test: fix the check and confirm it passes on a correct file and fails on a wrong one.</details>

## Month 5 review (bonus, 1 point each)

**R1.** Why pin GitHub Actions to commit SHAs?
<details><summary>Answer</summary>Tags can be moved to malicious code; SHAs can't change.</details>

**R2.** First step when a secret is found in git history?
<details><summary>Answer</summary>Revoke and rotate it.</details>

## Scoring

Part A 7 + Part B 12 + Part C 6 = 25 (review questions are a bonus, up to 2 points). Below 20? Re-study the weeks behind your misses. See [drill guidance](../../../docs/drills.md#scoring-and-what-to-do-with-a-low-score).
