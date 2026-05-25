from fastapi import APIRouter
from app.schemas.runs import Run, RunCreate
from app.core.demo_store import demo_runs

router = APIRouter()

@router.get("/", response_model=list[Run])
def list_runs():
    return demo_runs

@router.post("/", response_model=Run)
def create_run(run: RunCreate):
    new_run = Run(id=len(demo_runs)+1, **run.dict())
    demo_runs.append(new_run)
    return new_run
