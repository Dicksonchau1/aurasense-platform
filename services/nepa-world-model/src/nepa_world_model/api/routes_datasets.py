"""
API routes for dataset management.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/datasets")
def list_datasets():
    pass
