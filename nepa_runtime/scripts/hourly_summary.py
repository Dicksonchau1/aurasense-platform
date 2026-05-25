"""
Called every hour by the launcher (subprocess or asyncio task).
Queries /api/signature-map/query for the fixed geo/asset.
Appends one row to summaries/YYYY-MM-DD_HH.csv:
h3_cell, signature_count, mean_uncertainty, session_count, ts
"""
import argparse, csv, json


import httpx
from datetime import datetime, timezone
import pathlib

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--summary-dir', required=True)
    parser.add_argument('--signature-api', required=True)
    return parser.parse_args()

def main():
    args = parse_args()
    # Fixed geo/asset for query
    query = {
        "geo": {"lat": 22.35, "lon": 114.12},
        "structure_type": "bridge"
    }
    async def fetch_and_write():
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{args.signature_api}/query", json=query)
            resp.raise_for_status()
            data = resp.json()
            # Assume response: {"h3_cell": ..., "signature_count": ..., "mean_uncertainty": ..., "session_count": ...}
            h3_cell = data.get("h3_cell", "")
            signature_count = data.get("signature_count", 0)
            mean_uncertainty = data.get("mean_uncertainty", 0.0)
            session_count = data.get("session_count", 0)
            ts = datetime.now(timezone.utc).isoformat()
            # Write to CSV
            hour_str = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H")
            out_dir = pathlib.Path(args.summary_dir)
            out_dir.mkdir(parents=True, exist_ok=True)
            out_file = out_dir / f"{hour_str}.csv"
            write_header = not out_file.exists()
            with open(out_file, "a", newline="") as f:
                writer = csv.writer(f)
                if write_header:
                    writer.writerow(["h3_cell", "signature_count", "mean_uncertainty", "session_count", "ts"])
                writer.writerow([h3_cell, signature_count, mean_uncertainty, session_count, ts])
    import asyncio
    asyncio.run(fetch_and_write())

if __name__ == "__main__":
    main()
