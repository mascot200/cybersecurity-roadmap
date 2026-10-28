# Week 40 — Recovery and Resilience

> **Level:** Advanced · **Time:** ~10 h · **Tracking:** [issue #14](https://github.com/mascot200/cybersecurity-roadmap/issues/14)
> **Lab scripts:** [`labs/backup/`](labs/backup/): `backup.sh` and `verify-restore.sh` (tested against PostgreSQL 16)

## 🎯 Objectives

1. Define recovery targets: RPO (how much data you can lose) and RTO (how long you can be down).
2. Back up PostgreSQL with integrity checks.
3. Prove backups are usable by restoring them regularly, automatically.
4. Protect backups from the same attacker who compromised production (isolation, immutability).
5. Write lessons learned that change something.

## 🌍 Why it matters

Ransomware groups look for backups and delete or encrypt them before encrypting production. And many
organizations discover during an incident that their backups were incomplete, corrupted, or never
tested. A backup you haven't restored isn't a backup; it's a hope.

---

## 📖 Concepts

### 1. Targets

| Term | Question | Example |
|---|---|---|
| **RPO** (recovery point objective) | How much data can we lose? | 15 minutes → continuous WAL archiving / point-in-time recovery |
| **RTO** (recovery time objective) | How long until we're back? | 1 hour → restore must be scripted and rehearsed |

Measure what you actually achieve in drills, and compare with the targets.

### 2. The 3-2-1(-1-0) rule

**3** copies, on **2** different media/services, **1** off-site (another account/region), **1** immutable or
offline, **0** errors in restore tests.

### 3. The lab scripts

[`backup.sh`](labs/backup/backup.sh) `<database> [dir]`:
- `pg_dump --format=custom` (compressed, selective restore possible)
- SHA-256 checksum file
- exact row counts per table (`*.rows.tsv`) as a completeness manifest
- `umask 077`: backup files are owner-only (backups contain all the data)

[`verify-restore.sh`](labs/backup/verify-restore.sh) `<file.dump>`:
1. verifies the checksum (detects corruption or tampering)
2. restores into a throwaway database (`--exit-on-error`)
3. compares row counts with the manifest
4. reports the restore time (your measured RTO for this database size), and always drops the scratch database

What was tested when this course was written (PostgreSQL 16, a 500-customer / 3,000-invoice sample DB):

| Test | Result |
|---|---|
| Backup | dump + checksum + manifest created, files mode `600` |
| Simulated incident: 2,000 invoices deleted in "prod", then restore check of the earlier backup | `RESTORE VERIFIED`, all 3,000 rows present |
| Tampered dump (one byte appended) | `FAIL checksum mismatch`, exit 1, nothing restored |
| Manifest expecting a different row count | `FAIL public.invoices expected 3001 got 3000`, `RESTORE INCOMPLETE`, exit 1 |
| Cleanup | no `restore_check_*` databases left behind |

### 4. Protecting backups

| Threat | Control |
|---|---|
| Attacker with prod credentials deletes backups | Store copies in a **separate account** that prod can write to but not delete from |
| Backups encrypted by ransomware | **Immutable** storage: S3 Object Lock (compliance mode) or AWS Backup Vault Lock |
| Backup data leaked | Encryption (SSE-KMS), restricted access, no public sharing |
| Silent corruption | Checksums and scheduled restore tests |
| Lost encryption keys | Key policies and key backups documented; test decrypt in another account |

Managed options: RDS automated backups + point-in-time recovery, cross-region/cross-account snapshot
copies, AWS Backup with Vault Lock.

### 5. Lessons learned that stick

For each lesson: what happened → why → what we'll change → owner → date → how we'll know it worked
(a test, an alert, a drill).

---

## 🧪 Lab — Back up, break, restore (3 h)

```bash
cd curriculum/03-advanced/month-10-monitoring-incident-response/labs/backup
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres PGPASSWORD=labpass   # your lab DB
./backup.sh shop_prod ./backups
./verify-restore.sh backups/shop_prod-*.dump
```

1. Create a sample database (or use your Month 3 project's), back it up, and verify.
2. **Simulate the incident:** delete rows or drop a table in the "prod" database. Restore from the backup into a new database, check it, then switch the app's connection to it (or copy the missing data back). Time the whole process: that's your achieved RTO.
3. **Tamper test:** modify a byte of a backup and confirm verification fails.
4. **Schedule it:** run `verify-restore.sh` daily (cron or a CI job) and alert on failure.
5. **(AWS)** Enable RDS automated backups, do a point-in-time restore to a new instance, and copy a snapshot to a second account. Delete what you created.

---

## 📝 Assignment — Restore and document results

**Task:** restore a database backup and document recovery results.

`RECOVERY.md`: RPO/RTO targets and how you chose them; backup method, location, encryption and immutability;
the restore drill with timings (achieved RPO/RTO); integrity verification; gaps found; and lessons learned
in the format above.

### Acceptance criteria
- [ ] Backup with checksum and manifest
- [ ] Restore drill performed and timed; data verified complete
- [ ] Tamper test fails as expected
- [ ] Scheduled restore verification with alerting
- [ ] Achieved vs target RPO/RTO compared

---

## 💼 On the job

- Recovery drills are part of incident readiness and are often required by auditors and regulators.
- Security and SRE teams share this work: same backups, different threats (outages vs attackers).

## ⚠️ Common mistakes

- Never testing restores.
- Backups deletable with production credentials.
- Measuring "backup succeeded" instead of "restore succeeded".
- No checksum, so corruption is discovered during the incident.

## 🥊 Drill (pass mark 8/10)

**1.** Define RPO and RTO.
<details><summary>Answer</summary>RPO: maximum acceptable data loss (time since last recoverable point). RTO: maximum acceptable downtime until service is restored.</details>

**2.** What does the 3-2-1 rule say?
<details><summary>Answer</summary>Three copies, on two different media/services, one off-site (plus one immutable/offline and zero restore errors in the extended version).</details>

**3.** Why store backups in a separate account?
<details><summary>Answer</summary>So an attacker or mistake with production credentials can't delete them.</details>

**4.** What does Object Lock / Vault Lock add?
<details><summary>Answer</summary>Immutability: backups can't be deleted or changed until retention expires, even by admins (compliance mode).</details>

**5.** What do the lab's checksum and manifest each detect?
<details><summary>Answer</summary>Checksum: corruption or tampering of the backup file. Manifest: an incomplete restore (missing rows/tables).</details>

**6.** Why restore into a throwaway database?
<details><summary>Answer</summary>To verify the backup without touching production, and to clean up automatically afterwards.</details>

**7.** Why `umask 077` in the backup script?
<details><summary>Answer</summary>Backups contain all the data; only the owner should be able to read them.</details>

**8.** What's the difference between "backup succeeded" and "restore verified"?
<details><summary>Answer</summary>A successful backup job doesn't prove the data is complete, uncorrupted and restorable within the RTO; only a restore test does.</details>

**9.** What gives a 15-minute RPO for PostgreSQL?
<details><summary>Answer</summary>Continuous WAL archiving / point-in-time recovery (e.g. RDS PITR), not a nightly dump.</details>

**10.** Scenario: during a ransomware incident, you find the backup bucket's objects were deleted using a stolen admin role. What should have prevented it, and what now?
<details><summary>Answer</summary>Backups in a separate account with Object Lock/Vault Lock, and SCPs denying deletes. Now: check other copies (cross-region, snapshots), restore from the newest clean one, contain the role, and add immutability before resuming.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #14

## 📚 Resources
- PostgreSQL backup and restore — <https://www.postgresql.org/docs/current/backup.html>
- RDS point-in-time recovery — <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html>
- AWS Backup Vault Lock — <https://docs.aws.amazon.com/aws-backup/latest/devguide/vault-lock.html>
- NIST Cybersecurity Framework (Recover) — <https://www.nist.gov/cyberframework>

---
[← Week 39](week-39-incident-response.md) · [Month project →](project.md)
