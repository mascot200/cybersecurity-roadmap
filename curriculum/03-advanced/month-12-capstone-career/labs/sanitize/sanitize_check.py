"""Pre-publication check for portfolio repositories (Month 12 lab).

Flags things that usually shouldn't be public: AWS account IDs, access key IDs,
private key blocks, private/internal IPs, email addresses and internal hostnames.
Documentation placeholders (111122223333, 123456789012, example.com/.test,
RFC 5737 documentation IPs) are allowed. It complements, not replaces, gitleaks.

Usage: python3 sanitize_check.py <dir>      (exit 1 if anything is flagged)
"""
import ipaddress
import os
import re
import sys

SKIP_DIRS = {".git", "node_modules", ".terraform", "__pycache__", "fixtures"}
TEXT_EXT = {".md", ".txt", ".js", ".ts", ".py", ".json", ".yaml", ".yml", ".tf", ".sh", ".env", ".sql", ".html", ".conf", ".tsv", ".csv"}

ALLOWED_ACCOUNT_IDS = {"111122223333", "123456789012", "444455556666"}
ALLOWED_EMAIL_DOMAINS = ("example.com", "example.org", "example.net", ".test", ".example", ".invalid",
                         "lab.local", "anthropic.com")
DOC_NETS = [ipaddress.ip_network(n) for n in ("192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24")]

PATTERNS = {
    "AWS_ACCESS_KEY_ID": re.compile(r"\b(AKIA|ASIA)[0-9A-Z]{16}\b"),
    "PRIVATE_KEY": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "AWS_ACCOUNT_ID": re.compile(r"(?<![\d.])(\d{12})(?![\d.])"),
    "IPV4": re.compile(r"(?<![\d.])((?:\d{1,3}\.){3}\d{1,3})(?![\d.])"),
    "EMAIL": re.compile(r"\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b"),
    "INTERNAL_HOST": re.compile(r"\b[a-z0-9-]+\.(?:internal|corp|local|lan)\b", re.I),
}


ACCOUNT_CONTEXT = re.compile(r"(arn:aws[a-z-]*:[a-z0-9-]*:[a-z0-9-]*:|account(?:[ _-]?id)?\s*[:=#]?\s*)$", re.I)


def account_id_context(line, match):
    """Treat a 12-digit number as an account ID only right after an ARN prefix or the word 'account'."""
    return bool(ACCOUNT_CONTEXT.search(line[:match.start(1)]))


def check_line(line):
    findings = []
    for rule, rx in PATTERNS.items():
        for m in rx.finditer(line):
            value = m.group(1) if rule in ("AWS_ACCOUNT_ID", "IPV4") else m.group(0)
            if rule == "AWS_ACCOUNT_ID":
                if value in ALLOWED_ACCOUNT_IDS or not account_id_context(line, m):
                    continue
            elif rule == "IPV4":
                try:
                    ip = ipaddress.ip_address(value)
                except ValueError:
                    continue
                if (not ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_unspecified
                        or any(ip in n for n in DOC_NETS)):
                    continue                     # flag private network addresses only
            elif rule == "EMAIL":
                if value.lower().endswith(ALLOWED_EMAIL_DOMAINS):
                    continue
            elif rule == "INTERNAL_HOST":
                if m.group(0).lower() == "lab.local" or m.group(0).lower().endswith(".lab.local"):
                    continue                     # the course's own synthetic lab domain
            findings.append((rule, value))
    return findings


def scan(root):
    results = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if os.path.splitext(name)[1].lower() not in TEXT_EXT and name != "Dockerfile":
                continue
            path = os.path.join(dirpath, name)
            with open(path, encoding="utf-8", errors="ignore") as f:
                for lineno, line in enumerate(f, 1):
                    for rule, value in check_line(line):
                        results.append((path, lineno, rule, value))
    return results


if __name__ == "__main__":
    found = scan(sys.argv[1] if len(sys.argv) > 1 else ".")
    for path, lineno, rule, value in found:
        print(f"{rule:<18} {path}:{lineno}  {value}")
    print(f"\n{len(found)} item(s) to review")
    sys.exit(1 if found else 0)
