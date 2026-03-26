from pydantic import BaseModel, Field
from datetime import datetime


class WeightLogCreate(BaseModel):
    device_id: str = Field(..., min_length=1)
    weight: float
    timestamp: datetime


class WeightLogResponse(BaseModel):
    id: str
    device_id: str
    weight: float
    timestamp: str
    timestamp_epoch: int
    created_at: str


class WeightCompareResponse(BaseModel):
    device_id: str
    current_weight: float | None
    previous_weight: float | None
    difference: float | None
    current_timestamp: str | None
    previous_timestamp: str | None
