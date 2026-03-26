from pydantic import BaseModel, Field
from typing import Optional, Dict


class MedicationProfileUpdateRequest(BaseModel):
    habit_strength: Optional[str] = Field(default=None)
    preferred_time_windows: Optional[Dict[str, str]] = Field(default=None)
    miss_risk_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    notes: Optional[str] = Field(default=None)


class ConversationLogCreateRequest(BaseModel):
    role: str = Field(..., min_length=1, max_length=20)
    message: str = Field(..., min_length=1)
    intent: str = Field(..., min_length=1, max_length=50)
