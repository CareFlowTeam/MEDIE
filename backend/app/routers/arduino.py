from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from app.schemas.iot_data import IoTData

router = APIRouter(prefix="/arduino", tags=["arduino"])

# 임시 저장소
arduino_logs = []

KST = timezone(timedelta(hours=9))


@router.post("")
async def receive_arduino_data(data: IoTData):
    try:
        received_at = datetime.now(KST).isoformat()

        record = {
            "id": f"{data.user_id}_{data.device_id}_{int(datetime.now().timestamp())}",
            "user_id": data.user_id,
            "device_id": data.device_id,
            "morning": data.morning,
            "lunch": data.lunch,
            "evening": data.evening,
            "bedtime": data.bedtime,
            "maddy_message": data.maddy_message,
            "action_required": data.action_required,
            "weight_change": data.weight_change,
            "is_taken": data.is_taken,
            "received_at": received_at,
        }

        # TODO: 여기서 실제 DB 저장으로 교체
        arduino_logs.append(record)

        print(f"아두이노 데이터 수신 완료: {data.user_id} / {data.device_id}")
        print(record)

        return {
            "success": True,
            "message": "아두이노 데이터 수신 완료",
            "data": record,
        }

    except Exception as e:
        print("❌ 아두이노 데이터 처리 실패:", e)
        raise HTTPException(
            status_code=500, detail="아두이노 데이터 처리 중 오류가 발생했습니다."
        )


@router.get("/logs")
async def get_arduino_logs():
    return {"success": True, "count": len(arduino_logs), "items": arduino_logs}
