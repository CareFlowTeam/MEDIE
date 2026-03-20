from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=50)
    nickname: str = Field(..., min_length=2, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=50)


class UserResponse(BaseModel):
    id: int
    email: Optional[str] = None
    nickname: str
    login_type: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
