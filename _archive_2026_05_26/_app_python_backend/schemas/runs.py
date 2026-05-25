from pydantic import BaseModel

class Run(BaseModel):
    id: int
    session_id: int
    status: str

class RunCreate(BaseModel):
    session_id: int
    status: str
