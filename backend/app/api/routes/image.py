from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

from app.services.image_ai import enhance_product_image


router = APIRouter(
    prefix="/image",
    tags=["AI Image Processing"]
)


@router.post("/enhance")
async def enhance_image(
    file: UploadFile = File(...)
):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WEBP images are supported"
        )

    image_bytes = await file.read()

    output_filename = f"professional_{file.filename.rsplit('.', 1)[0]}.jpg"

    output_path = enhance_product_image(
        image_bytes=image_bytes,
        output_filename=output_filename
    )

    return FileResponse(
        output_path,
        media_type="image/jpeg",
        filename=output_filename
    )