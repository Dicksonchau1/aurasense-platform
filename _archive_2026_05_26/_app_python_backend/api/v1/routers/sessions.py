from fastapi import APIRouter
from app.schemas.sessions import Session, SessionCreate
from app.core.demo_store import demo_sessions

router = APIRouter()

@router.get("/", response_model=list[Session])
def list_sessions():
    return demo_sessions

@router.post("/", response_model=Session)
def create_session(session: SessionCreate):
    new_session = Session(id=len(demo_sessions)+1, **session.dict())
    demo_sessions.append(new_session)
    return new_session
