from fastapi import FastAPI
from app.api.v1.routers import auth, users, worlds, sessions, agents, runs, events, commands, audit, models
from app.api.v1 import ws

app = FastAPI(title="ATLAS Operator Platform API", version="1.0.0")

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
