import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.db.cosmos import get_container
from app.schemas.weight_log import (
    WeightLogCreate,
    WeightCompareResponse,
)

router = APIRouter(prefix="/weight-logs", tags=["weight-logs"])


@router.post("/")
def create_weight_log(data: WeightLogCreate):
    container = get_container("weight_logs")

    ts = data.timestamp
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    else:
        ts = ts.astimezone(timezone.utc)

    now_utc = datetime.now(timezone.utc)

    item = {
        "id": str(uuid.uuid4()),
        "device_id": data.device_id,
        "weight": data.weight,
        "timestamp": ts.isoformat(),
        "timestamp_epoch": int(ts.timestamp()),
        "created_at": now_utc.isoformat(),
    }

    container.create_item(body=item)

    return {
        "success": True,
        "message": "Weight log created successfully",
        "data": item,
    }


@router.get("/{device_id}/latest")
def get_latest_weight_log(device_id: str):
    container = get_container("weight_logs")

    query = """
    SELECT TOP 1 *
    FROM c
    WHERE c.device_id = @device_id
    ORDER BY c.timestamp_epoch DESC
    """

    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@device_id", "value": device_id}],
            partition_key=device_id,
        )
    )

    if not items:
        raise HTTPException(
            status_code=404, detail="No weight logs found for this device"
        )

    return {"success": True, "data": items[0]}


@router.get("/{device_id}/latest-compare", response_model=WeightCompareResponse)
def get_latest_compare(device_id: str):
    container = get_container("weight_logs")

    query = """
    SELECT TOP 2 *
    FROM c
    WHERE c.device_id = @device_id
    ORDER BY c.timestamp_epoch DESC
    """

    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@device_id", "value": device_id}],
            partition_key=device_id,
        )
    )

    if not items:
        raise HTTPException(
            status_code=404, detail="No weight logs found for this device"
        )

    current = items[0]
    previous = items[1] if len(items) > 1 else None

    current_weight = current["weight"]
    previous_weight = previous["weight"] if previous else None

    difference = None
    if previous_weight is not None:
        difference = round(current_weight - previous_weight, 2)

    return {
        "device_id": device_id,
        "current_weight": current_weight,
        "previous_weight": previous_weight,
        "difference": difference,
        "current_timestamp": current["timestamp"],
        "previous_timestamp": previous["timestamp"] if previous else None,
    }


@router.get("/{device_id}/logs")
def get_weight_logs(device_id: str, limit: int = 20):
    container = get_container("weight_logs")

    safe_limit = max(1, min(limit, 100))

    query = f"""
    SELECT TOP {safe_limit} *
    FROM c
    WHERE c.device_id = @device_id
    ORDER BY c.timestamp_epoch DESC
    """

    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@device_id", "value": device_id}],
            partition_key=device_id,
        )
    )

    return {"success": True, "count": len(items), "data": items}
