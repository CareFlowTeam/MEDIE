from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.jwt_service import verify_device_jwt
from app.services.crypto_service import decrypt_cryptojs_aes

router = APIRouter(prefix="/pills")

AES_SECRET_KEY = "FRONT_AES_SECRET"

# --- 1. 요청 데이터 규격 (추가) ---
class EncryptedPayload(BaseModel):
    encrypted_data: str

class PillRegisterRequest(BaseModel):
    name: str
    schedule: List[str]
    source: str  # 'ai' 또는 'manual'

# --- 2. 약 직접 등록 API (추가) ---
@router.post("/register")
def register_pill(data: PillRegisterRequest, token=Depends(verify_device_jwt)):
    # JWT 토큰에서 디바이스(유저) ID 추출
    device_id = token["device_id"]
    
    try:
        # TODO: 실제 DB 저장 로직 (예: models.Pill 사용)
        # save_to_db(device_id, data.name, data.schedule, data.source)
        
        print(f"✅ [등록 성공] 기기: {device_id} | 약 이름: {data.name}")
        
        return {
            "success": True, 
            "message": f"{data.name} 등록이 완료되었습니다!",
            "device_id": device_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"등록 실패: {str(e)}")

# --- 3. 내 약 목록 조회 API (추가) ---
@router.get("/list")
def get_pill_list(token=Depends(verify_device_jwt)):
    device_id = token["device_id"]
    
    # TODO: DB에서 device_id 기준 데이터 조회
    # 현재는 프론트 테스트를 위해 가짜 데이터를 보냅니다.
    mock_pills = [
        {"id": 1, "name": "타이레놀", "schedule": ["아침", "점심"], "source": "ai"},
        {"id": 2, "name": "비타민C", "schedule": ["저녁"], "source": "manual"}
    ]
    
    return {"success": True, "pills": mock_pills}

# --- 기존 동기화 코드는 유지 ---
@router.post("/sync")
def sync_pills(payload: EncryptedPayload, token=Depends(verify_device_jwt)):
    device_id = token["device_id"]
    pills = decrypt_cryptojs_aes(payload.encrypted_data, AES_SECRET_KEY)
    # save_pills(device_id, pills)
    return {"success": True, "device_id": device_id, "pill_count": len(pills)}