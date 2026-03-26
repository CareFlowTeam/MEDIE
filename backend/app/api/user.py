import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.services.user_cosmos_service import get_user_container
from app.schemas.user_profile import (
    MedicationProfileUpdateRequest,
    ConversationLogCreateRequest,
)

router = APIRouter(prefix="/users", tags=["users"])


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_default_medication_profile():
    return {
        "habit_strength": "medium",
        "preferred_time_windows": {},
        "miss_risk_score": 0.0,
        "notes": "",
        "updated_at": utc_now_iso(),
    }


def get_user_by_id(container, user_id: str):
    query = "SELECT * FROM c WHERE c.id = @user_id"
    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@user_id", "value": user_id}],
            enable_cross_partition_query=True,
        )
    )
    return items[0] if items else None


@router.put("/medication-profile/{user_id}")
def update_medication_profile(user_id: str, data: MedicationProfileUpdateRequest):
    container = get_user_container()

    user = get_user_by_id(container, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if "medication_profile" not in user or not isinstance(
        user["medication_profile"], dict
    ):
        user["medication_profile"] = get_default_medication_profile()

    current_profile = user["medication_profile"]

    if data.habit_strength is not None:
        current_profile["habit_strength"] = data.habit_strength

    if data.preferred_time_windows is not None:
        current_profile["preferred_time_windows"] = data.preferred_time_windows

    if data.miss_risk_score is not None:
        current_profile["miss_risk_score"] = data.miss_risk_score

    if data.notes is not None:
        current_profile["notes"] = data.notes

    current_profile["updated_at"] = utc_now_iso()

    updated_user = container.upsert_item(body=user)

    return {
        "message": "복약 성향 업데이트 성공",
        "user_id": updated_user["id"],
        "medication_profile": updated_user["medication_profile"],
    }


@router.post("/conversation-log/{user_id}")
def add_conversation_log(user_id: str, data: ConversationLogCreateRequest):
    container = get_user_container()

    user = get_user_by_id(container, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if "conversation_logs" not in user or not isinstance(
        user["conversation_logs"], list
    ):
        user["conversation_logs"] = []

    log = {
        "log_id": str(uuid.uuid4()),
        "role": data.role,
        "message": data.message,
        "intent": data.intent,
        "created_at": utc_now_iso(),
    }

    user["conversation_logs"].append(log)

    updated_user = container.upsert_item(body=user)

    return {
        "message": "대화 로그 저장 성공",
        "user_id": updated_user["id"],
        "log": log,
        "conversation_log_count": len(updated_user.get("conversation_logs", [])),
    }


@router.get("/{user_id}")
def get_user_detail(user_id: str):
    container = get_user_container()

    user = get_user_by_id(container, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return {
        "id": user.get("id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "created_at": user.get("created_at"),
        "pattern_change_count": user.get("pattern_change_count", 0),
        "medication_profile": user.get(
            "medication_profile",
            get_default_medication_profile(),
        ),
        "conversation_logs": user.get("conversation_logs", []),
    }
