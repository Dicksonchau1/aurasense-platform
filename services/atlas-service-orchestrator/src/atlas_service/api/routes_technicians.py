# Technicians API routes
from fastapi import APIRouter
router = APIRouter()

@router.get("/technicians")
def get_technicians():
    # TODO: Return technician data
    return []
