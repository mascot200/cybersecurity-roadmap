# Week 22 — Image and Supply-Chain Security

> **Level:** Intermediate · **Time:** ~10 h · **Tracking:** [issue #10](https://github.com/mascot200/cybersecurity-roadmap/issues/10)

## 🎯 Objectives

1. Scan images for known vulnerabilities (Trivy or Grype) and triage the results.
2. Reduce what's in an image: minimal or distroless bases, fewer packages, pinned versions.
3. Generate an SBOM (Syft) and explain what it's used for.
4. Explain image signing and provenance (Sigstore cosign, SLSA) at a practical level.
5. Add image scanning to CI with a sensible failure threshold.

## 🌍 Why it matters

Your image contains an operating system, a runtime and hundreds of packages you didn't write. When a
vulnerability like **Log4Shell (2021)** is announced, the first question is "where do we run the affected
package?". Organizations with SBOMs answered in hours; others took weeks. The **xz Utils backdoor (2024,
CVE-2024-3094)** showed that even core OS packages can be compromised upstream, which is why provenance
and pinning matter as much as scanning.

---

## 📖 Concepts

### 1. Where image vulnerabilities come from

| Layer | Example | Reduce by |
|---|---|---|
| Base OS packages | openssl, glibc, busybox | Small/distroless bases; rebuild often |
| Language runtime | Node.js itself | Supported LTS; rebuild on releases |
| App dependencies | npm packages | SCA (Month 5), `--omit=dev` |
| Things you added | curl, git, compilers left in the image | Multi-stage builds |

### 2. Scanning

```bash
trivy image hardened-deploy-api                     # OS + language packages
trivy image --severity HIGH,CRITICAL --ignore-unfixed hardened-deploy-api
grype hardened-deploy-api                           # alternative scanner
```

`--ignore-unfixed` shows only vulnerabilities that have a fixed version available, which are the ones
you can act on today. Track unfixed criticals separately.

**Triage questions** (same as Month 5): is the package actually used at runtime? Is the vulnerable code
reachable? Is it known exploited? Is there a fixed version? Record decisions; suppress accepted items with
a reason and expiry (`.trivyignore` entries with comments).

### 3. SBOMs

A Software Bill of Materials lists every component and version in an image.

```bash
syft hardened-deploy-api -o spdx-json > sbom.spdx.json
syft hardened-deploy-api -o cyclonedx-json > sbom.cdx.json
grype sbom:./sbom.spdx.json                         # rescan later without the image
```

Uses: answer "are we affected?" quickly when a new CVE drops, meet customer/regulatory requirements, and
track license obligations. Store SBOMs with each release.

### 4. Pinning, signing, provenance

| Control | What it gives you |
|---|---|
| Pin base images by **digest** (`node:22-alpine@sha256:…`) | The exact same bytes every build; a re-tagged image can't sneak in |
| Automated updates (Dependabot/Renovate for Dockerfiles) | Pinned doesn't mean stale |
| **Signing** images (Sigstore `cosign sign`) | Consumers can verify who built the image |
| **Provenance** attestations (SLSA, `docker buildx --provenance`) | A record of how and from what source it was built |
| Verify on deploy (admission policy, Month 9) | Only signed, scanned images run |

### 5. Image scanning in CI

```yaml
  image-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} ./api
      - uses: aquasecurity/trivy-action@0.28.0   # pin to a commit SHA in real projects
        with:
          image-ref: app:${{ github.sha }}
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: '1'
```

Use the same gate policy as Month 5: block new fixable high/critical findings; track the rest.

---

## 🧪 Lab — Scan, shrink, document (3–4 h)

1. Build the lab image and scan it with Trivy. Record counts by severity.
2. Build the same app on `node:22` (full Debian) and compare: image size, package count (`syft … | wc -l`), and vulnerability counts.
3. Try a distroless runtime (`gcr.io/distroless/nodejs22-debian12`) for the final stage. What breaks (hint: the `wget` healthcheck, no shell)? How would you replace it?
4. Generate SPDX and CycloneDX SBOMs. Use `grype sbom:` to rescan from the SBOM.
5. Pin the base image by digest (`docker buildx imagetools inspect node:22-alpine` shows it).

---

## 📝 Assignment — Scan, fix and produce an SBOM

**Task:** scan an image, address meaningful findings and produce an SBOM.

`IMAGE_SECURITY.md` with:
- before/after table (base image, size, packages, critical/high/medium counts)
- triage table for every remaining high/critical: package, fixed version?, reachable?, decision, reason
- SBOM files committed (or attached to a release) and how to use them
- the CI job you added and its threshold

### Acceptance criteria
- [ ] Image scanned; meaningful fixable findings addressed
- [ ] Every remaining high/critical triaged with a reason
- [ ] SPDX or CycloneDX SBOM produced
- [ ] Base image pinned by digest
- [ ] Image scan job in CI with a documented threshold

---

## 💼 On the job

- When a major CVE drops, security teams query SBOMs and image inventories to find affected services within hours.
- Container registries (ECR, GHCR, Artifact Registry) offer built-in scanning; teams still need a triage process.

## ⚠️ Common mistakes

- Scanning once and never again. New CVEs appear daily for old images, so rescan and rebuild regularly.
- Chasing every low-severity OS finding while a reachable critical in an npm package waits.
- Pinning by tag only (`node:22`), which changes under you.
- Treating "0 vulnerabilities" as "secure".

## 🥊 Drill (pass mark 8/10)

**1.** What does an SBOM contain, and when is it most useful?
<details><summary>Answer</summary>A list of all components and versions in a piece of software. It's most useful when a new vulnerability is announced, to find affected systems quickly.</details>

**2.** What does `--ignore-unfixed` do in Trivy?
<details><summary>Answer</summary>Hides vulnerabilities with no fixed version available, focusing on findings you can fix now.</details>

**3.** Why pin images by digest?
<details><summary>Answer</summary>A digest identifies exact image content; tags can be moved to different content.</details>

**4.** What does image signing prove?
<details><summary>Answer</summary>Who built/published the image and that it hasn't been altered since signing.</details>

**5.** Name two ways to reduce image vulnerabilities.
<details><summary>Answer</summary>Any two of: smaller/distroless base, multi-stage builds, production dependencies only, rebuilding regularly to pick up patches.</details>

**6.** Why doesn't "0 vulnerabilities" mean secure?
<details><summary>Answer</summary>Scanners only find known issues in known packages; they miss your code's flaws, misconfiguration, secrets and unknown vulnerabilities.</details>

**7.** What's a provenance attestation?
<details><summary>Answer</summary>A signed record of how an artifact was built: source repository, commit, build system and parameters.</details>

**8.** Why might a distroless image break a healthcheck?
<details><summary>Answer</summary>It has no shell or tools like <code>wget</code>/<code>curl</code>; use an orchestrator HTTP probe or a small healthcheck binary/script in the app's language.</details>

**9.** Why rebuild images even if your code didn't change?
<details><summary>Answer</summary>To pick up patched base-image and OS packages.</details>

**10.** Scenario: a critical CVE in a base-image library, no fix available yet. What do you do?
<details><summary>Answer</summary>Check whether it's reachable/exploitable in your use; apply mitigations (config, network restrictions, removing the package if unused, switching base); document an exception with a review date; watch for the fix and rebuild as soon as it's released.</details>

## ✅ Checklist
- [ ] Lab steps 1–5
- [ ] Assignment acceptance criteria met
- [ ] Drill ≥ 8/10, weekly log on issue #10

## 📚 Resources
- Trivy — <https://trivy.dev/>
- Syft / Grype — <https://github.com/anchore/syft> · <https://github.com/anchore/grype>
- Sigstore cosign — <https://docs.sigstore.dev/>
- SLSA — <https://slsa.dev/>
- Docker build best practices — <https://docs.docker.com/build/building/best-practices/>

---
[← Week 21](week-21-docker-security.md) · [Next: Week 23 — Linux host hardening →](week-23-linux-host-hardening.md)
