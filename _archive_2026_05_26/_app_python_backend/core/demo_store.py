from app.schemas.auth import User
from app.schemas.users import UserCreate
from app.schemas.worlds import World, WorldCreate
from app.schemas.sessions import Session, SessionCreate
from app.schemas.agents import Agent, AgentCreate
from app.schemas.runs import Run, RunCreate
from app.schemas.events import Event, EventCreate
from app.schemas.commands import Command, CommandCreate
from app.schemas.audit import Audit, AuditCreate
from app.schemas.models import Model, ModelCreate

# In-memory demo data

demo_users = [
    User(id=1, username="demo", email="demo@example.com"),
]
demo_worlds = [
    World(id=1, name="Earth", description="Demo world")
]
demo_sessions = [
    Session(id=1, name="Demo Session", status="active")
]
demo_agents = [
    Agent(id=1, name="AtlasBot", role="operator")
]
demo_runs = [
    Run(id=1, session_id=1, status="running")
]
demo_events = [
    Event(id=1, type="telemetry", payload={"msg": "demo event"})
]
demo_commands = [
    Command(id=1, session_id=1, command="start", params={})
]
demo_audits = [
    Audit(id=1, session_id=1, event="login", details={"user": "demo"})
]
demo_models = [
    Model(id=1, name="DemoModel", version="1.0.0")
]
