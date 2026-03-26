import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.schemas.medication_log import MedicationLogCreate
from app.services.medication_logs_cosmos_service import (
    get_medication_logs_container,
)
from app.services.user_cosmos_service import get_user_container
from app.schemas.adherence import FinalConfirmRequest

router = APIRouter(prefix="/medication-logs", tags=["medication-logs"])


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def parse_iso_datetime(value: str):
    if not value:
        return None

    try:
        # Z 대응
        value = value.replace("Z", "+00:00")
        return datetime.fromisoformat(value)
    except Exception:
        return None


def time_to_minutes(hhmm: str):
    try:
        hour, minute = hhmm.split(":")
        return int(hour) * 60 + int(minute)
    except Exception:
        return None


def minutes_to_hhmm(total_minutes: int):
    hour = total_minutes // 60
    minute = total_minutes % 60
    return f"{hour:02d}:{minute:02d}"


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


def calculate_morning_average(logs: list):
    """
    morning 기준:
    04:00 이상 ~ 12:00 미만
    """
    morning_minutes = []

    for log in logs:
        taken_at = parse_iso_datetime(log.get("taken_at"))
        if not taken_at:
            continue

        total_minutes = taken_at.hour * 60 + taken_at.minute

        if 4 * 60 <= total_minutes < 12 * 60:
            morning_minutes.append(total_minutes)

    if not morning_minutes:
        return None

    avg_minutes = round(sum(morning_minutes) / len(morning_minutes))
    return {
        "count": len(morning_minutes),
        "average_minutes": avg_minutes,
        "average_time": minutes_to_hhmm(avg_minutes),
    }


def infer_habit_strength(log_count: int):
    """
    단순 휴리스틱:
    - 0~2개: low
    - 3~6개: medium
    - 7개 이상: high
    """
    if log_count >= 7:
        return "high"
    if log_count >= 3:
        return "medium"
    return "low"


@router.post("/")
def create_medication_log(data: MedicationLogCreate):
    container = get_medication_logs_container()

    item = {
        "id": str(uuid.uuid4()),
        "user_id": data.user_id,
        "pill_name": data.pill_name,
        "taken_at": data.taken_at or utc_now_iso(),
        "source": data.source,
    }

    created_item = container.create_item(body=item)
    return {"message": "복약 기록 저장 성공", "item": created_item}


@router.get("/{user_id}")
def get_medication_logs(user_id: str):
    container = get_medication_logs_container()

    query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.taken_at DESC"
    parameters = [{"name": "@user_id", "value": user_id}]

    items = list(
        container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True,
        )
    )

    return {"count": len(items), "items": items}


@router.put("/{item_id}")
def update_medication_log(item_id: str, data: MedicationLogCreate):
    container = get_medication_logs_container()

    try:
        item = container.read_item(item=item_id, partition_key=data.user_id)
    except Exception:
        raise HTTPException(status_code=404, detail="해당 복약 기록이 없습니다.")

    item["pill_name"] = data.pill_name
    item["taken_at"] = data.taken_at or item.get("taken_at") or utc_now_iso()
    item["source"] = data.source

    updated_item = container.replace_item(item=item_id, body=item)

    return {"message": "복약 기록 수정 성공", "item": updated_item}


@router.delete("/{item_id}/{user_id}")
def delete_medication_log(item_id: str, user_id: str):
    container = get_medication_logs_container()

    try:
        container.delete_item(item=item_id, partition_key=user_id)
        return {"message": "복약 기록 삭제 성공"}
    except Exception:
        raise HTTPException(status_code=404, detail="해당 복약 기록이 없습니다.")


@router.get("/summary/{user_id}")
def get_medication_log_summary(user_id: str):
    """
    사용자의 전체 복약 기록 중
    아침 시간대(04:00~11:59) 평균 복용 시간을 계산
    """
    container = get_medication_logs_container()

    query = "SELECT * FROM c WHERE c.user_id = @user_id"
    parameters = [{"name": "@user_id", "value": user_id}]

    logs = list(
        container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True,
        )
    )

    if not logs:
        return {
            "user_id": user_id,
            "log_count": 0,
            "morning_average": None,
            "message": "복약 기록이 없습니다.",
        }

    morning_average = calculate_morning_average(logs)

    return {
        "user_id": user_id,
        "log_count": len(logs),
        "morning_average": morning_average,
    }


@router.post("/recalculate-pattern/{user_id}")
def recalculate_user_medication_pattern(user_id: str):
    """
    medication_logs를 바탕으로
    user 문서의 medication_profile / pattern_change_count 갱신
    """
    logs_container = get_medication_logs_container()
    user_container = get_user_container()

    # 1) 유저 조회
    user = get_user_by_id(user_container, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 2) 복약 로그 조회
    query = "SELECT * FROM c WHERE c.user_id = @user_id"
    parameters = [{"name": "@user_id", "value": user_id}]
    logs = list(
        logs_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True,
        )
    )

    if not logs:
        raise HTTPException(status_code=404, detail="복약 기록이 없습니다.")

    # 3) 평균 계산
    morning_average = calculate_morning_average(logs)

    if not morning_average:
        raise HTTPException(
            status_code=400,
            detail="아침 시간대 복약 기록이 없어 평균을 계산할 수 없습니다.",
        )

    # 4) 기존 user 문서 보정
    if "medication_profile" not in user:
        user["medication_profile"] = {}

    if "preferred_time_windows" not in user["medication_profile"]:
        user["medication_profile"]["preferred_time_windows"] = {}

    if "pattern_change_count" not in user:
        user["pattern_change_count"] = 0

    previous_morning = user["medication_profile"]["preferred_time_windows"].get(
        "morning"
    )
    new_morning = morning_average["average_time"]

    # 5) pattern_change_count 증가 조건
    # 이전 morning 값과 새 값 차이가 30분 이상이면 변화로 간주
    if previous_morning:
        prev_minutes = time_to_minutes(previous_morning)
        new_minutes = time_to_minutes(new_morning)

        if prev_minutes is not None and new_minutes is not None:
            if abs(prev_minutes - new_minutes) >= 30:
                user["pattern_change_count"] += 1

    # 6) medication_profile 업데이트
    user["medication_profile"]["preferred_time_windows"]["morning"] = new_morning
    user["medication_profile"]["habit_strength"] = infer_habit_strength(len(logs))
    user["medication_profile"]["notes"] = f"아침 평균 복용 시간은 {new_morning} 입니다."
    user["medication_profile"]["updated_at"] = utc_now_iso()

    # miss_risk_score는 지금 단계에선 단순 계산
    # 로그 수가 적을수록 놓칠 가능성이 높다고 가정
    if len(logs) >= 10:
        user["medication_profile"]["miss_risk_score"] = 0.1
    elif len(logs) >= 5:
        user["medication_profile"]["miss_risk_score"] = 0.3
    else:
        user["medication_profile"]["miss_risk_score"] = 0.6

    updated_user = user_container.upsert_item(body=user)

    return {
        "message": "사용자 복약 패턴 재계산 성공",
        "user_id": user_id,
        "morning_average": morning_average,
        "updated_user": {
            "id": updated_user["id"],
            "name": updated_user.get("name"),
            "email": updated_user.get("email"),
            "pattern_change_count": updated_user.get("pattern_change_count", 0),
            "medication_profile": updated_user.get("medication_profile", {}),
        },
    }


@router.post("/confirm")
def confirm_medication_taken(data: FinalConfirmRequest):
    """
    사용자가 앱에서 '최종 확인' 버튼을 눌렀을 때
    복약 완료 시각을 medication_logs에 저장하는 API
    """
    container = get_medication_logs_container()

    item = {
        "id": str(uuid.uuid4()),
        "user_id": data.user_id,
        "pill_name": data.pill_name,
        "taken_at": data.taken_at or utc_now_iso(),
        "source": data.source,  # 기본값: app_confirm
    }

    created_item = container.create_item(body=item)

    return {
        "message": "복약 최종 확인 기록 저장 성공",
        "item": created_item,
    }
