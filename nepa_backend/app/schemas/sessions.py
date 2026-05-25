from pydantic import BaseModel

class Session(BaseModel):
    id: int
    name: str
    status: str

class SessionCreate(BaseModel):
    name: str
    status: str
