# Week 23 — Linux Host Hardening

> **Level:** Intermediate · **Time:** ~10 h · **Tracking:** [issue #10](https://github.com/mascot200/cybersecurity-roadmap/issues/10)
> **Lab file:** [`labs/host-hardening/verify-host.sh`](labs/host-hardening/verify-host.sh): read-only PASS/FAIL checks (run and debugged; see notes)

## 🎯 Objectives

1. Apply a documented hardening baseline to an Ubuntu host: SSH, firewall, patching, brute-force protection, auditing, accounts and file permissions.
2. Verify the baseline automatically and repeatably.
3. Run services with least privilege using systemd sandboxing.
4. Review logs for security-relevant events.

## 🌍 Why it matters

Month 1 hardened SSH on one VM by hand. A real server needs a **baseline** that is written down, applied
the same way every time, and checked continuously, because manual changes drift. Internet-facing hosts
see automated SSH login attempts within minutes of getting a public IP, and unpatched services with
public exploits are among the most common ways in.

---

## 📖 Concepts

### 1. The baseline

| Area | Control | Command / file |
|---|---|---|
| SSH | Keys only, no root, few auth tries, no X11 | `/etc/ssh/sshd_config.d/10-hardening.conf` (Month 1) |
| Firewall | Default deny inbound; allow only needed ports from needed sources | `ufw default deny incoming`, `ufw allow from <admin-net> to any port 22` |
| Patching | Automatic security updates; reboot window for kernel updates | `unattended-upgrades`, `/var/run/reboot-required` |
| Brute force | Ban repeated failures | `fail2ban` with the `sshd` jail |
| Auditing | Record security-relevant system events | `auditd` + rules (identity files, sudoers, SSH config) |
| Accounts | Only root has UID 0; no empty passwords; remove unused accounts | `/etc/passwd`, `/etc/shadow` |
| Files | No world-writable files; protect `/etc/shadow`; review SUID binaries | `find / -perm -0002`, `find / -perm -4000` |
| Services | Disable what isn't needed; review listening ports | `systemctl disable --now <svc>`, `ss -tlnp` |
| Time | Correct time sync for log correlation | `timedatectl` |

Use a published benchmark (CIS Ubuntu Benchmark) as the reference, and record where you deliberately deviate.

### 2. Docker and the host firewall

Docker writes its own iptables rules for published ports, which are evaluated **before** ufw's rules. A
container published as `-p 5432:5432` can be reachable even though `ufw` says port 5432 is denied. Fixes:
publish only on `127.0.0.1` (as in the lab's `compose.yaml`), publish only the reverse proxy, or manage
rules in the `DOCKER-USER` chain.

### 3. systemd sandboxing for non-container services

```ini
[Service]
User=app
Group=app
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
CapabilityBoundingSet=
ReadWritePaths=/var/lib/myapp
```

`systemd-analyze security <unit>` scores a service's exposure and lists options to tighten.

### 4. auditd rules worth having

```bash
# /etc/audit/rules.d/hardening.rules
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/sudoers -p wa -k sudoers
-w /etc/sudoers.d/ -p wa -k sudoers
-w /etc/ssh/sshd_config -p wa -k sshd_config
-w /etc/ssh/sshd_config.d/ -p wa -k sshd_config
```

Search: `sudo ausearch -k identity --start today`, summarize: `sudo aureport --summary`.

### 5. Verifying the baseline

[`verify-host.sh`](labs/host-hardening/verify-host.sh) only reads; it changes nothing. It checks SSH settings
(via `sshd -T`), ufw state, unattended-upgrades, pending reboot, fail2ban and its sshd jail, auditd, UID 0
accounts, empty password hashes, `/etc/shadow` permissions, world-writable files, and listening ports.

Bugs found and fixed while building it (good examples of why you test your tests):
- The first version checked `/etc/shadow` with shell arithmetic on `0640`, which is read as an **octal** number, so a correctly protected file failed. It now checks the "others" read bit in `stat -c %A`.
- `ss` isn't installed on every system, so the port check now warns and skips instead of failing silently.

---

## 🧪 Lab — Baseline, verify, watch (3–4 h)

1. Snapshot your VM. Run `sudo ./verify-host.sh` and save the output as `before.txt`.
2. Apply the baseline (extend your Month 1 `harden.sh`): ufw, unattended-upgrades, fail2ban with the sshd jail, auditd with the rules above.
3. Run `verify-host.sh` again until everything passes (or you've written down why an item doesn't apply). Save `after.txt`.
4. Trigger fail2ban from your host with a few failed SSH logins (to your own VM only). Confirm the ban: `sudo fail2ban-client status sshd`. Unban yourself: `sudo fail2ban-client set sshd unbanip <ip>`.
5. Edit `/etc/ssh/sshd_config.d/10-hardening.conf` (add a comment), then find the event with `ausearch -k sshd_config`.
6. Sandbox a small service with the systemd options above and compare `systemd-analyze security` scores before and after.

---

## 📝 Assignment — Apply a hardening checklist to a lab host

**Task:** apply a documented hardening checklist to a lab host.

`HOST_HARDENING.md` with: the checklist (area, control, why, how verified), `before.txt` and `after.txt`,
deviations from CIS with reasons, and the fail2ban and auditd evidence.

### Acceptance criteria
- [ ] Baseline applied by script (idempotent)
- [ ] `verify-host.sh` passes, or each failure is justified
- [ ] fail2ban ban observed and auditd event found
- [ ] One service sandboxed with an improved `systemd-analyze security` score
- [ ] Documented deviations

---

## 💼 On the job

- Infrastructure teams bake the baseline into images (Packer, golden AMIs) and enforce it with configuration management (Ansible).
- Continuous compliance tools (Lynis, OpenSCAP, cloud posture tools) report drift.

## ⚠️ Common mistakes

- Hardening by hand on each server.
- Forgetting that Docker bypasses ufw for published ports.
- Locking yourself out (always keep a session open and a snapshot ready).
- Collecting audit logs that nobody reads or forwards (Month 10).

## 🥊 Drill (pass mark 8/10)

**1.** Why does Docker bypass ufw?
<details><summary>Answer</summary>Docker inserts its own iptables rules for published ports, which are matched before ufw's rules.</details>

**2.** What does fail2ban do?
<details><summary>Answer</summary>Watches logs for repeated failures (e.g. SSH logins) and temporarily blocks the source IP with firewall rules.</details>

**3.** What does `-w /etc/shadow -p wa -k identity` record?
<details><summary>Answer</summary>Writes and attribute changes to <code>/etc/shadow</code>, tagged with the key <code>identity</code>.</details>

**4.** Why check `/var/run/reboot-required`?
<details><summary>Answer</summary>Kernel and core library updates only take effect after a reboot; until then the host runs vulnerable code.</details>

**5.** What does `ProtectSystem=strict` do?
<details><summary>Answer</summary>Mounts the whole filesystem read-only for the service, except paths listed in <code>ReadWritePaths</code>.</details>

**6.** Why is `sshd -T` better than reading the config file?
<details><summary>Answer</summary>It prints the effective configuration after all includes and defaults are applied.</details>

**7.** Why does `$(( 0640 % 10 ))` give an unexpected result in bash?
<details><summary>Answer</summary>A leading zero makes bash treat the number as octal (0640 = 416 decimal), so the remainder isn't the last digit.</details>

**8.** Name three things a baseline should cover besides SSH.
<details><summary>Answer</summary>Any three of: firewall, patching, brute-force protection, auditing, accounts, file permissions, unneeded services, time sync.</details>

**9.** Why snapshot before hardening?
<details><summary>Answer</summary>A mistake (e.g. disabling SSH passwords before keys work, firewall rules) can lock you out; a snapshot lets you roll back.</details>

**10.** Scenario: `verify-host.sh` shows a world-writable file in `/etc/cron.d/`. Why is that serious?
<details><summary>Answer</summary>Any user could add a cron job that runs as root, which gives them root. Fix permissions, investigate how it happened and whether it was abused.</details>

## ✅ Checklist
- [ ] Lab steps 1–6
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #10

## 📚 Resources
- CIS Ubuntu Linux Benchmark — <https://www.cisecurity.org/benchmark/ubuntu_linux>
- Ubuntu security docs — <https://ubuntu.com/security>
- fail2ban — <https://github.com/fail2ban/fail2ban>
- `man systemd.exec`, `man auditctl`, `man sshd_config`

---
[← Week 22](week-22-image-supply-chain.md) · [Next: Week 24 — Reverse proxy & runtime →](week-24-reverse-proxy-runtime.md)
