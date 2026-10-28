# Month 9 Project — Cloud Threat Model

> Builds on Months 7–9 · ~6 h beyond the weekly assignments · Feeds the Month 11 assessment and capstone

## Goal

Produce a threat model of your cloud deployment (Months 7–9) with **at least ten threats**, each with
preventive and detective controls, and evidence that the important controls work.

## Deliverables

1. **System description:** architecture diagram (accounts, network, compute, data, CI/CD, Kubernetes if used) with trust boundaries.
2. **Assets and entry points:** sensitive data, high-privilege identities, internet-facing endpoints, CI/CD.
3. **Threat table (≥ 10 rows):**

   | ID | Threat (attacker story) | Entry point | Path (Week 33) | Likelihood | Impact | Preventive controls | Detective controls | Validated? (Week 36) |
   |---|---|---|---|---|---|---|---|---|
   | CT-01 | Compromised web task uses its role to change Lambda code and gain the reports role | Web app vulnerability | web → role → lambda → reports role | 2 | 3 | Remove `UpdateFunctionCode` from web role | Alert on code updates outside CI | ✅ negative test |

   Cover at least: leaked CI/human credentials, SSRF to metadata, public storage, exposed database,
   over-privileged workload, privilege escalation via IAM, compromised container/pod, Kubernetes RBAC
   misuse, log tampering, and supply-chain compromise of an image or action.
4. **Attack-path summary:** before/after numbers from the Week 33 tool.
5. **Residual risks** and the next three improvements.

## Acceptance criteria

- [ ] ≥ 10 threats, each with preventive **and** detective controls
- [ ] Each threat linked to an attack path or entry point
- [ ] At least five controls validated with evidence
- [ ] Before/after attack-path numbers
- [ ] Residual risks stated

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Coverage | < 6 threats | 6–9 | ≥ 10 across identity, network, data, workload, pipeline |
| Controls | preventive only | both, some missing | both for every threat |
| Paths | none | listed | graphed, ranked, reduced |
| Evidence | none | some | ≥ 5 validated controls |
| Clarity | hard to follow | readable | someone else could act on it |
