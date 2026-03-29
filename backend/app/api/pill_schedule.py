import uuid
from fastapi import APIRouter, HTTPException
from app.db.cosmos import get_container
from app.schemas.pill_schedule import PillScheduleCreate, PillScheduleUpdate

router = APIRouter(prefix="/pill-schedules", tags=["pill-schedules"])


@router.post("/")
def create_pill_schedule(data: PillScheduleCreate):
    container = get_container()

    item = {
        "id": str(uuid.uuid4()),
        "userId": data.userId,
        "pillId": data.pillId,
        "pillName": data.pillName,
        "scheduleIndex": data.scheduleIndex,
        "label": data.label or "",
        "time": data.time,
        "enabled": data.enabled,
        "type": "pill_schedule",
    }

    created_item = container.create_item(body=item)
    return {"message": "복약 알람 저장 성공", "item": created_item}


@router.get("/{user_id}")
def get_pill_schedules(user_id: str):
    container = get_container()

    query = """
    SELECT * FROM c
    WHERE c.userId = @userId
      AND c.type = "pill_schedule"
    """
    parameters = [{"name": "@userId", "value": user_id}]

    items = list(
        container.query_items(
            query=query, parameters=parameters, enable_cross_partition_query=True
        )
    )

    return {"count": len(items), "items": items}


@router.get("/{user_id}/pill/{pill_id}")
def get_pill_schedule_by_pill(user_id: str, pill_id: str):
    container = get_container()

    query = """
    SELECT * FROM c
    WHERE c.userId = @userId
      AND c.pillId = @pillId
      AND c.type = "pill_schedule"
    """
    parameters = [
        {"name": "@userId", "value": user_id},
        {"name": "@pillId", "value": pill_id},
    ]

    items = list(
        container.query_items(
            query=query, parameters=parameters, enable_cross_partition_query=True
        )
    )

    return {"count": len(items), "items": items}


@router.put("/{item_id}/{user_id}")
def update_pill_schedule(item_id: str, user_id: str, data: PillScheduleUpdate):
    container = get_container()

    try:
        item = container.read_item(item=item_id, partition_key=user_id)
    except Exception:
        raise HTTPException(status_code=404, detail="해당 일정이 없습니다.")

    if data.pillName is not None:
        item["pillName"] = data.pillName
    if data.label is not None:
        item["label"] = data.label
    if data.time is not None:
        item["time"] = data.time
    if data.enabled is not None:
        item["enabled"] = data.enabled

    updated_item = container.replace_item(item=item_id, body=item)
    return {"message": "복약 알람 수정 성공", "item": updated_item}


@router.delete("/{item_id}/{user_id}")
def delete_pill_schedule(item_id: str, user_id: str):
    container = get_container()

    try:
        container.delete_item(item=item_id, partition_key=user_id)
        return {"message": "복약 알람 삭제 성공"}
    except Exception:
        raise HTTPException(status_code=404, detail="해당 일정이 없습니다.")


@router.delete("/pill/{pill_id}/{user_id}")
def delete_pill_schedules_by_pill(pill_id: str, user_id: str):
    container = get_container()

    query = """
    SELECT c.id FROM c
    WHERE c.userId = @userId
      AND c.pillId = @pillId
      AND c.type = "pill_schedule"
    """
    parameters = [
        {"name": "@userId", "value": user_id},
        {"name": "@pillId", "value": pill_id},
    ]

    items = list(
        container.query_items(
            query=query, parameters=parameters, enable_cross_partition_query=True
        )
    )

    for item in items:
        container.delete_item(item=item["id"], partition_key=user_id)

    return {"message": "복약 알람 전체 삭제 성공", "deletedCount": len(items)}
