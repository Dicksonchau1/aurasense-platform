from fastapi import APIRouter
from app.schemas.users import User, UserCreate
from app.core.demo_store import demo_users

router = APIRouter()

@router.get("/", response_model=list[User])
def list_users():
    return demo_users

@router.post("/", response_model=User)
def create_user(user: UserCreate):
    new_user = User(id=len(demo_users)+1, **user.dict())
    demo_users.append(new_user)
    return new_user
