# Admin API routes
from fastapi import APIRouter
router = APIRouter()

@router.get("/admin/status")
def get_status():
    # TODO: Return service status
    return {"status": "ok"}
