from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Dict, Any
import asyncio

router = APIRouter()

STEPS = [
    {"step_index": 0, "step_name": "Clean wound", "expected_action": "clean_wound"},
    {"step_index": 1, "step_name": "Apply antiseptic", "expected_action": "apply_antiseptic"},
    {"step_index": 2, "step_name": "Place dressing", "expected_action": "place_dressing"},
    {"step_index": 3, "step_name": "Secure dressing", "expected_action": "secure_dressing"},
    {"step_index": 4, "step_name": "Final check", "expected_action": "final_check"},
]

async def send_event(ws: WebSocket, event_type: str, payload: Dict[str, Any], session_id: str, user_info: Dict[str, Any] = None):
    event = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        "payload": payload,
        "session_id": session_id,
    }
    if user_info:
        event["user"] = user_info
    await ws.send_json(event)

@router.websocket("/ws/rehearse/wound-dressing/{sessionId}")
async def wound_dressing_ws(ws: WebSocket, sessionId: str):
    await ws.accept()
    user_info = None
    try:
        # Expect first message to be user info
        first_msg = await ws.receive_json()
        if first_msg.get("type") == "user_info":
            user_info = first_msg.get("user")
        else:
            await ws.close(code=4001)
            return
        await send_event(ws, "session.start", {"message": "Session started"}, sessionId, user_info)
        total_score = 0.0
        max_score = float(len(STEPS))
        for step in STEPS:
            await send_event(ws, "step.advance", step, sessionId, user_info)
            try:
                data = await ws.receive_json()
            except WebSocketDisconnect:
                await send_event(ws, "step.error", {"error": f"Client disconnected during step {step['step_index']}"}, sessionId, user_info)
                break
            if not (isinstance(data, dict) and data.get("type") == "action_confirmed" and data.get("step_index") == step["step_index"]):
                await send_event(ws, "step.error", {"error": f"Expected action_confirmed for step_index {step['step_index']}"}, sessionId, user_info)
                continue
            # Real scoring: check action_performed
            action_performed = data.get("action_performed")
            expected_action = step["expected_action"]
            if action_performed == expected_action:
                score = 1.0
            else:
                score = 0.0
            total_score += score
            await send_event(ws, "assessment.score", {"step_index": step["step_index"], "score": score, "expected_action": expected_action, "action_performed": action_performed}, sessionId, user_info)
        passed = total_score == max_score
        await send_event(ws, "session.complete", {"passed": passed, "total_score": total_score, "max_score": max_score}, sessionId, user_info)
    except WebSocketDisconnect:
        await send_event(ws, "step.error", {"error": "Client disconnected unexpectedly."}, sessionId, user_info)
    except Exception as e:
        await send_event(ws, "step.error", {"error": str(e)}, sessionId, user_info)
        await ws.close()