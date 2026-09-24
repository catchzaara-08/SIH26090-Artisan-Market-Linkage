from app.api.routes.provenance import create_provenance_event


products = [
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


for product in products:
    try:
        create_provenance_event(
            product_id=product["product_id"],
            event_type="PRODUCT_CREATED",
            event_data={
                "artisan": product["artisan"],
                "craft": product["craft"],
                "origin": product["origin"],
                "material": product["material"],
                "verification": "Initial NEELAM product registration",
            },
        )

        print(
            f"NEELAM event created: {product['product_id']}"
        )

    except Exception as exc:
        print(
            f"Failed for {product['product_id']}: {exc}"
        )