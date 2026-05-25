from fastapi import APIRouter
from app.schemas.events import Event, EventCreate
from app.core.demo_store import demo_events

router = APIRouter()

@router.get("/", response_model=list[Event])
def list_events():
    return demo_events

@router.post("/", response_model=Event)
def create_event(event: EventCreate):
    new_event = Event(id=len(demo_events)+1, **event.dict())
    demo_events.append(new_event)
    return new_event
