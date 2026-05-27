# Service API routes
from fastapi import APIRouter
router = APIRouter()

@router.get("/service")
def get_service():
    # TODO: Return service data
    return {}
