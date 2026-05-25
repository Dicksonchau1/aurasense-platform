from pydantic import BaseModel

class Model(BaseModel):
    id: int
    name: str
    version: str

class ModelCreate(BaseModel):
    name: str
    version: str
