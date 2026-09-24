from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageOps


OUTPUT_DIR = Path("processed_images")
OUTPUT_DIR.mkdir(exist_ok=True)


def enhance_product_image(
    image_bytes: bytes,
    output_filename: str
) -> str:
    """
    Lightweight marketplace image enhancement.

    This version uses Pillow only, so it works locally without
    downloading an AI background-removal model.
    """

    try:
        # Open uploaded image
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

        # Automatically correct image orientation
        image = ImageOps.exif_transpose(image)

        # Improve contrast
        image = ImageOps.autocontrast(image)

        # Slight brightness improvement
        image = ImageEnhance.Brightness(image).enhance(1.08)

        # Slight colour improvement
        image = ImageEnhance.Color(image).enhance(1.08)

        # Improve sharpness
        image = ImageEnhance.Sharpness(image).enhance(1.20)

        # Resize very large images while preserving aspect ratio
        max_dimension = 1600

        if max(image.size) > max_dimension:
            image.thumbnail(
                (max_dimension, max_dimension),
                Image.Resampling.LANCZOS
            )

        # Save marketplace-ready image
        output_path = OUTPUT_DIR / output_filename

        image.save(
            output_path,
            format="JPEG",
            quality=95,
            optimize=True
        )

        return str(output_path)

    except Exception as exc:
        raise RuntimeError(
            f"Image enhancement failed: {exc}"
        )