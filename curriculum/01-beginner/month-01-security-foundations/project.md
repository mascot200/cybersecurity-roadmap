# Month 1 Project — Linux Hardening Baseline + Login API Threat Model

> Portfolio project **#1 (Linux hardening)** · builds on Weeks 1–4 · ~6 h on top of weekly assignments

## Scenario

You've joined a small fintech startup as its first security-minded engineer. They're about to launch a
login API on a single Ubuntu VM. The CTO asks you for two things before launch:

1. "Make sure the server isn't an easy target — and prove it."
2. "Tell me what could go wrong with our login, in order of how worried we should be."

## Part A — Hardening script + verification

Create `projects/linux-hardening/` in your journal repo.

### Step 1: Baseline (before)
Capture the starting state so you can show improvement:

```bash
mkdir -p evidence
{ date; id; sudo ss -tulpn; sudo ufw status verbose; sudo sshd -T | grep -Ei 'permitroot|passwordauth|pubkey|maxauth'; \
  find / -perm -4000 -type f 2>/dev/null; getent group sudo docker; } > evidence/before.txt 2>&1
```

### Step 2: Write an idempotent hardening script `harden.sh`
It must be safe to run twice. Minimum controls:

| # | Control | Why |
|---|---|---|
| 1 | Create admin user (if missing) and add to `sudo` | No daily root use |
| 2 | SSH drop-in config: no root login, no passwords, `AllowUsers`, `MaxAuthTries 3` | Stops password guessing & direct root |
| 3 | `ufw` default deny incoming, allow SSH from lab subnet only | Reduce attack surface |
| 4 | `unattended-upgrades` enabled | Patch known vulnerabilities |
| 5 | App service user `app` with `nologin` shell and its own dir `0750` | Least privilege for the app |
| 6 | `/srv/app/.env` owned by `app`, mode `0600` | Protect secrets |
| 7 | `umask 027` for the app user | Safe default permissions |

Skeleton:

```bash
#!/usr/bin/env bash
set -euo pipefail
ADMIN_USER="${ADMIN_USER:-opsadmin}"
LAB_SUBNET="${LAB_SUBNET:-192.168.56.0/24}"

log() { printf '[harden] %s\n' "$*"; }

if ! id "$ADMIN_USER" &>/dev/null; then
  log "creating $ADMIN_USER"; adduser --disabled-password --gecos "" "$ADMIN_USER"
fi
usermod -aG sudo "$ADMIN_USER"

install -m 0644 /dev/stdin /etc/ssh/sshd_config.d/10-hardening.conf <<EOF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers ${ADMIN_USER}
MaxAuthTries 3
X11Forwarding no
EOF
sshd -t && systemctl reload ssh

ufw default deny incoming
ufw default allow outgoing
ufw allow from "$LAB_SUBNET" to any port 22 proto tcp
ufw --force enable

apt-get install -y unattended-upgrades

id app &>/dev/null || useradd --system --create-home --home-dir /srv/app --shell /usr/sbin/nologin app
chmod 0750 /srv/app
# ... continue: .env permissions, umask
log "done"
```

> ⚠️ Make sure the admin user's `authorized_keys` is in place **before** running this, or you'll lock yourself out. Snapshot first.

### Step 3: Verification script `verify.sh`
Each check prints `PASS`/`FAIL`. Example:

```bash
check() { if eval "$2" &>/dev/null; then echo "PASS  $1"; else echo "FAIL  $1"; fi; }
check "root SSH login disabled"     "sshd -T | grep -qx 'permitrootlogin no'"
check "password auth disabled"      "sshd -T | grep -qx 'passwordauthentication no'"
check "firewall active"             "ufw status | grep -q 'Status: active'"
check "default deny incoming"       "ufw status verbose | grep -q 'deny (incoming)'"
check ".env not world readable"     "[ \$(stat -c %a /srv/app/.env) = 600 ]"
check "app user has no shell"       "getent passwd app | grep -q nologin"
```

Run `sudo ./verify.sh | tee evidence/after.txt`. Also prove from the host:
`ssh root@<vm>` → denied, `nmap -Pn <vm>` → only 22 open.

## Part B — Login API threat model

Extend your Week 3 assignment into `projects/login-threat-model/README.md`:

1. Data-flow diagram (Mermaid or image) with trust boundaries.
2. Asset list.
3. STRIDE table with ≥ 10 threats, scored with the risk matrix.
4. Top 5 threats with mitigations, verification method, and **which ones your Week 4 auth demo already covers** (link to the tests).
5. Residual risks and recommended next steps for the CTO (3 bullet executive summary).

## Deliverable checklist

- [ ] `harden.sh` runs twice without errors (idempotent)
- [ ] `verify.sh` → all PASS; `before.txt` and `after.txt` committed (sanitized: no real IPs/keys)
- [ ] README explains every control: *what, why, how verified*
- [ ] Threat model README with DFD, STRIDE table, top 5, residual risk, exec summary
- [ ] Links between threat-model mitigations and auth-demo tests
- [ ] Limitations section (e.g. no IDS, single host, no backups yet)

## Stretch goals

- Run **Lynis** (`sudo apt install lynis && sudo lynis audit system`) before/after; record the hardening index.
- Add `fail2ban` for SSH and show a ban in the logs.
- Convert `harden.sh` into an Ansible playbook.

## Grading rubric (self-assess)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Controls implemented | < 5 | 5–6 | all 7 |
| Verification | none | manual screenshots | automated PASS/FAIL + negative tests |
| Explanation | missing | what only | what + why + how verified |
| Threat model | < 5 threats | 5–9 | ≥ 10 + prioritized + residual risk |
| Professionalism | messy | readable | someone else could run & understand it |

**8+/10 = done.**
