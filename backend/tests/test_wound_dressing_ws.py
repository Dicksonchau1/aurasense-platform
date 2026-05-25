import pytest
from starlette.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

WS_PATH = "/ws/rehearse/wound-dressing/test-session-001"

EXPECTED_STEPS = [
    {"step_index": 0, "step_name": "Clean wound", "expected_action": "clean_wound"},
    {"step_index": 1, "step_name": "Apply antiseptic", "expected_action": "apply_antiseptic"},
    {"step_index": 2, "step_name": "Place dressing", "expected_action": "place_dressing"},
    {"step_index": 3, "step_name": "Secure dressing", "expected_action": "secure_dressing"},
    {"step_index": 4, "step_name": "Final check", "expected_action": "final_check"},
]

def test_wound_dressing_ws():
    with client.websocket_connect(WS_PATH) as ws:
        # session.start
        event = ws.receive_json()
        assert event["event_type"] == "session.start"
        # 5 steps
        for step in EXPECTED_STEPS:
            event = ws.receive_json()
            assert event["event_type"] == "step.advance"
            assert event["payload"]["step_index"] == step["step_index"]
            # Confirm action
            ws.send_json({"type": "action_confirmed", "step_index": step["step_index"]})
            event = ws.receive_json()
            assert event["event_type"] == "assessment.score"
            assert event["payload"]["score"] == 1.0
        # session.complete
        event = ws.receive_json()
        assert event["event_type"] == "session.complete"
        assert event["payload"]["passed"] is True
        assert event["payload"]["total_score"] == 5.0
        assert event["payload"]["max_score"] == 5.0
