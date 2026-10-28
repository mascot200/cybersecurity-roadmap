"""Attack-path analysis for the Month 9 lab (defender's view).

Loads a graph of identities, workloads and data, lists every simple path from an
entry point to sensitive data, and ranks single edges by how many paths removing
them would break. Synthetic data only; the same idea powers tools like PMapper.

Usage:
  python3 attack_paths.py environment.json             # paths from "internet"
  python3 attack_paths.py environment.json --remove web-task-role:reports-lambda
"""
import argparse
import json


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def adjacency(env, removed=()):
    graph = {node: [] for node in env["nodes"]}
    for edge in env["edges"]:
        if (edge["from"], edge["to"]) not in removed:
            graph[edge["from"]].append(edge["to"])
    return graph


def paths_to_sensitive(env, start="internet", removed=()):
    graph = adjacency(env, removed)
    sensitive = {n for n, info in env["nodes"].items() if info.get("sensitive")}
    found = []

    def walk(node, path):
        for nxt in graph[node]:
            if nxt in path:
                continue                      # simple paths only (no cycles)
            new_path = path + [nxt]
            if nxt in sensitive:
                found.append(new_path)
            walk(nxt, new_path)

    walk(start, [start])
    return found


def rank_edges(env, start="internet"):
    """For each edge, how many entry→sensitive paths disappear if it's removed."""
    baseline = paths_to_sensitive(env, start)
    ranking = []
    for edge in env["edges"]:
        key = (edge["from"], edge["to"])
        broken = len(baseline) - len(paths_to_sensitive(env, start, removed={key}))
        if broken:
            ranking.append((broken, key, edge["control"]))
    return sorted(ranking, key=lambda r: (-r[0], r[1]))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("environment")
    parser.add_argument("--start", default="internet")
    parser.add_argument("--remove", action="append", default=[], help="edge as from:to (repeatable)")
    args = parser.parse_args()
    env = load(args.environment)
    removed = {tuple(r.split(":", 1)) for r in args.remove}

    paths = paths_to_sensitive(env, args.start, removed)
    print(f"{len(paths)} path(s) from '{args.start}' to sensitive data")
    for p in paths:
        print("  " + " -> ".join(p))
    if not removed:
        print("\nEdges ranked by paths broken if removed:")
        for broken, (src, dst), control in rank_edges(env, args.start):
            print(f"  {broken:>2}  {src} -> {dst}   control: {control}")


if __name__ == "__main__":
    main()
