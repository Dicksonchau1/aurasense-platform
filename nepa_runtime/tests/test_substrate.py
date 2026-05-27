# nepa_runtime/tests/test_substrate.py
# PR D-4 — substrate server tests via FastAPI TestClient
from __future__ import annotations
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch):
    # Reset module-level singleton for each test
    import importlib
    from nepa_runtime.substrate import server as srv
    importlib.reload(srv)
    monkeypatch.setenv("NEPA_SUBSTRATE_RUN_ID", "test-run-xyz")
    importlib.reload(srv)
    return TestClient(srv.app)


def make_envelope(tick: int, run_id: str = "test-run-xyz", roll_delta: float = 0.02):
    return {
        "run_id": run_id,
        "deployment_id": "tsing-ma-bridge-001",
        "tick": tick,
        "timestamp_ms": 1_700_000_000_000 + tick * 100,
        "structural_class": "suspension_bridge",
        "regime_hash": "regime-abc123",
        "geometric": {"lat": 22.351, "lon": 114.080, "alt_m": 47.0},
        "predicted": {"imu_roll": 0.0, "motor_rpm_0": 6000.0},
        "observed": {"imu_roll": roll_delta, "motor_rpm_0": 6000.0 + roll_delta * 100},
        "delta": {"imu_roll": roll_delta, "motor_rpm_0": roll_delta * 100},
        "regime_anchor": {"wind_direction_deg": 315.0, "wind_speed_mps": 12.0},
    }


def test_run_id_endpoint(client):
    r = client.get("/substrate/run_id")
    assert r.status_code == 200
    assert "run_id" in r.json()
    assert len(r.json()["run_id"]) > 0


def test_priors_endpoint(client):
    payload = {"priors": [{
        "signature_id": "sig-1",
        "geometric_anchor": {"h3_cell": "891fb46d2afffff", "altitude_band": "40-50m",
                             "lat": 22.35, "lon": 114.08, "alt_m": 47.0},
        "structural_anchor": {"object_id": "tsing-ma", "structural_class": "suspension_bridge",
                              "node_id": "N17", "object_metadata": {}},
        "regime_anchor": {"regime_hash": "regime-abc123"},
        "payload": {"signature_type": "engine_response",
                    "parameters": {"time_constant_ms": 340.0, "gain": 1.0, "bias": 0.0},
                    "confidence": 0.85},
        "audit_hash": "deadbeef",
        "contribution_provenance": {},
    }]}
    r = client.post("/substrate/priors", json=payload)
    assert r.status_code == 200
    assert r.json()["priors_loaded"] == 1


def test_envelope_produces_actions(client):
    # Send a high-residual envelope; should produce at least one correct:* action
    r = client.post("/substrate/envelope", json=make_envelope(tick=1, roll_delta=0.5))
    assert r.status_code == 200
    actions = r.json()["actions"]
    assert isinstance(actions, list)
    types = [a["type"] for a in actions]
    assert any(t.startswith("correct:") for t in types), f"no correct:* in {types}"


def test_envelope_determinism(client):
    # Same envelope sequence → same actions across two clients with same run_id
    seq = [make_envelope(tick=i, roll_delta=0.3) for i in range(1, 21)]
    out_a = [client.post("/substrate/envelope", json=e).json()["actions"] for e in seq]

    # Reset and replay
    import importlib
    from nepa_runtime.substrate import server as srv
    importlib.reload(srv)
    client2 = TestClient(srv.app)
    out_b = [client2.post("/substrate/envelope", json=e).json()["actions"] for e in seq]

    assert out_a == out_b, "substrate action sequence is non-deterministic"


def test_health_endpoint(client):
    client.post("/substrate/envelope", json=make_envelope(tick=1, roll_delta=0.3))
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["tick_count"] >= 1
