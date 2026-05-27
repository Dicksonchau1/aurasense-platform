# Consumes NEPA battery prognostics

import asyncio
import websockets
import json

class PrognosticsClient:
    def __init__(self, ws_url):
        self.ws_url = ws_url

    async def subscribe(self, robot_id, callback):
        url = f"{self.ws_url}/robots/{robot_id}/battery_prognostics"
        async with websockets.connect(url) as ws:
            print(f"Connected to NEPA battery prognostics: {url}")
            async for message in ws:
                try:
                    data = json.loads(message)
                    callback(data)
                except Exception as e:
                    print(f"Invalid battery telemetry: {e}")
