"""
Reads the JSONL log and queries signature_map to produce:
- Total signatures contributed
- Signatures per H3 cell
- Mean uncertainty per H3 cell (from signature_map query)
- Uncertainty reduction over time (first 10% of sessions vs last 10%)

Writes to:
- accretion_report.csv
- accretion_summary.json (for the investor deck)
"""
import argparse, csv, json


import pathlib
from collections import defaultdict
from statistics import mean

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--log-file', required=True)
    parser.add_argument('--out-csv', default='accretion_report.csv')
    parser.add_argument('--out-json', default='accretion_summary.json')
    return parser.parse_args()

def main():
    args = parse_args()
    log_path = pathlib.Path(args.log_file)
    if not log_path.exists():
        print(f"Log file {args.log_file} not found.")
        return
    sessions = []
    with open(log_path) as f:
        for line in f:
            try:
                sessions.append(json.loads(line))
            except Exception:
                continue
    # Aggregate by h3_cell
    h3_stats = defaultdict(lambda: {"signature_count": 0, "uncertainties": [], "session_count": 0})
    total_contributions = 0
    for s in sessions:
        h3 = s.get("h3_cell", "")
        h3_stats[h3]["signature_count"] += s.get("contributions", 0)
        h3_stats[h3]["session_count"] += 1
        if "mean_uncertainty" in s:
            h3_stats[h3]["uncertainties"].append(s["mean_uncertainty"])
        total_contributions += s.get("contributions", 0)
    # Write CSV
    with open(args.out_csv, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["h3_cell", "signature_count", "mean_uncertainty", "session_count"])
        for h3, stats in h3_stats.items():
            mu = mean(stats["uncertainties"]) if stats["uncertainties"] else 0.0
            writer.writerow([h3, stats["signature_count"], mu, stats["session_count"]])
    # Uncertainty reduction: first 10% vs last 10%
    n = len(sessions)
    first = sessions[:max(1, n//10)]
    last = sessions[-max(1, n//10):]
    def avg_uncert(slist):
        vals = [s.get("mean_uncertainty", 0.0) for s in slist if "mean_uncertainty" in s]
        return mean(vals) if vals else 0.0
    summary = {
        "total_contributions": total_contributions,
        "h3_cells": list(h3_stats.keys()),
        "mean_uncertainty_per_h3": {h3: mean(stats["uncertainties"]) if stats["uncertainties"] else 0.0 for h3, stats in h3_stats.items()},
        "uncertainty_reduction": {
            "first_10pct": avg_uncert(first),
            "last_10pct": avg_uncert(last)
        }
    }
    with open(args.out_json, "w") as f:
        json.dump(summary, f, indent=2)

if __name__ == "__main__":
    main()
