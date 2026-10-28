"""Check Kubernetes workloads against the hardening rules from Week 35.

A teaching tool modelled on the Pod Security "restricted" standard plus a few
extra rules. In real clusters, enforce with Pod Security Admission and a policy
engine (Kyverno, OPA Gatekeeper). Requires PyYAML.

Usage: python3 check_pods.py manifest.yaml [...]   (exit 1 if any finding)
"""
import sys

import yaml

WORKLOADS = {"Pod", "Deployment", "StatefulSet", "DaemonSet", "Job", "ReplicaSet"}


def pod_spec(doc):
    if doc["kind"] == "Pod":
        return doc["spec"]
    return doc["spec"]["template"]["spec"]


def check_workload(doc):
    spec = pod_spec(doc)
    name = f'{doc["kind"]}/{doc["metadata"]["name"]}'
    pod_sc = spec.get("securityContext", {}) or {}
    findings = []

    def add(rule, detail):
        findings.append((name, rule, detail))

    for flag in ("hostNetwork", "hostPID", "hostIPC"):
        if spec.get(flag):
            add("HOST_NAMESPACE", f"{flag}: true shares the node's namespace")
    for vol in spec.get("volumes", []) or []:
        if "hostPath" in vol:
            add("HOST_PATH", f'volume "{vol["name"]}" mounts {vol["hostPath"].get("path")} from the node')

    pod_seccomp = (pod_sc.get("seccompProfile") or {}).get("type")
    for c in spec.get("containers", []) + (spec.get("initContainers", []) or []):
        sc = c.get("securityContext", {}) or {}
        cname = c["name"]
        if sc.get("privileged"):
            add("PRIVILEGED", f"{cname}: privileged container")
        if sc.get("allowPrivilegeEscalation") is not False:
            add("PRIV_ESCALATION", f"{cname}: allowPrivilegeEscalation must be false")
        if not sc.get("runAsNonRoot", pod_sc.get("runAsNonRoot")):
            add("RUN_AS_ROOT", f"{cname}: runAsNonRoot not set")
        if sc.get("readOnlyRootFilesystem") is not True:
            add("WRITABLE_ROOT_FS", f"{cname}: readOnlyRootFilesystem should be true")
        if "ALL" not in ((sc.get("capabilities") or {}).get("drop") or []):
            add("CAPABILITIES", f"{cname}: capabilities must drop ALL")
        if ((sc.get("seccompProfile") or {}).get("type") or pod_seccomp) not in ("RuntimeDefault", "Localhost"):
            add("SECCOMP", f"{cname}: seccompProfile RuntimeDefault (or Localhost) required")
        image = c.get("image", "")
        if "@sha256:" not in image:
            add("IMAGE_NOT_PINNED", f"{cname}: image {image!r} not pinned by digest")
        if not (c.get("resources") or {}).get("limits"):
            add("NO_LIMITS", f"{cname}: no resource limits")
    return findings


def check_file(path):
    with open(path, encoding="utf-8") as f:
        docs = [d for d in yaml.safe_load_all(f) if d]
    findings = []
    for doc in docs:
        if doc.get("kind") in WORKLOADS:
            findings.extend(check_workload(doc))
    return findings


def main(paths):
    total = 0
    for path in paths:
        findings = check_file(path)
        total += len(findings)
        if not findings:
            print(f"OK    {path}")
        for name, rule, detail in findings:
            print(f"FAIL  {path} {name} {rule}: {detail}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
