from pydantic import BaseModel

class Event(BaseModel):
    id: int
    type: str
    payload: dict

class EventCreate(BaseModel):
    type: str
    payload: dict
