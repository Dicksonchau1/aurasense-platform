from fastapi import APIRouter
from app.schemas.models import Model, ModelCreate
from app.core.demo_store import demo_models

router = APIRouter()

@router.get("/", response_model=list[Model])
def list_models():
    return demo_models

@router.post("/", response_model=Model)
def create_model(model: ModelCreate):
    new_model = Model(id=len(demo_models)+1, **model.dict())
    demo_models.append(new_model)
    return new_model
