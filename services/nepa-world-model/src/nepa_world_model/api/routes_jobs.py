"""
API routes for job management.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/jobs")
def list_jobs():
    pass
