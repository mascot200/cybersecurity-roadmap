"""Detection rules for the Month 10 lab, run over JSON-lines application logs.

Each rule returns alerts: dicts with rule, severity, entity, evidence (request IDs)
and a short summary an on-call engineer can act on.

Usage: python3 detections.py events.jsonl
"""
import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta


def load(path):
    with open(path, encoding="utf-8") as f:
        events = [json.loads(line) for line in f if line.strip()]
    for e in events:
        e["_t"] = datetime.fromisoformat(e["ts"].replace("Z", "+00:00"))
    return sorted(events, key=lambda e: e["_t"])


def _windowed(events, key, window, threshold, predicate):
    """Yield (key, events_in_window) the first time `threshold` matching events fall within `window`."""
    buckets, fired = defaultdict(list), set()
    for e in events:
        if not predicate(e):
            continue
        k = key(e)
        b = buckets[k]
        b.append(e)
        while b and e["_t"] - b[0]["_t"] > window:
            b.pop(0)
        if len(b) >= threshold and k not in fired:
            fired.add(k)
            yield k, list(b)


def brute_force(events, threshold=10, window=timedelta(minutes=5)):
    """Many failed logins for ONE account in a short window (T1110.001)."""
    alerts = []
    failures = lambda e: e["event"] == "login" and e["outcome"] == "failure"
    for user, hits in _windowed(events, lambda e: e["user"], window, threshold, failures):
        later_success = [e for e in events if e["event"] == "login" and e["user"] == user
                         and e["outcome"] == "success" and e["_t"] > hits[-1]["_t"]
                         and e["_t"] - hits[-1]["_t"] <= window]
        alerts.append({
            "rule": "brute_force", "entity": user,
            "severity": "high" if later_success else "medium",
            "summary": f"{len(hits)} failed logins for {user} within {window}; "
                       + ("followed by a SUCCESS - possible account takeover" if later_success else "no success yet"),
            "evidence": [e["request_id"] for e in hits + later_success[:1]],
        })
    return alerts


def password_spraying(events, threshold=15, window=timedelta(minutes=10)):
    """One source IP failing against MANY different accounts (T1110.003)."""
    alerts = []
    failures = [e for e in events if e["event"] == "login" and e["outcome"] == "failure"]
    by_ip = defaultdict(list)
    for e in failures:
        by_ip[e["ip"]].append(e)
    for ip, evs in by_ip.items():
        for i, first in enumerate(evs):
            in_window = [e for e in evs[i:] if e["_t"] - first["_t"] <= window]
            accounts = {e["user"] for e in in_window}
            if len(accounts) >= threshold:
                alerts.append({
                    "rule": "password_spraying", "entity": ip, "severity": "high",
                    "summary": f"{ip} failed logins against {len(accounts)} different accounts within {window}",
                    "evidence": [e["request_id"] for e in in_window],
                })
                break
    return alerts


def privilege_change(events):
    """Role elevated to admin. Critical if the actor wasn't an admin (self-promotion / broken authz)."""
    alerts = []
    for e in events:
        if e["event"] == "role_change" and e.get("new_role") == "admin":
            unauthorized = e.get("actor_role") != "admin"
            alerts.append({
                "rule": "privilege_change", "entity": e["user"],
                "severity": "critical" if unauthorized else "low",
                "summary": f'{e["actor"]} ({e.get("actor_role")}) set {e["user"]} {e["old_role"]} -> admin'
                           + (" - actor is NOT an admin" if unauthorized else " - expected admin action, review"),
                "evidence": [e["request_id"]],
            })
    return alerts


def unusual_export(events, max_records=10000, window=timedelta(hours=1)):
    """A user exporting far more records than normal in an hour (possible data theft)."""
    alerts = []
    exports = lambda e: e["event"] == "api_call" and e.get("action") == "invoices.export"
    totals = defaultdict(list)
    for e in filter(exports, events):
        b = totals[e["user"]]
        b.append(e)
        while b and e["_t"] - b[0]["_t"] > window:
            b.pop(0)
        if sum(x["records"] for x in b) > max_records and not any(a["entity"] == e["user"] for a in alerts):
            alerts.append({
                "rule": "unusual_export", "entity": e["user"], "severity": "high",
                "summary": f'{e["user"]} exported {sum(x["records"] for x in b)} records within {window}',
                "evidence": [x["request_id"] for x in b],
            })
    return alerts


RULES = [brute_force, password_spraying, privilege_change, unusual_export]


def run(events):
    return [alert for rule in RULES for alert in rule(events)]


if __name__ == "__main__":
    for a in run(load(sys.argv[1])):
        print(f'[{a["severity"].upper():8}] {a["rule"]:<18} {a["summary"]}')
