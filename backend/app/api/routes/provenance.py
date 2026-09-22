from fastapi import APIRouter

from app.neelam.hash_chain import create_event


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
