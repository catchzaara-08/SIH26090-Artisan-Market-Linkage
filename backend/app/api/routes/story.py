from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/stories",
    tags=["Digital Storytelling"]
)


STORIES = {
    "NEELAM-BAN-001": {
        "product_id": "NEELAM-BAN-001",
        "title": "The Story of Banaras Gulabi Meenakari",
        "region": "Banaras, Uttar Pradesh",
        "craft": "Gulabi Meenakari",
        "artisan_story": (
            "A traditional craft from Banaras known for detailed "
            "ornamental work and vivid enamel decoration."
        ),
        "craft_story": (
            "The craft combines skilled metalwork with delicate "
            "enamel decoration to create intricate jewellery and "
            "decorative pieces."
        ),
        "video_url": None
    },

    "NEELAM-NEG-002": {
        "product_id": "NEELAM-NEG-002",
        "title": "The Story of Negamam Handloom",
        "region": "Negamam, Tamil Nadu",
        "craft": "Handloom Weaving",
        "artisan_story": (
            "A traditional handloom story from Negamam, connecting "
            "the product with the region's weaving heritage."
        ),
        "craft_story": (
            "The product represents the skill and labour involved "
            "in traditional handloom weaving."
        ),
        "video_url": None
    },

    "NEELAM-KAS-003": {
        "product_id": "NEELAM-KAS-003",
        "title": "The Story of Kashmir Hand-Knotted Carpets",
        "region": "Kashmir",
        "craft": "Hand Knotting",
        "artisan_story": (
            "A handcrafted textile tradition associated with the "
            "rich carpet-making heritage of Kashmir."
        ),
        "craft_story": (
            "The carpet is produced through traditional hand-knotting "
            "techniques using wool and silk."
        ),
        "video_url": None
    },

    "NEELAM-TEX-004": {
        "product_id": "NEELAM-TEX-004",
        "title": "The Story of Traditional Textile Embroidery",
        "region": "India",
        "craft": "Traditional Textile Embroidery",
        "artisan_story": (
            "Traditional embroidery represents generations of textile "
            "knowledge and regional artistic expression."
        ),
        "craft_story": (
            "The collection represents techniques such as Kantha, "
            "Phulkari and Chikankari used to create detailed textile "
            "and home-decor articles."
        ),
        "video_url": None
    },

    "NEELAM-ASS-005": {
        "product_id": "NEELAM-ASS-005",
        "title": "The Story of the Assam Gamosa",
        "region": "Assam",
        "craft": "Handloom Weaving",
        "artisan_story": (
            "The gamosa is closely connected with Assamese cultural "
            "identity and traditional textile practices."
        ),
        "craft_story": (
            "The product represents the skill involved in traditional "
            "handloom weaving and the preservation of regional textile heritage."
        ),
        "video_url": None
    }
}


@router.get("/{product_id}")
def get_product_story(product_id: str):
    story = STORIES.get(product_id)

    if not story:
        raise HTTPException(
            status_code=404,
            detail="Story not found for this product"
        )

    return {
        "message": "Digital story retrieved successfully",
        "story": story
    }