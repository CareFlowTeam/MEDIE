import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header

from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.services.user_cosmos_service import get_user_container
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_default_medication_profile():
    now = utc_now_iso()
    return {
        "habit_strength": "medium",
        "preferred_time_windows": {},
        "miss_risk_score": 0.0,
        "notes": "",
        "updated_at": now,
    }


def get_user_by_email(container, email: str):
    query = "SELECT * FROM c WHERE c.email = @email"
    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@email", "value": email}],
            enable_cross_partition_query=True,
        )
    )
    return items[0] if items else None


def build_user_response(user: dict):
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email"),
        "created_at": user.get("created_at", ""),
        "pattern_change_count": user.get("pattern_change_count", 0),
        "medication_profile": user.get(
            "medication_profile",
            get_default_medication_profile(),
        ),
        "conversation_logs": user.get("conversation_logs", []),
    }


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    container = get_user_container()

    existing_user = get_user_by_email(container, payload.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    try:
        now = utc_now_iso()

        user_item = {
            "id": str(uuid.uuid4()),
            "name": payload.nickname,
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "created_at": now,
            "pattern_change_count": 0,
            "medication_profile": {
                "habit_strength": "medium",
                "preferred_time_windows": {},
                "miss_risk_score": 0.0,
                "notes": "",
                "updated_at": now,
            },
            "conversation_logs": [],
        }

        created_user = container.create_item(body=user_item)

        access_token = create_access_token(
            {
                "sub": created_user["email"],
                "name": created_user["name"],
                "user_id": created_user["id"],
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": build_user_response(created_user),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logging.exception("회원가입 실패")
        raise HTTPException(status_code=500, detail="회원가입 중 오류가 발생했습니다.")


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    container = get_user_container()

    user = get_user_by_email(container, payload.email)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    try:
        if not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    needs_update = False

    if "pattern_change_count" not in user:
        user["pattern_change_count"] = 0
        needs_update = True

    if "medication_profile" not in user:
        user["medication_profile"] = get_default_medication_profile()
        needs_update = True

    if "conversation_logs" not in user:
        user["conversation_logs"] = []
        needs_update = True

    if "created_at" not in user:
        user["created_at"] = utc_now_iso()
        needs_update = True

    if needs_update:
        container.upsert_item(body=user)

    access_token = create_access_token(
        {
            "sub": user["email"],
            "name": user["name"],
            "user_id": user["id"],
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": build_user_response(user),
    }


@router.get("/me")
def get_me(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰이 없습니다.")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    container = get_user_container()
    user = get_user_by_email(container, payload.get("sub"))

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    needs_update = False

    if "pattern_change_count" not in user:
        user["pattern_change_count"] = 0
        needs_update = True

    if "medication_profile" not in user:
        user["medication_profile"] = get_default_medication_profile()
        needs_update = True

    if "conversation_logs" not in user:
        user["conversation_logs"] = []
        needs_update = True

    if "created_at" not in user:
        user["created_at"] = utc_now_iso()
        needs_update = True

    if needs_update:
        container.upsert_item(body=user)

    return build_user_response(user)
