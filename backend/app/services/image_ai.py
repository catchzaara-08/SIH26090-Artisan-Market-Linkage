from io import BytesIO
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps
from rembg import remove


OUTPUT_DIR = Path("processed_images")
OUTPUT_DIR.mkdir(exist_ok=True)


def enhance_product_image(
    image_bytes: bytes,
    output_filename: str
) -> str:

    # 1. Remove the background using AI
    removed_background = remove(image_bytes)

    # 2. Convert result to an RGBA image
    foreground = Image.open(
        BytesIO(removed_background)
    ).convert("RGBA")

    # 3. Create a clean white professional background
    background = Image.new(
        "RGBA",
        foreground.size,
        (255, 255, 255, 255)
    )

    # 4. Place the actual artisan product on the background
    professional_image = Image.alpha_composite(
        background,
        foreground
    )

    # 5. Convert to RGB for marketplace-friendly JPEG output
    professional_image = professional_image.convert("RGB")

    # 6. Automatically improve contrast
    professional_image = ImageOps.autocontrast(
        professional_image
    )

    # 7. Improve brightness
    professional_image = ImageEnhance.Brightness(
        professional_image
    ).enhance(1.05)

    # 8. Improve colour
    professional_image = ImageEnhance.Color(
        professional_image
    ).enhance(1.05)

    # 9. Improve sharpness
    professional_image = ImageEnhance.Sharpness(
        professional_image
    ).enhance(1.20)

    # 10. Save the professional image
    output_path = OUTPUT_DIR / output_filename

    professional_image.save(
        output_path,
        format="JPEG",
        quality=95,
        optimize=True
    )

    return str(output_path)