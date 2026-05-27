# --- REST API for dashboard data ---
from fastapi.responses import JSONResponse

@app.get("/api/power/robots")
async def get_robots():
    async with app.state.db_pool.acquire() as conn:
        # Get last 10 SOC readings per robot
        rows = await conn.fetch("""
            SELECT robot_id, array_agg(soc_percent ORDER BY ts DESC)[:10] as soc_history
            FROM battery_telemetry
            WHERE ts > now() - interval '2 hours'
            GROUP BY robot_id
        """)
        robots = [{"id": r["robot_id"], "soc": list(reversed(r["soc_history"]))} for r in rows]
        return JSONResponse(content=robots)

@app.get("/api/power/bays")
async def get_bays():
    async with app.state.db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT bay_id, state, array_length(queue,1) as queue FROM charging_bays")
        bays = [{"id": r["bay_id"], "state": r["state"], "queue": r["queue"] or 0} for r in rows]
        return JSONResponse(content=bays)

@app.get("/api/power/inventory")
async def get_inventory():
    async with app.state.db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT serial, health_percent, location_kind FROM battery_inventory")
        inventory = [{"serial": r["serial"], "health": r["health_percent"], "location": r["location_kind"]} for r in rows]
        return JSONResponse(content=inventory)
# ATLAS Power Orchestrator Sidecar
# FastAPI entrypoint for scheduling and coordination

from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import datetime
from .websocket_publisher import SwapEventWebSocketPublisher

app = FastAPI(title="ATLAS Power Orchestrator")

class BatteryTelemetry(BaseModel):
    robot_id: str
    timestamp: float
    voltage_v: float
    current_a: float
    soc_percent: float
    temperature_c: float
    cells_temperature_c: List[float]
    cycle_count: int
    health_percent: float
    predicted_runtime_min: float

class ChargingBay(BaseModel):
    bay_id: str
    site_id: str
    state: str
    current_robot_id: Optional[str]
    queue: List[dict]
    batteries_ready: int
    capacity: int
    last_swap_duration_s: Optional[float]

class BatterySwapEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    robot_id: str
    bay_id: str
    type: str
    timestamp: float
    duration_ms: Optional[int] = None
    failure_reason: Optional[str] = None
    pre_soc_percent: Optional[float] = None
    post_soc_percent: Optional[float] = None
    removed_battery_serial: Optional[str] = None
    installed_battery_serial: Optional[str] = None
    chain_hash: str

@app.get("/healthz")
def healthz():
    return {"status": "ok"}


# --- SwapScheduler, DB integration, and event loop ---
import asyncio
import asyncpg
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

class SwapScheduler:
        def __init__(self, db_pool):
            self.db_pool = db_pool
            self.running = False
            self.ws_publisher = SwapEventWebSocketPublisher(os.getenv('SWAP_EVENT_WS_URL', 'ws://localhost:8765'))
    def __init__(self, db_pool):
        self.db_pool = db_pool
        self.running = False

    async def run(self):
        self.running = True
        while self.running:
            await self.evaluate_swaps()
            await asyncio.sleep(5)  # Evaluate every 5 seconds

    DEFAULT_SOC_THRESHOLD = 15.0

    async def evaluate_swaps(self):
        async with self.db_pool.acquire() as conn:
            robots = await conn.fetch("SELECT * FROM battery_telemetry WHERE ts > now() - interval '1 minute'")
            bays = await conn.fetch("SELECT * FROM charging_bays")
            for robot in robots:
                soc = robot['soc_percent']
                robot_id = robot['robot_id']
                if soc is not None and soc < self.DEFAULT_SOC_THRESHOLD:
                    # Find available bay
                    available_bay = next((b for b in bays if b['state'] == 'IDLE'), None)
                    if available_bay:
                        print(f"[SwapScheduler] Robot {robot_id} SOC {soc:.1f}%: reserving bay {available_bay['bay_id']}")
                        await self.reserve_bay(conn, robot_id, available_bay['bay_id'])
                        await self.emit_swap_event(conn, robot_id, available_bay['bay_id'], 'GO_TO_CHARGE_ISSUED')
                        await self.issue_go_to_charge_mission(robot_id, available_bay['bay_id'])
                    else:
                        print(f"[SwapScheduler] Robot {robot_id} SOC {soc:.1f}%: no available bay!")

    async def issue_go_to_charge_mission(self, robot_id, bay_id):
        import httpx
        # This assumes missionId == robotId for demo; adapt as needed
        mission_api_url = f"http://localhost:3000/api/missions/{robot_id}/command"
        payload = {
            "command": "GO_TO_CHARGE",
            "params": {"bay_id": bay_id}
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(mission_api_url, json=payload, timeout=5.0)
                print(f"[SwapScheduler] Issued GO_TO_CHARGE for {robot_id} to bay {bay_id}: {resp.status_code}")
        except Exception as e:
            print(f"[SwapScheduler] Mission API error: {e}")

    async def reserve_bay(self, conn, robot_id, bay_id):
        await conn.execute(
            """
            UPDATE charging_bays SET state='RESERVED', current_robot_id=$1 WHERE bay_id=$2 AND state='IDLE'
            """, robot_id, bay_id
        )

    async def emit_swap_event(self, conn, robot_id, bay_id, event_type):
        event_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow()
        # Fetch previous chain hash
        prev_chain_hash = await conn.fetchval(
            "SELECT chain_hash FROM battery_swap_events ORDER BY ts DESC LIMIT 1"
        ) or '0' * 64
        payload = {
            'robot_id': robot_id,
            'bay_id': bay_id,
            'event_type': event_type,
            'ts': now.isoformat()
        }
        # Compute chain hash (Python version)
        import hashlib, json
        chain_hash = hashlib.sha256((json.dumps(payload, sort_keys=True) + prev_chain_hash).encode()).hexdigest()
        await conn.execute(
            """
            INSERT INTO battery_swap_events (event_id, robot_id, bay_id, event_type, ts, chain_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            event_id, robot_id, bay_id, event_type, now, chain_hash
        )
        # Write to audit_events
        await conn.execute(
            """
            INSERT INTO audit_events (event_id, ts, tenant_id, source_module, event_type, payload, prev_chain_hash, chain_hash, signer_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """,
            event_id, now, 'default_tenant', 'atlas-power-orchestrator', event_type, json.dumps(payload), prev_chain_hash, chain_hash, 'power-orchestrator'
        )
        # Emit to WebSocket for dashboard
        asyncio.create_task(self.ws_publisher.publish({
            'event_id': event_id,
            'robot_id': robot_id,
            'bay_id': bay_id,
            'event_type': event_type,
            'ts': now.isoformat(),
            'chain_hash': chain_hash
        }))


@app.on_event("startup")
async def startup_event():
    app.state.db_pool = await asyncpg.create_pool(DATABASE_URL)
    app.state.scheduler = SwapScheduler(app.state.db_pool)
    asyncio.create_task(app.state.scheduler.run())

# Endpoint to trigger a swap for testing
@app.post("/trigger_swap/{robot_id}")
async def trigger_swap(robot_id: str):
    async with app.state.db_pool.acquire() as conn:
        bays = await conn.fetch("SELECT * FROM charging_bays WHERE state='IDLE'")
        if not bays:
            return {"error": "No available bay"}
        bay_id = bays[0]['bay_id']
        await app.state.scheduler.reserve_bay(conn, robot_id, bay_id)
        await app.state.scheduler.emit_swap_event(conn, robot_id, bay_id, 'GO_TO_CHARGE_ISSUED')
        return {"status": "swap triggered", "robot_id": robot_id, "bay_id": bay_id}
