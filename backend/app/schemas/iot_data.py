from pydantic import BaseModel, Field


class IoTData(BaseModel):
    user_id: str = Field(..., example="user123")
    device_id: str = Field(..., example="esp32-001")
    morning: bool = Field(..., example=True)
    lunch: bool = Field(..., example=False)
    evening: bool = Field(..., example=False)
    bedtime: bool = Field(..., example=False)
    maddy_message: str = Field(..., example="아침 약 복용 감지")
    action_required: str = Field(..., example="none")
    weight_change: float = Field(..., example=-0.2)
    is_taken: bool = Field(..., example=True)
