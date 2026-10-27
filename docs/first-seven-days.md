# Your First Seven Days

A guided first week to build momentum. ~1.5 hours/day. Tick these in issue [#1](https://github.com/mascot200/cybersecurity-roadmap/issues/1).

## Day 1 — Set up your journal
- [ ] Create a GitHub repository named **`cybersecurity-journey`** (see [How to study §3](how-to-study.md#3-set-up-your-learning-journal-repo)).
- [ ] Enable *Secret scanning* + *Push protection*.
- [ ] Copy and sign the agreement in [Safety & ethics](safety-and-ethics.md).
- [ ] Take the [Diagnostic Drill](drills.md#-diagnostic-drill-take-it-now--no-studying-first). Record the score.

## Day 2 — Linux environment
- [ ] Follow [Lab setup](lab-setup.md) Steps 1–2. Snapshot the VM.
- [ ] Run `whoami`, `id`, `hostnamectl`, `ip a`, `ss -tulpn`. Write in your notes what each shows.

## Day 3 — Users, permissions, SSH, logs
- [ ] Read Week 1 sections 1–4.
- [ ] Create a user, a group, a shared folder with `770` permissions; prove another user can't read it.
- [ ] Look at `journalctl -u ssh --since today`.

## Day 4 — DNS, TCP, HTTP, TLS
- [ ] Read Week 2 sections 1–3.
- [ ] Run `dig +trace example.com`, `curl -v https://example.com`, `openssl s_client -connect example.com:443 -servername example.com </dev/null`.
- [ ] Write one paragraph per command: what happened?

## Day 5 — OverTheWire Bandit
- [ ] `ssh bandit0@bandit.labs.overthewire.org -p 2220` (password: `bandit0`).
- [ ] Complete levels 0 → 5. Keep a log of the commands that solved each level (no passwords in public notes!).

## Day 6 — Threat-model a login API
- [ ] Read Week 3 section on threat modeling.
- [ ] Draw: `Browser → API → Database` and mark the **trust boundaries**.
- [ ] List 5 ways to attack the login and a mitigation for each.

## Day 7 — Publish & reflect
- [ ] Commit notes, the diagram, lessons learned and open questions to your journal.
- [ ] Comment a weekly log on issue #1, then close it. Continue with [Month 1](../curriculum/01-beginner/month-01-security-foundations/README.md).
