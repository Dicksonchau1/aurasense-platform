# Minimal WebSocket publisher for swap events (Python)
import asyncio
import websockets
import json

class SwapEventWebSocketPublisher:
    def __init__(self, ws_url):
        self.ws_url = ws_url

    async def publish(self, event: dict):
        try:
            async with websockets.connect(self.ws_url) as ws:
                await ws.send(json.dumps(event))
        except Exception as e:
            print(f"[WebSocketPublisher] Error: {e}")
