# Sample FastAPI handler for receiving user info from WebSocket
# Add this to your backend/app/routers/rehearse_wound_dressing.py or a new file

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from typing import Dict, Any
import asyncio
import json

router = APIRouter()

# ...existing STEPS and send_event definitions...

@router.websocket("/ws/rehearse/wound-dressing/{sessionId}")
async def wound_dressing_ws(ws: WebSocket, sessionId: str):
    await ws.accept()
    user_info = None
    try:
        # Expect the first message to be user info
        first_msg = await ws.receive_json()
        if first_msg.get("type") == "user_info":
            user_info = first_msg.get("user")
        else:
            await ws.close(code=4001)
            return
        # ...rest of your session logic...
        # When sending events, include user_info in the payload or audit log
        # Example:
        # await send_event(ws, "session.start", {"user": user_info, ...}, sessionId)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await ws.close()

# In your frontend, after connecting, send:
# ws.send(JSON.stringify({ type: "user_info", user: { id, email, name, institution } }))
