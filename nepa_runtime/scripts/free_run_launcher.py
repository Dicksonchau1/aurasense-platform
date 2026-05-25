"""
Free-running launcher for drone-inspection rehearse sessions.
Runs autonomously for --duration-hours (default 72).
Emits JSONL telemetry to --log-file.
Writes hourly CSV summary to --summary-dir.

Usage:
  python free_run_launcher.py \
    --session-api http://localhost:3000/api/rehearse/drone-session \
    --signature-api http://localhost:3000/api/signature-map \
    --duration-hours 72 \
    --ticks-per-session 30 \
    --tick-interval-s 2.0 \
    --log-file ./free_run.jsonl \
    --summary-dir ./summaries
"""
import argparse, asyncio, csv, json, hashlib, math, time, pathlib
import httpx
from datetime import datetime, timezone

# orbit_telemetry helper
def orbit_telemetry(t: int, radius: float = 10.0, altitude: float = 5.0) -> dict:
    angle = (2 * math.pi * t) / 30  # full orbit every 30 ticks
    return {
        "ts": int(time.time() * 1000),
        "entity_id": "drone_0",
        "position": {"x": radius * math.cos(angle), "y": altitude,
                     "z": radius * math.sin(angle)},
        "velocity": {"x": -radius * math.sin(angle) * 0.2,
                     "y": 0, "z": radius * math.cos(angle) * 0.2},
        "metrics": {"payload_kg": 1.2, "wind_speed_ms": 12.0}
    }

# Main async launcher implementation
import uuid
import subprocess

async def run_session(session_api, signature_api, ticks_per_session, tick_interval_s, run_id):
    session_id = str(uuid.uuid4())
    # Start session
    context = {
        "structure_type": "bridge",
        "geo": {"lat": 22.35, "lon": 114.12},
        "payload_kg": 1.2,
        "wind_speed_ms": 12.0,
        "wind_dir_deg": 315
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(session_api, json={"session_id": session_id, "context": context})
        resp.raise_for_status()
        # Tick telemetry
        for t in range(ticks_per_session):
            telemetry = orbit_telemetry(t)
            await client.post(f"{session_api}/tick", json={"session_id": session_id, "telemetry": telemetry})
            await asyncio.sleep(tick_interval_s)
        # End session
        end_resp = await client.post(f"{session_api}/end", json={"session_id": session_id})
        end_resp.raise_for_status()
        end_data = end_resp.json()
        # Query signature map for h3_cell, mean_uncertainty
        h3_cell = end_data.get("h3_cell", "")
        contributions = end_data.get("contributions", 0)
        return {
            "session_id": session_id,
            "run_id": run_id,
            "session_ticks": ticks_per_session,
            "contributions": contributions,
            "domain": "drone_inspection",
            "h3_cell": h3_cell
        }

def write_jsonl(log_file, data):
    with open(log_file, "a") as f:
        f.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(), **data}) + "\n")

def call_hourly_summary(summary_dir, signature_api):
    # Call hourly_summary.py as subprocess
    subprocess.Popen([
        "python", "hourly_summary.py",
        "--summary-dir", summary_dir,
        "--signature-api", signature_api
    ])

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--session-api", required=True)
    parser.add_argument("--signature-api", required=True)
    parser.add_argument("--duration-hours", type=float, default=72)
    parser.add_argument("--ticks-per-session", type=int, default=30)
    parser.add_argument("--tick-interval-s", type=float, default=2.0)
    parser.add_argument("--log-file", default="./free_run.jsonl")
    parser.add_argument("--summary-dir", default="./summaries")
    return parser.parse_args()

def ensure_dir(path):
    pathlib.Path(path).mkdir(parents=True, exist_ok=True)

def main():
    args = parse_args()
    ensure_dir(args.summary_dir)
    run_id = str(uuid.uuid4())
    start_time = time.time()
    session_count = 0
    last_hour = 0
    duration_s = args.duration_hours * 3600

    async def loop():
        nonlocal session_count, last_hour
        while (time.time() - start_time) < duration_s:
            session_data = await run_session(
                args.session_api, args.signature_api,
                args.ticks_per_session, args.tick_interval_s, run_id
            )
            write_jsonl(args.log_file, session_data)
            session_count += 1
            hours_elapsed = (time.time() - start_time) / 3600
            if int(hours_elapsed) > last_hour:
                call_hourly_summary(args.summary_dir, args.signature_api)
                last_hour = int(hours_elapsed)
    asyncio.run(loop())

if __name__ == "__main__":
    main()
