from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=50)
    nickname: str = Field(..., min_length=2, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4, max_length=50)


class ConversationLogResponse(BaseModel):
    log_id: str
    role: str
    message: str
    intent: str
    created_at: str


class MedicationProfileResponse(BaseModel):
    habit_strength: str
    preferred_time_windows: Dict[str, str]
    miss_risk_score: float
    notes: str
    updated_at: str


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: str
    created_at: str
    pattern_change_count: int
    medication_profile: MedicationProfileResponse
    conversation_logs: List[ConversationLogResponse] = []

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
