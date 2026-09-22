from fastapi import APIRouter

from app.neelam.hash_chain import create_event, generate_hash


router = APIRouter(
    prefix="/neelam",
    tags=["NEELAM Provenance"]
)


provenance_events = {}


@router.post("/{product_id}/events")
def create_provenance_event(
    product_id: str,
    event_type: str,
    event_data: dict
):
    product_events = provenance_events.setdefault(product_id, [])

    if product_events:
        previous_hash = product_events[-1]["event_hash"]
    else:
        previous_hash = "000000"

    event_id = f"EVT-{product_id}-{len(product_events) + 1}"

    event = create_event(
        event_id=event_id,
        product_id=product_id,
        event_type=event_type,
        event_data=event_data,
        previous_hash=previous_hash
    )

    product_events.append(event)

    return event


@router.get("/{product_id}")
def get_provenance_history(product_id: str):
    return provenance_events.get(product_id, [])


@router.get("/{product_id}/verify")
def verify_provenance(product_id: str):
    product_events = provenance_events.get(product_id, [])

    if not product_events:
        return {
            "product_id": product_id,
            "valid": False,
            "message": "No provenance history found"
        }

    errors = []

    for index, event in enumerate(product_events):

        event_without_hash = {
            "event_id": event["event_id"],
            "product_id": event["product_id"],
            "event_type": event["event_type"],
            "event_data": event["event_data"],
            "timestamp": event["timestamp"],
            "previous_hash": event["previous_hash"]
        }

        recalculated_hash = generate_hash(
            event_without_hash
        )

        if recalculated_hash != event["event_hash"]:
            errors.append(
                f"Event {event['event_id']} hash mismatch"
            )

        expected_previous_hash = (
            "000000"
            if index == 0
            else product_events[index - 1]["event_hash"]
        )

        if event["previous_hash"] != expected_previous_hash:
            errors.append(
                f"Event {event['event_id']} previous hash mismatch"
            )

    if errors:
        return {
            "product_id": product_id,
            "valid": False,
            "message": "Provenance chain verification failed",
            "errors": errors
        }

    return {
        "product_id": product_id,
        "valid": True,
        "message": "Provenance chain is valid",
        "events_verified": len(product_events)
    }