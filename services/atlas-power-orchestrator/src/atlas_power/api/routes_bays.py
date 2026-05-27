# Charging bay API routes
from fastapi import APIRouter
router = APIRouter()

@router.get("/bays")
def get_bays():
    # TODO: Return bay data
    return []
