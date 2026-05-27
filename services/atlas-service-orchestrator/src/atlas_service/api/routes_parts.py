# Parts API routes
from fastapi import APIRouter
router = APIRouter()

@router.get("/parts")
def get_parts():
    # TODO: Return parts data
    return []
