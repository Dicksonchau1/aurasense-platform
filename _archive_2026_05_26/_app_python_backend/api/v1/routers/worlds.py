from fastapi import APIRouter
from app.schemas.worlds import World, WorldCreate
from app.core.demo_store import demo_worlds

router = APIRouter()

@router.get("/", response_model=list[World])
def list_worlds():
    return demo_worlds

@router.post("/", response_model=World)
def create_world(world: WorldCreate):
    new_world = World(id=len(demo_worlds)+1, **world.dict())
    demo_worlds.append(new_world)
    return new_world
