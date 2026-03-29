from pydantic import BaseModel, Field
from typing import Optional


class PillScheduleCreate(BaseModel):
    userId: str
    pillId: str
    pillName: str
    scheduleIndex: int = 0
    label: Optional[str] = ""
    time: str
    enabled: bool = True


class PillScheduleUpdate(BaseModel):
    pillName: Optional[str] = None
    label: Optional[str] = None
    time: Optional[str] = None
    enabled: Optional[bool] = None
