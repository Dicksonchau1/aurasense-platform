from fastapi import APIRouter
from app.schemas.audit import Audit, AuditCreate
from app.core.demo_store import demo_audits

router = APIRouter()

@router.get("/", response_model=list[Audit])
def list_audits():
    return demo_audits

@router.post("/", response_model=Audit)
def create_audit(audit: AuditCreate):
    new_audit = Audit(id=len(demo_audits)+1, **audit.dict())
    demo_audits.append(new_audit)
    return new_audit
