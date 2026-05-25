from fastapi import APIRouter
from app.schemas.agents import Agent, AgentCreate
from app.core.demo_store import demo_agents

router = APIRouter()

@router.get("/", response_model=list[Agent])
def list_agents():
    return demo_agents

@router.post("/", response_model=Agent)
def create_agent(agent: AgentCreate):
    new_agent = Agent(id=len(demo_agents)+1, **agent.dict())
    demo_agents.append(new_agent)
    return new_agent
