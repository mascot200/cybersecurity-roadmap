# Month 10 — Monitoring and Incident Response

> 🔴 **Level 3 · Advanced** · Weeks 37–40 · ~40 h · Tracking issue: [#14](https://github.com/mascot200/cybersecurity-roadmap/issues/14)

**Goal:** detect suspicious activity, investigate evidence and recover safely.

Prevention is never perfect. This month is about what happens after a control fails: seeing it in the
logs, raising the right alert, responding calmly, and getting back to a known-good state.

![Incident response lifecycle](images/incident-response.svg)

## Weekly plan

| Week | Lesson | You will build / prove | Est. time |
|---|---|---|---|
| 37 | [Logging and observability](week-37-logging-observability.md) | Structured, redacted logs centralized with app, proxy and host sources | 10 h |
| 38 | [Detection engineering](week-38-detection-engineering.md) | Tested detection rules (Python + Sigma) routed as alerts | 10 h |
| 39 | [Incident response](week-39-incident-response.md) | Investigation of lab alerts; tabletop for a credential compromise | 10 h |
| 40 | [Recovery and resilience](week-40-recovery-resilience.md) | Verified backups, timed restore drill, tamper detection | 10 h |
| — | [Month project](project.md) | **Project 5: monitoring lab + simulated incident + IR report** | woven into weeks |
| — | [Monthly drill](drill.md) | ≥ 80% | 45 min |

## Lab code and what was verified

| Lab | Verified when this was written |
|---|---|
| [`labs/detections/`](labs/detections/) | 4 Python rules over 633 synthetic events: **8/8 tests passing**. They find exactly the five planted incidents with no false positives from normal traffic. Real CLI output is in Week 38 |
| [`labs/detections/sigma/`](labs/detections/sigma/) | 2 Sigma rules; YAML-parsed with required fields checked |
| [`labs/backup/`](labs/backup/) | Run against PostgreSQL 16: backup + checksum + manifest; verified restore after simulated data loss; tampered dump rejected; incomplete restore reported; cleanup confirmed |

## Milestone (must demonstrate before Month 11)

- [ ] Investigate a simulated security event and explain **containment, recovery and prevention** with your timeline as evidence
- [ ] A restore drill with measured RTO

## Recommended resources

- **MITRE ATT&CK** — <https://attack.mitre.org/>
- **NIST Cybersecurity Framework** — <https://www.nist.gov/cyberframework>

---
[← Month 9](../month-09-advanced-cloud-security/README.md) · [Course home](../../../README.md) · [Start Week 37 →](week-37-logging-observability.md)
