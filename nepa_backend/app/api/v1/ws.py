from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
from typing import Any

router = APIRouter()

@router.websocket("/sessions/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        # Example: emit demo discriminated event messages
        await websocket.send_json({"type": "telemetry", "payload": {"msg": "demo telemetry"}})
        await websocket.send_json({"type": "detection", "payload": {"msg": "demo detection"}})
        await websocket.send_json({"type": "alert", "payload": {"msg": "demo alert"}})
        await websocket.send_json({"type": "camera_ack", "payload": {"msg": "demo camera_ack"}})
        await websocket.send_json({"type": "video_health", "payload": {"msg": "demo video_health"}})
        await websocket.send_json({"type": "heartbeat", "payload": {"msg": "demo heartbeat"}})
        while True:
            data = await websocket.receive_text()
            # Echo or handle incoming messages as needed
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        pass
