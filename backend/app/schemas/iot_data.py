from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class IoTData(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    user_id: str = "bkh@bkh.com"
    device_id: str = Field(..., alias="deviceId")

    morning: bool = False
    lunch: bool = False
    evening: bool = False
    bedtime: bool = False

    action: str
    pill_status: str
    zone: int = 1
    weight_change: float

    timestamp: str
    epoch: int

    rssi: Optional[int] = None
    free_heap: Optional[int] = None
