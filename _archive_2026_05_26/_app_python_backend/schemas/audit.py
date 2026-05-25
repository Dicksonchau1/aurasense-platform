from pydantic import BaseModel

class Audit(BaseModel):
    id: int
    session_id: int
    event: str
    details: dict | None = None

class AuditCreate(BaseModel):
    session_id: int
    event: str
    details: dict | None = None
