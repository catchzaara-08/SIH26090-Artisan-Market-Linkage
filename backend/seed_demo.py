from app.database.database import SessionLocal
from app.models.artisan import ArtisanTable
from app.models.product import ProductTable


artisans = [
    {
        "artisan_id": "ART-BAN-001",
        "name": "Demo Banaras Artisan",
        "phone": "9000000001",
        "language": "Hindi",
        "region": "Banaras, Uttar Pradesh",
        "craft": "Gulabi Meenakari",
    },
    {
        "artisan_id": "ART-NEG-002",
        "name": "Demo Negamam Weaver",
        "phone": "9000000002",
        "language": "Tamil",
        "region": "Negamam, Tamil Nadu",
        "craft": "Handloom Weaving",
    },
    {
        "artisan_id": "ART-KAS-003",
        "name": "Demo Kashmir Artisan",
        "phone": "9000000003",
        "language": "Hindi",
        "region": "Kashmir",
        "craft": "Hand Knotted Carpet",
    },
    {
        "artisan_id": "ART-TEX-004",
        "name": "Demo Textile Artisan",
        "phone": "9000000004",
        "language": "Hindi",
        "region": "India",
        "craft": "Traditional Textile Embroidery",
    },
    {
        "artisan_id": "ART-ASS-005",
        "name": "Demo Assam Artisan",
        "phone": "9000000005",
        "language": "Bengali",
        "region": "Assam",
        "craft": "Gamosa Weaving",
    },
]


products = [
    {
        "product_id": "NEELAM-BAN-001",
        "artisan_id": "ART-BAN-001",
        "name": "Banaras Gulabi Meenakari",
        "description": "Traditional Banaras Gulabi Meenakari craft item suitable for jewellery and decorative use.",
        "craft": "Gulabi Meenakari",
        "material": "Metal and enamel",
        "region": "Banaras, Uttar Pradesh",
        "gi_status": "Verification Required",
        "image_url": "/images/banaras-gulabi-meenakari.jpg",
        "price": 1500.0,
    },
    {
        "product_id": "NEELAM-NEG-002",
        "artisan_id": "ART-NEG-002",
        "name": "Negamam Handloom Saree",
        "description": "Traditional handloom saree representing the weaving heritage of Negamam, Tamil Nadu.",
        "craft": "Handloom Weaving",
        "material": "Cotton",
        "region": "Negamam, Tamil Nadu",
        "gi_status": "Verification Required",
        "image_url": "/images/negamam-saree.jpg",
        "price": 2200.0,
    },
    {
        "product_id": "NEELAM-KAS-003",
        "artisan_id": "ART-KAS-003",
        "name": "Kashmir Hand-Knotted Woollen and Silk Carpet",
        "description": "Hand-knotted carpet crafted using traditional techniques with woollen and silk materials.",
        "craft": "Hand Knotting",
        "material": "Wool and silk",
        "region": "Kashmir",
        "gi_status": "Verification Required",
        "image_url": "/images/kashmir-carpet.jpg",
        "price": 12000.0,
    },
    {
        "product_id": "NEELAM-TEX-004",
        "artisan_id": "ART-TEX-004",
        "name": "Traditional Embroidered Textile Home Decor",
        "description": "Traditional textile article featuring embroidery and crochet-inspired craft techniques such as Kantha, Phulkari or Chikankari.",
        "craft": "Traditional Textile Embroidery",
        "material": "Cotton textile and thread",
        "region": "India",
        "gi_status": "Verification Required",
        "image_url": "/images/traditional-textile.jpg",
        "price": 1800.0,
    },
    {
        "product_id": "NEELAM-ASS-005",
        "artisan_id": "ART-ASS-005",
        "name": "Assam Gamosa Stole",
        "description": "Traditional Assam handwoven gamosa-style stole representing regional textile heritage.",
        "craft": "Handloom Weaving",
        "material": "Cotton",
        "region": "Assam",
        "gi_status": "Verification Required",
        "image_url": "/images/assam-gamosa.jpg",
        "price": 900.0,
    },
]


def seed_database():
    db = SessionLocal()

    try:
        for artisan_data in artisans:
            existing_artisan = (
                db.query(ArtisanTable)
                .filter(ArtisanTable.artisan_id == artisan_data["artisan_id"])
                .first()
            )

            if not existing_artisan:
                db.add(ArtisanTable(**artisan_data))

        db.commit()

        for product_data in products:
            existing_product = (
                db.query(ProductTable)
                .filter(ProductTable.product_id == product_data["product_id"])
                .first()
            )

            if not existing_product:
                db.add(ProductTable(**product_data))

        db.commit()

        print("Demo data seeded successfully.")
        print(f"Artisans available: {len(artisans)}")
        print(f"Products available: {len(products)}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()