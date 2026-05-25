from fastapi.responses import JSONResponse
from fastapi import FastAPI

from app.api.v1.routers import auth, users, worlds, sessions, agents, runs, events, commands, audit, models
from app.api.v1 import ws

# --- PostgreSQL setup for envelope persistence ---
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, JSON, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.future import select
from fastapi import Depends

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/atlas")
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

class EnvelopeModel(Base):
    __tablename__ = "envelopes"
    envelope_id = Column(String, primary_key=True, index=True)
    data = Column(JSONB)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app = FastAPI(title="ATLAS Operator Platform API", version="1.0.0")

# Initialize DB on FastAPI startup event
@app.on_event("startup")
async def on_startup():
    await init_db()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Include API routers
def include_routers(app: FastAPI):
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(worlds.router, prefix="/api/v1/worlds", tags=["worlds"])
    app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])
    app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
    app.include_router(runs.router, prefix="/api/v1/runs", tags=["runs"])
    app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
    app.include_router(commands.router, prefix="/api/v1/commands", tags=["commands"])
    app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])
    app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
    app.include_router(ws.router, prefix="/ws/v1", tags=["websocket"] )

include_routers(app)

# --- Envelope ingestion endpoint for ATLAS integration ---
from pydantic import BaseModel
from typing import Optional, Dict, Any

class Envelope(BaseModel):
    envelope_id: str
    timestamp: str
    world_id: str
    agent_id: Optional[str]
    event_type: str
    payload: Dict[str, Any]
    meta: Optional[Dict[str, Any]] = None
    version: Optional[str] = "1.0"


@app.post("/envelope")
async def receive_envelope(envelope: Envelope, db: AsyncSession = Depends(get_db)):
    db_env = EnvelopeModel(envelope_id=envelope.envelope_id, data=envelope.dict())
    db.add(db_env)
    await db.commit()
    print(f"Persisted envelope: {envelope.envelope_id}")
    return {"status": "ok"}

# --- Envelope retrieval endpoint ---
@app.get("/envelopes")
async def get_envelopes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnvelopeModel))
    envelopes = result.scalars().all()
    return JSONResponse([e.data for e in envelopes])
