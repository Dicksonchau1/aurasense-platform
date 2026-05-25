from pydantic import BaseModel

class Command(BaseModel):
    id: int
    session_id: int
    command: str
    params: dict | None = None

class CommandCreate(BaseModel):
    session_id: int
    command: str
    params: dict | None = None
