from pydantic import BaseModel

class AuthRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: int


# --- Added User model for compatibility ---
class User(BaseModel):
    id: int
    username: str
    email: str = ""
