from fastapi import APIRouter, HTTPException

from app.neelam.hash_chain import create_event, generate_hash
from app.database.database import SessionLocal
from app.models.product import ProductTable
from app.models.artisan import ArtisanTable


router = APIRouter(
    prefix="/neelam",
    tags=["NEELAM Provenance"]
)


# Prototype in-memory provenance storage
provenance_events = {}


@router.post("/{product_id}/events")
def create_provenance_event(
    product_id: str,
    event_type: str,
    event_data: dict
):
    product_events = provenance_events.setdefault(
        product_id,
        []
    )

    previous_hash = (
        product_events[-1]["event_hash"]
        if product_events
        else "000000"
    )

    event_id = (
        f"EVT-{product_id}-{len(product_events) + 1}"
    )

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
    return provenance_events.get(
        product_id,
        []
    )


@router.get("/{product_id}/verify")
def verify_provenance(product_id: str):
    product_events = provenance_events.get(
        product_id,
        []
    )

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
                f"Event {event['event_id']} "
                "previous hash mismatch"
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


@router.get("/{product_id}/authenticate")
def authenticate_product(product_id: str):

    db = SessionLocal()

    try:
        product = (
            db.query(ProductTable)
            .filter(
                ProductTable.product_id == product_id
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        artisan = (
            db.query(ArtisanTable)
            .filter(
                ArtisanTable.artisan_id
                == product.artisan_id
            )
            .first()
        )

        provenance_result = verify_provenance(
            product_id
        )

        return {
            "neelam_id": (
                f"NEELAM-{product.product_id}"
            ),

            "product": {
                "product_id": product.product_id,
                "name": product.name,
                "craft": product.craft,
                "material": product.material,
                "region": product.region,
                "price": product.price
            },

            "artisan": {
                "artisan_id": (
                    artisan.artisan_id
                    if artisan
                    else None
                ),
                "name": (
                    artisan.name
                    if artisan
                    else "Not available"
                ),
                "language": (
                    artisan.language
                    if artisan
                    else "Not available"
                ),
                "region": (
                    artisan.region
                    if artisan
                    else "Not available"
                )
            },

            "gi": {
                "status": product.gi_status
            },

            "provenance": {
                "valid": provenance_result["valid"],
                "events_verified": provenance_result.get(
                    "events_verified",
                    0
                )
            },

            "authentication_status": (
                "NEELAM RECORD VERIFIED"
                if provenance_result["valid"]
                else "NEELAM RECORD FOUND - "
                     "PROVENANCE PENDING"
            ),

            "message": (
                "NEELAM connects the product with "
                "its artisan, craft, origin, GI "
                "information and provenance history."
            )
        }

    finally:
        db.close()


def initialize_demo_provenance():

    demo_products = [
        {
            "product_id": "NEELAM-BAN-001",
            "artisan": "Demo Banaras Artisan",
            "craft": "Gulabi Meenakari",
            "origin": "Banaras, Uttar Pradesh",
            "material": "Metal and enamel",
        },
        {
            "product_id": "NEELAM-NEG-002",
            "artisan": "Demo Negamam Weaver",
            "craft": "Handloom Weaving",
            "origin": "Negamam, Tamil Nadu",
            "material": "Cotton",
        },
        {
            "product_id": "NEELAM-KAS-003",
            "artisan": "Demo Kashmir Artisan",
            "craft": "Hand Knotted Carpet",
            "origin": "Kashmir",
            "material": "Wool and silk",
        },
        {
            "product_id": "NEELAM-TEX-004",
            "artisan": "Demo Textile Artisan",
            "craft": "Traditional Textile Embroidery",
            "origin": "India",
            "material": "Cotton textile and thread",
        },
        {
            "product_id": "NEELAM-ASS-005",
            "artisan": "Demo Assam Artisan",
            "craft": "Handloom Weaving",
            "origin": "Assam",
            "material": "Cotton",
        },
    ]

    for product in demo_products:

        product_events = provenance_events.get(
            product["product_id"],
            []
        )

        if product_events:
            continue

        event_id = (
            f"EVT-{product['product_id']}-1"
        )

        event = create_event(
            event_id=event_id,
            product_id=product["product_id"],
            event_type="PRODUCT_CREATED",
            event_data={
                "artisan": product["artisan"],
                "craft": product["craft"],
                "origin": product["origin"],
                "material": product["material"],
                "verification": (
                    "Initial NEELAM product registration"
                ),
            },
            previous_hash="000000",
        )

        provenance_events[
            product["product_id"]
        ] = [event]