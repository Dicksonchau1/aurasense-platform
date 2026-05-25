from pydantic import BaseModel

class Agent(BaseModel):
    id: int
    name: str
    role: str

class AgentCreate(BaseModel):
    name: str
    role: str
