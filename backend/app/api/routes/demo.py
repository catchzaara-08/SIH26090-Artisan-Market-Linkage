from fastapi import APIRouter, HTTPException

from app.database.database import SessionLocal
from app.models.product import ProductTable
from app.models.artisan import ArtisanTable
from app.api.routes.provenance import verify_provenance
from app.api.routes.story import STORIES


router = APIRouter(
    prefix="/demo",
    tags=["Prototype Demo"]
)


@router.get("/{product_id}")
def get_complete_demo_product(product_id: str):
    db = SessionLocal()

    try:
        product = (
            db.query(ProductTable)
            .filter(ProductTable.product_id == product_id)
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
                ArtisanTable.artisan_id == product.artisan_id
            )
            .first()
        )

        provenance = verify_provenance(product_id)

        story = STORIES.get(product_id)

        return {
            "neelam": {
                "neelam_id": f"NEELAM-{product.product_id}",
                "authentication_status": (
                    "NEELAM RECORD VERIFIED"
                    if provenance["valid"]
                    else "NEELAM RECORD FOUND - PROVENANCE PENDING"
                ),
            },

            "product": {
                "product_id": product.product_id,
                "name": product.name,
                "description": product.description,
                "craft": product.craft,
                "material": product.material,
                "region": product.region,
                "price": product.price,
                "image_url": product.image_url,
            },

            "artisan": {
                "artisan_id": artisan.artisan_id if artisan else None,
                "name": artisan.name if artisan else "Not available",
                "language": artisan.language if artisan else "Not available",
                "region": artisan.region if artisan else "Not available",
            },

            "gi": {
                "status": product.gi_status
            },

            "provenance": {
                "valid": provenance["valid"],
                "events_verified": provenance.get(
                    "events_verified",
                    0
                ),
            },

            "story": story,

            "digital_product_passport": {
                "passport_id": f"DPP-{product.product_id}",
                "product_id": product.product_id,
                "artisan_id": product.artisan_id,
                "craft": product.craft,
                "origin": product.region,
                "material": product.material,
                "status": "Active",
            },
        }

    finally:
        db.close()