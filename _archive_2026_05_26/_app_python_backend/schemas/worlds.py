from pydantic import BaseModel

class World(BaseModel):
    id: int
    name: str
    description: str | None = None

class WorldCreate(BaseModel):
    name: str
    description: str | None = None
