from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from app.schemas.iot_data import IoTData

router = APIRouter(prefix="/webhook", tags=["arduino"])

arduino_logs = []

KST = timezone(timedelta(hours=9))


@router.post("/weight-log")
async def receive_arduino_data(data: IoTData):
    try:
        received_at = datetime.now(KST).isoformat()
        is_taken = data.action.upper() == "TAKEN"

        record = {
            "id": f"{data.user_id}_{data.device_id}_{data.epoch}",
            "user_id": data.user_id,
            "device_id": data.device_id,
            "morning": data.morning,
            "lunch": data.lunch,
            "evening": data.evening,
            "bedtime": data.bedtime,
            "action": data.action,
            "pill_status": data.pill_status,
            "zone": data.zone,
            "weight_change": data.weight_change,
            "timestamp": data.timestamp,
            "epoch": data.epoch,
            "rssi": data.rssi,
            "free_heap": data.free_heap,
            "is_taken": is_taken,
            "received_at": received_at,
        }

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


@router.get("/weight-log/logs")
async def get_arduino_logs():
    return {
        "success": True,
        "count": len(arduino_logs),
        "items": arduino_logs,
    }
