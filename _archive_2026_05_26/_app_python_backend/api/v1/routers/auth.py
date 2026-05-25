from fastapi import APIRouter, HTTPException
from app.schemas.auth import AuthRequest, AuthResponse
from app.core.demo_store import demo_users

router = APIRouter()

@router.post("/login", response_model=AuthResponse)
def login(auth: AuthRequest):
    user = next((u for u in demo_users if u.username == auth.username and u.password == auth.password), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AuthResponse(token="demo-token", user_id=user.id)
