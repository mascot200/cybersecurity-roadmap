# Month 6 — Docker, Linux and Deployment Security

> 🔵 **Level 2 · Intermediate** · Weeks 21–24 · ~40 h · Tracking issue: [#10](https://github.com/mascot200/cybersecurity-roadmap/issues/10)

**Goal:** harden the environment that runs your application.

Your API is now reviewed, scanned and tested. This month you make the place it runs just as deliberate:
the container, its image, the host under it, and the network around it.

![Hardened deployment](images/hardened-deployment.svg)

## Weekly plan

| Week | Lesson | You will build / prove | Est. time |
|---|---|---|---|
| 21 | [Docker security](week-21-docker-security.md) | Non-root, read-only, capability-free container | 10 h |
| 22 | [Image and supply-chain security](week-22-image-supply-chain.md) | Scanned, slimmed, digest-pinned image + SBOM | 10 h |
| 23 | [Linux host hardening](week-23-linux-host-hardening.md) | Scripted baseline, automated verification | 10 h |
| 24 | [Reverse proxy and runtime](week-24-reverse-proxy-runtime.md) | TLS proxy, private networks, file-based secrets | 10 h |
| — | [Month project](project.md) | **Project 3/4: hardened Docker Compose deployment** | woven into weeks |
| — | [Monthly drill](drill.md) | ≥ 80% | 45 min |

## Lab files and what was verified

| File | Verified when this was written |
|---|---|
| [`labs/hardened-deploy/compose.yaml`](labs/hardened-deploy/compose.yaml) | `docker compose config` passes. This caught a real conflict (`pids_limit` vs `deploy.resources.limits`), now fixed |
| [`labs/hardened-deploy/api/`](labs/hardened-deploy/api/) | `server.js` run against PostgreSQL: health/readiness, secret read from file, clean SIGTERM shutdown |
| [`labs/hardened-deploy/scripts/setup.sh`](labs/hardened-deploy/scripts/setup.sh) | Run: generates secret + localhost cert; safe to rerun |
| [`labs/hardened-deploy/scripts/verify.sh`](labs/hardened-deploy/scripts/verify.sh), `proxy/nginx.conf`, `api/Dockerfile` | Syntax only. **Not run**: no Docker daemon or nginx was available. Running them is Week 21/24's first lab step |
| [`labs/host-hardening/verify-host.sh`](labs/host-hardening/verify-host.sh) | Run and debugged (octal-permission bug and missing-`ss` handling fixed) |

## Milestone (must demonstrate before Month 7)

- [ ] Explain the main **container, host, network and secret** risks in your deployment, and the control for each
- [ ] `verify.sh` and `verify-host.sh` pass on your lab

## Recommended resources

- **Docker Engine security** — <https://docs.docker.com/engine/security/>
- **Docker rootless mode** — <https://docs.docker.com/engine/security/rootless/>

---
[← Month 5](../month-05-secure-sdlc-appsec-automation/README.md) · [Course home](../../../README.md) · [Start Week 21 →](week-21-docker-security.md)
