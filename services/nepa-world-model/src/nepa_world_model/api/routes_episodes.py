"""
API routes for episode management.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/episodes")
def list_episodes():
    pass
