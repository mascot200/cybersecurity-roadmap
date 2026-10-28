# Month 6 Project — Hardened Docker Compose Deployment (Portfolio Project 3/4)

> Builds on Weeks 21–24 · ~6 h beyond the weekly assignments

## Goal

Deploy your secure API (Month 5 template) with a reverse proxy and PostgreSQL in a way that's hardened
at every layer **and** proven by automated checks.

## Requirements

1. **Containers:** non-root, read-only root filesystem, all capabilities dropped, `no-new-privileges`, CPU/memory/PID limits.
2. **Image:** multi-stage, production dependencies only, base pinned by digest, scanned in CI with a documented threshold, SBOM generated.
3. **Network:** only the proxy published (localhost in the lab); database on an internal network with no published port and no internet access.
4. **Proxy:** TLS 1.2/1.3, HSTS and security headers, body and rate limits, dotfiles denied, version hidden.
5. **Secrets:** generated locally or from a secrets manager; never in images, environment variables or git.
6. **Host:** your Week 23 baseline applied; `verify-host.sh` passes.
7. **Verification:** `verify.sh` covers every item above and passes.

## README must include

- Architecture diagram with networks and trust boundaries
- Table: risk → control → how verified
- How to run it and how to run the checks
- Image scan summary and SBOM location
- Limitations (e.g. single host, self-signed cert, no backups yet: Month 10)

## Acceptance criteria

- [ ] All seven requirement areas met
- [ ] `verify.sh` and `verify-host.sh` output committed
- [ ] Image scan in CI; SBOM produced
- [ ] `gitleaks` clean; secrets git-ignored

## Rubric (self-assess, 8/10 = done)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Container hardening | default | some options | all options, verified |
| Image | large, unscanned | scanned | slim, pinned, scanned in CI, SBOM |
| Network | ports published | partly private | proxy only, internal DB network |
| Secrets | in env/image | files | files/manager, verified absent from env |
| Evidence | none | screenshots | automated checks passing |
