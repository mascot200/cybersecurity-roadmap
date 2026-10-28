# Rules of Engagement — <system name> security assessment

> Sign this before any testing starts. For this course, the system owner and the tester are usually you;
> write it anyway. It's the habit that keeps professional testing legal and safe.

| Item | Value |
|---|---|
| System owner (approver) | name, role, contact |
| Tester(s) | name, contact |
| Assessment window | start – end (UTC), allowed hours |
| Environment | e.g. `staging` (non-production), account/cluster IDs |
| **In scope** | URLs, API base paths, cloud account IDs, repos, container images, CI/CD pipeline |
| **Out of scope** | production, third-party services (identity provider, payment provider, email), other tenants' real data, denial-of-service, social engineering |
| Test accounts | tenant A admin/member, tenant B admin (synthetic data only) |
| Allowed techniques | manual testing with an intercepting proxy, the project's own test suites, SAST/SCA/IaC/image scanners, read-only cloud posture tools, configuration review |
| Not allowed | high-volume automated scanning without approval, anything that modifies data outside test tenants, persistence, accessing real user data |
| Data handling | evidence stored encrypted in `<location>`, redacted in the report, deleted after `<date>` |
| Stop conditions | real personal data found; service instability; anything outside scope → stop, record, notify the owner |
| Communication | channel for status updates; emergency contact |

Approved by: ____________________  Date: __________
