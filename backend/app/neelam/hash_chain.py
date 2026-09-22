import hashlib
import json
from datetime import datetime, timezone
from typing import Any


def generate_hash(data: dict[str, Any]) -> str:
    serialized_data = json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":")
    )

    return hashlib.sha256(
        serialized_data.encode("utf-8")
    ).hexdigest()


def create_event(
    event_id: str,
    product_id: str,
    event_type: str,
    event_data: dict[str, Any],
    previous_hash: str
) -> dict[str, Any]:

    timestamp = datetime.now(timezone.utc).isoformat()

    event = {
        "event_id": event_id,
        "product_id": product_id,
        "event_type": event_type,
        "event_data": event_data,
        "timestamp": timestamp,
        "previous_hash": previous_hash,
    }

    event["event_hash"] = generate_hash(event)

    return event