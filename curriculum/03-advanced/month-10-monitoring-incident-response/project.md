# Month 10 Project — Monitoring Lab, Simulated Incident and IR Report (Project 5)

> Builds on Weeks 37–40 · ~8 h beyond the weekly assignments · Portfolio item 6

## Goal

Show the full loop on your own lab system: logs → detection → alert → investigation → containment →
recovery → lessons learned, with evidence at every step.

## Requirements

1. **Logging:** your API (Months 5–6) emits structured, redacted JSON logs with request IDs; proxy, host and (if used) cloud logs are centralized.
2. **Detections:** at least five rules (from Week 38, including two of your own), each with true- and false-positive tests, running in your stack and routed to a channel.
3. **Simulated incident** (in your lab only, with synthetic data): pick one, for example
   - a test user's password "leaks" and is used from a new IP, followed by an export, or
   - a test API token is used after it should have been revoked, or
   - a "malicious" admin role change through a deliberately reintroduced authorization bug.
   Generate the events by actually performing the actions with test accounts.
4. **Response:** detect it with your alerts, triage, preserve evidence, contain, eradicate, recover (including a restore with `verify-restore.sh` if data was changed).
5. **Report:** `IR_REPORT.md` with executive summary, timeline, impact, root cause, actions, lessons learned and action items.

## README must include

- Architecture of the monitoring lab (diagram)
- Detection catalogue (rule, ATT&CK technique, severity, tests)
- Link to the IR report and the evidence folder (log exports with hashes, screenshots)
- Limitations (lab scale, synthetic data, what a real SOC would add)

## Acceptance criteria

- [ ] Logs centralized and redacted (tested)
- [ ] ≥ 5 tested detections firing in the stack
- [ ] Simulated incident detected by your alerts (not found by hand first)
- [ ] Evidence preserved with hashes; timeline complete
- [ ] Containment and recovery performed; restore verified
- [ ] Report with ≥ 5 action items with owners and dates

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Logging | ad hoc | structured | structured, centralized, redacted, tested |
| Detections | none | rules | tested rules routed as alerts |
| Investigation | none | partial timeline | full timeline with preserved evidence |
| Response | none | containment | containment, eradication, verified recovery |
| Report | missing | descriptive | blameless, actionable, owned action items |
