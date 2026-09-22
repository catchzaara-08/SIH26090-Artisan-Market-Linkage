import os
from io import BytesIO

import qrcode
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.database.database import SessionLocal
from app.models.product import ProductTable


router = APIRouter(
    prefix="/qr",
    tags=["QR Codes"]
)


@router.get("/{product_id}")
def generate_qr(product_id: str):
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

        public_base_url = os.getenv(
            "PUBLIC_BASE_URL",
            "http://127.0.0.1:8000"
        )

        product_url = f"{public_base_url}/products/{product_id}"

        qr = qrcode.make(product_url)

        image_bytes = BytesIO()
        qr.save(image_bytes, format="PNG")
        image_bytes.seek(0)

        return StreamingResponse(
            image_bytes,
            media_type="image/png"
        )

    finally:
        db.close()