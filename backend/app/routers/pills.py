from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.jwt_service import verify_access_jwt
from app.services.crypto_service import decrypt_cryptojs_aes

router = APIRouter(prefix="/pills", tags=["pills"])

AES_SECRET_KEY = "FRONT_AES_SECRET"


class EncryptedPayload(BaseModel):
    encrypted_data: str


class PillRegisterRequest(BaseModel):
    name: str
    schedule: List[str]
    source: str  # 'ai' 또는 'manual'


def extract_user_id_from_token(token: dict) -> str:
    user_id = token.get("user_id") or token.get("sub") or token.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="유효한 사용자 토큰이 아닙니다.")
    return str(user_id)


@router.post("/register")
def register_pill(data: PillRegisterRequest, token=Depends(verify_access_jwt)):
    user_id = extract_user_id_from_token(token)

    try:
        # TODO: 실제 DB 저장 로직
        # save_to_db(user_id, data.name, data.schedule, data.source)

        print(
            f"✅ [등록 성공] 사용자: {user_id} | 약 이름: {data.name} | schedule: {data.schedule}"
        )

        return {
            "success": True,
            "message": f"{data.name} 등록이 완료되었습니다!",
            "user_id": user_id,
            "pill": {
                "name": data.name,
                "schedule": data.schedule,
                "source": data.source,
            },
        }
    except Exception as e:
        print("❌ register_pill error:", str(e))
        raise HTTPException(status_code=500, detail=f"등록 실패: {str(e)}")


@router.get("/list")
def get_pill_list(token=Depends(verify_access_jwt)):
    user_id = extract_user_id_from_token(token)

    mock_pills = [
        {"id": 1, "name": "타이레놀", "schedule": ["아침", "점심"], "source": "ai"},
        {"id": 2, "name": "비타민C", "schedule": ["저녁"], "source": "manual"},
    ]

    return {
        "success": True,
        "user_id": user_id,
        "pills": mock_pills,
    }


@router.post("/sync")
def sync_pills(payload: EncryptedPayload, token=Depends(verify_access_jwt)):
    user_id = extract_user_id_from_token(token)

    try:
        pills = decrypt_cryptojs_aes(payload.encrypted_data, AES_SECRET_KEY)
        # save_pills(user_id, pills)

        return {
            "success": True,
            "user_id": user_id,
            "pill_count": len(pills),
        }
    except Exception as e:
        print("❌ sync_pills error:", str(e))
        raise HTTPException(status_code=500, detail=f"동기화 실패: {str(e)}")
