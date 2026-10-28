"""CVSS v3.1 base score calculator (Month 11 lab).

Implements the base-metric equations from the FIRST CVSS v3.1 specification,
including its Roundup function. Use it to check and explain the severity you
assign to findings; the official calculator is https://www.first.org/cvss/calculator/3.1

Usage: python3 cvss31.py "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
"""
import math
import sys

WEIGHTS = {
    "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2},
    "AC": {"L": 0.77, "H": 0.44},
    "UI": {"N": 0.85, "R": 0.62},
    "C": {"H": 0.56, "L": 0.22, "N": 0.0},
    "I": {"H": 0.56, "L": 0.22, "N": 0.0},
    "A": {"H": 0.56, "L": 0.22, "N": 0.0},
}
PR_WEIGHTS = {"U": {"N": 0.85, "L": 0.62, "H": 0.27}, "C": {"N": 0.85, "L": 0.68, "H": 0.5}}
REQUIRED = ("AV", "AC", "PR", "UI", "S", "C", "I", "A")


def roundup(value):
    """CVSS v3.1 Roundup: smallest number, to one decimal, >= value (float-safe)."""
    int_input = round(value * 100000)
    if int_input % 10000 == 0:
        return int_input / 100000.0
    return (math.floor(int_input / 10000) + 1) / 10.0


def parse(vector):
    parts = vector.strip().split("/")
    if parts[0] != "CVSS:3.1":
        raise ValueError("vector must start with CVSS:3.1/")
    metrics = dict(p.split(":", 1) for p in parts[1:])
    missing = [m for m in REQUIRED if m not in metrics]
    if missing:
        raise ValueError(f"missing base metrics: {', '.join(missing)}")
    if metrics["S"] not in ("U", "C"):
        raise ValueError("S must be U or C")
    return metrics


def base_score(vector):
    m = parse(vector)
    scope_changed = m["S"] == "C"
    iss = 1 - (1 - WEIGHTS["C"][m["C"]]) * (1 - WEIGHTS["I"][m["I"]]) * (1 - WEIGHTS["A"][m["A"]])
    if scope_changed:
        impact = 7.52 * (iss - 0.029) - 3.25 * (iss - 0.02) ** 15
    else:
        impact = 6.42 * iss
    exploitability = (8.22 * WEIGHTS["AV"][m["AV"]] * WEIGHTS["AC"][m["AC"]]
                      * PR_WEIGHTS[m["S"]][m["PR"]] * WEIGHTS["UI"][m["UI"]])
    if impact <= 0:
        return 0.0
    if scope_changed:
        return roundup(min(1.08 * (impact + exploitability), 10))
    return roundup(min(impact + exploitability, 10))


def severity(score):
    if score == 0:
        return "None"
    if score < 4.0:
        return "Low"
    if score < 7.0:
        return "Medium"
    if score < 9.0:
        return "High"
    return "Critical"


if __name__ == "__main__":
    for vector in sys.argv[1:]:
        s = base_score(vector)
        print(f"{s:>4}  {severity(s):<8}  {vector}")
