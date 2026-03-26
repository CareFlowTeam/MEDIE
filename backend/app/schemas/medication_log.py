from pydantic import BaseModel, Field
from typing import Optional


class MedicationLogCreate(BaseModel):
    user_id: str = Field(..., min_length=1)
    pill_name: str = Field(..., min_length=1, max_length=100)
    source: str = Field(default="manual", min_length=1, max_length=20)
    taken_at: Optional[str] = None
