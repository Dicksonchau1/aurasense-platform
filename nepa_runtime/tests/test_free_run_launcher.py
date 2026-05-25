import math
import time
import pytest
from nepa_runtime.scripts.free_run_launcher import orbit_telemetry

def test_orbit_telemetry_t0():
    result = orbit_telemetry(0)
    assert math.isclose(result["position"]["x"], 10.0, rel_tol=1e-5)

def test_orbit_telemetry_t15():
    result = orbit_telemetry(15)
    assert math.isclose(result["position"]["x"], -10.0, rel_tol=1e-5)

def test_jsonl_keys():
    # Example JSONL line
    line = {
        "ts": int(time.time() * 1000),
        "session_id": "abc",
        "run_id": "def",
        "contributions": 3,
        "domain": "drone_inspection",
        "h3_cell": "8f2830828052d25"
    }
    required = ["ts", "session_id", "run_id", "contributions", "domain", "h3_cell"]
    for key in required:
        assert key in line
