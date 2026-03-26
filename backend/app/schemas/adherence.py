from pydantic import BaseModel, Field
from typing import Optional


class FinalConfirmRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    pill_name: str = Field(..., min_length=1, max_length=100)
    taken_at: Optional[str] = None
    source: str = Field(default="app_confirm", min_length=1, max_length=30)
