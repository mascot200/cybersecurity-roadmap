# Week 21 — Docker Security

> **Level:** Intermediate · **Time:** ~10 h · **Tracking:** [issue #10](https://github.com/mascot200/cybersecurity-roadmap/issues/10)
> **Lab files:** [`labs/hardened-deploy/api/Dockerfile`](labs/hardened-deploy/api/Dockerfile), [`compose.yaml`](labs/hardened-deploy/compose.yaml) (Compose validated with `docker compose config`)

## 🎯 Objectives

1. Explain what isolates a container from the host (namespaces, cgroups, capabilities, seccomp) and where that isolation is weak.
2. Write a Dockerfile that runs as a non-root user with a minimal, read-only runtime.
3. Apply runtime hardening: drop capabilities, `no-new-privileges`, read-only root filesystem, resource limits.
4. Recognize the dangerous options: `--privileged`, the Docker socket mount, host namespaces, sensitive host paths.
5. Verify the hardening on a running container.

## 🌍 Why it matters

A container is a process on the host with some walls around it, not a virtual machine. If the app inside
is compromised, those walls decide whether the attacker stays in one small box or reaches the host and
every other container. **Tesla (2018):** researchers found a Kubernetes console exposed without a password;
attackers had used it to run cryptomining containers and to reach cloud credentials. Defaults and
convenience options (privileged mode, mounting the Docker socket) are the usual way out of the box.

---

## 📖 Concepts

### 1. What isolates a container

| Mechanism | Does | Hardening lever |
|---|---|---|
| Namespaces | Separate view of processes, network, mounts, users, hostname | Don't share host namespaces (`--pid=host`, `--network=host`) |
| cgroups | Limit CPU, memory, PIDs | Set limits so one container can't starve the host |
| Capabilities | Split root's powers into ~40 pieces | `cap_drop: [ALL]`, add back only what's needed |
| seccomp | Filters system calls | Keep Docker's default profile (never `seccomp=unconfined`) |
| AppArmor/SELinux | Mandatory access control | Keep the default profile |
| User namespaces / rootless | Root inside ≠ root on host | Rootless Docker or `userns-remap` where possible |

All containers share the **host kernel**. A kernel vulnerability can break isolation, so patch hosts.

### 2. A hardened Dockerfile

From [`Dockerfile`](labs/hardened-deploy/api/Dockerfile):

| Practice | Line | Why |
|---|---|---|
| Pinned, small base | `ARG NODE_IMAGE=node:22-alpine` (pin by digest in real projects) | Fewer packages = fewer CVEs; reproducible |
| Multi-stage build | `FROM … AS deps` then a clean runtime stage | Build tools and caches don't ship |
| Production deps only, no install scripts | `npm ci --omit=dev --ignore-scripts` | Smaller, and dependency scripts don't run |
| Code owned by root, run as `node` | `COPY --chown=root:root …` then `USER node` | The app can't modify its own code |
| `.dockerignore` | excludes `.env`, `.git`, keys, `node_modules` | Secrets and history don't end up in layers |
| Healthcheck | `HEALTHCHECK … /healthz` | Orchestrator restarts unhealthy containers |
| Exec-form CMD | `CMD ["node", "server.js"]` | Signals reach the app (graceful shutdown) |

> Anything written in any layer stays in the image, even if a later layer deletes it. Never `COPY` a
> secret and `rm` it later. Use build secrets (`RUN --mount=type=secret`) when a build truly needs one.

### 3. Runtime hardening (Compose)

From [`compose.yaml`](labs/hardened-deploy/compose.yaml), applied with a YAML anchor:

```yaml
x-hardening: &hardening
  read_only: true
  cap_drop: [ALL]
  security_opt: [no-new-privileges:true]
```

| Option | Effect |
|---|---|
| `read_only: true` + `tmpfs: [/tmp]` | Attacker can't drop tools or modify files; only `/tmp` (in memory) is writable |
| `cap_drop: [ALL]` | No `NET_RAW` (packet crafting), `CHOWN`, `SETUID`… The API needs none of them |
| `no-new-privileges` | setuid binaries can't raise privileges |
| `deploy.resources.limits` (cpus, memory, pids) | Contains runaway processes and fork bombs |
| No `ports:` on `api`/`db` | Only reachable over internal Docker networks |

> Found while building this lab: Compose rejects `pids_limit` together with a `deploy.resources.limits`
> block ("can't set distinct values"), so the PID limit lives in `deploy.resources.limits.pids`.

### 4. The dangerous options

| Option | Why it's dangerous |
|---|---|
| `--privileged` | Disables almost all isolation: all capabilities, all devices. Effectively host root. |
| `-v /var/run/docker.sock:/var/run/docker.sock` | Lets the container control Docker, so it can start a privileged container. Host root. |
| `--pid=host`, `--network=host` | Sees or joins the host's processes or network stack |
| Mounting `/`, `/etc`, `/root`, `~/.ssh` | Direct access to host files |
| `--cap-add=SYS_ADMIN` | A very broad capability, close to privileged |
| `seccomp=unconfined`, `apparmor=unconfined` | Removes syscall and MAC filtering |

If a tool genuinely needs the Docker socket (CI runners, monitoring agents), isolate it on a dedicated host or use a socket proxy that allows only the needed API calls.

---

## 🧪 Lab — Build, run, verify (3–4 h)

```bash
cd curriculum/02-intermediate/month-06-docker-host-deployment-security/labs/hardened-deploy
(cd api && npm install)          # creates package-lock.json, which the Dockerfile needs
./scripts/setup.sh               # local DB password + self-signed cert (git-ignored)
docker compose up -d --build
./scripts/verify.sh              # PASS/FAIL for each hardening property
```

1. Get every `verify.sh` check to PASS. The script checks read-only filesystems, dropped capabilities, `no-new-privileges`, memory limits, a non-root UID, unwritable code, unpublished `api`/`db` ports, a database with no internet access, and HTTPS/HSTS/dotfile rules on the proxy.
2. **Compare with an unhardened run:** `docker run --rm -it node:22-alpine sh`, then inside run `id` and `cat /proc/self/status | grep Cap`. Do the same with `--user node --cap-drop ALL --read-only`. Decode the capability masks with `capsh --decode=<hex>` on the host.
3. **Remove one hardening option at a time** from `compose.yaml` and rerun `verify.sh`. Confirm the matching check fails.
4. Run [`hadolint`](https://github.com/hadolint/hadolint) on the Dockerfile and fix or justify each warning.

> ⚠️ This stack was validated with `docker compose config`, and the API was run against PostgreSQL. The
> images were not built and `verify.sh` was not run where this course was written (no Docker daemon was
> available), so step 1 is where you confirm it works end to end. Fix anything that doesn't.

---

## 📝 Assignment — Harden a Dockerfile and prove it

**Task:** harden a Dockerfile and verify the runtime identity and permissions.

1. Containerize your Month 3/5 API using the patterns above.
2. Record before/after evidence for: `id`, capabilities, writable paths, image size, and the number of OS packages.
3. Commit `CONTAINER_SECURITY.md` explaining each option and what it prevents, plus your `verify.sh` output.

### Acceptance criteria
- [ ] Runs as a non-root UID; code not writable by the app user
- [ ] Read-only root filesystem with only necessary tmpfs mounts
- [ ] All capabilities dropped; `no-new-privileges`
- [ ] CPU, memory and PID limits
- [ ] No secrets in image layers (check with `docker history` and by inspecting layers)
- [ ] Before/after evidence and explanations

---

## 💼 On the job

- Platform teams provide hardened base images and admission policies (Month 9) that reject privileged or root containers.
- Container reviews always start with: user, capabilities, mounts, network, and secrets.

## ⚠️ Common mistakes

- Running as root "because it works".
- Mounting the Docker socket into an app container.
- Publishing database ports to `0.0.0.0` for convenience. (Docker-published ports can bypass `ufw` rules.)
- Secrets in `ENV` instructions or copied into layers.
- Huge base images with compilers and shells the app never uses.

## 🥊 Drill (pass mark 8/10)

**1.** Is a container a security boundary as strong as a VM?
<details><summary>Answer</summary>No. Containers share the host kernel; isolation comes from namespaces, cgroups, capabilities and syscall filtering, which are weaker than hardware virtualization.</details>

**2.** Why does mounting the Docker socket equal host root?
<details><summary>Answer</summary>The container can tell Docker to start a new privileged container with the host filesystem mounted.</details>

**3.** What does `no-new-privileges` prevent?
<details><summary>Answer</summary>Processes gaining more privileges than their parent, e.g. through setuid binaries.</details>

**4.** Why own the app's files by root while running as `node`?
<details><summary>Answer</summary>A compromised app process can't modify its own code or dependencies.</details>

**5.** Why do secrets deleted in a later layer still leak?
<details><summary>Answer</summary>Each layer is stored in the image; the earlier layer still contains the file and can be extracted.</details>

**6.** What does `cap_drop: [ALL]` remove that matters for attackers?
<details><summary>Answer</summary>For example <code>NET_RAW</code> (raw packets, spoofing), <code>SETUID/SETGID</code>, <code>CHOWN</code>, <code>DAC_OVERRIDE</code>, and others root would normally have.</details>

**7.** Why set a PID limit?
<details><summary>Answer</summary>To stop fork bombs or runaway process creation from exhausting the host.</details>

**8.** Why use a multi-stage build?
<details><summary>Answer</summary>Build tools, caches and dev dependencies stay in the build stage, so the runtime image is smaller with fewer vulnerabilities.</details>

**9.** What's the risk of `ports: ["5432:5432"]` on a database?
<details><summary>Answer</summary>It listens on all host interfaces (and Docker's iptables rules can bypass ufw), exposing the database to the network.</details>

**10.** Scenario: a monitoring vendor asks you to run their agent with `--privileged`. What do you do?
<details><summary>Answer</summary>Ask exactly which capabilities and mounts it needs; grant only those (read-only where possible); run it on dedicated nodes if needed; document the accepted risk; prefer vendors that support least privilege.</details>

## ✅ Checklist
- [ ] Lab steps 1–4
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #10

## 📚 Resources
- Docker Engine security — <https://docs.docker.com/engine/security/>
- Docker rootless mode — <https://docs.docker.com/engine/security/rootless/>
- OWASP Docker Security Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html>
- CIS Docker Benchmark — <https://www.cisecurity.org/benchmark/docker>

---
[← Month overview](README.md) · [Next: Week 22 — Image & supply-chain security →](week-22-image-supply-chain.md)
