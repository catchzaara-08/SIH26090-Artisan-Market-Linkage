from app.database.database import SessionLocal
from app.models.artisan import ArtisanTable
from app.models.product import ProductTable


# ============================================================
# DEMO ARTISANS
# ============================================================

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
    {
        "artisan_id": "ART-KAR-006",
        "name": "Demo Channapatna Artisan",
        "phone": "9000000006",
        "language": "Kannada",
        "region": "Channapatna, Karnataka",
        "craft": "Wooden Toy Making",
    },
    {
        "artisan_id": "ART-TEL-007",
        "name": "Demo Pochampally Weaver",
        "phone": "9000000007",
        "language": "Telugu",
        "region": "Pochampally, Telangana",
        "craft": "Ikat Weaving",
    },
    {
        "artisan_id": "ART-KER-008",
        "name": "Demo Aranmula Artisan",
        "phone": "9000000008",
        "language": "Malayalam",
        "region": "Aranmula, Kerala",
        "craft": "Metal Mirror Making",
    },
    {
        "artisan_id": "ART-AND-009",
        "name": "Demo Kondapalli Artisan",
        "phone": "9000000009",
        "language": "Telugu",
        "region": "Kondapalli, Andhra Pradesh",
        "craft": "Wooden Toy Making",
    },
    {
        "artisan_id": "ART-BIH-010",
        "name": "Demo Madhubani Artisan",
        "phone": "9000000010",
        "language": "Hindi",
        "region": "Madhubani, Bihar",
        "craft": "Madhubani Painting",
    },
]


# ============================================================
# DEMO PRODUCTS
# ============================================================
# Distribution:
#
# Tamil Nadu          = 5
# Uttar Pradesh       = 4
# Karnataka           = 3
# Assam               = 3
# Kerala              = 3
# Telangana           = 2
# Bihar               = 2
# Kashmir             = 2
# Andhra Pradesh      = 1
#
# Total               = 25 products
# ============================================================

products = [

    # --------------------------------------------------------
    # UTTAR PRADESH — 4
    # --------------------------------------------------------

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
        "product_id": "NEELAM-BAN-011",
        "artisan_id": "ART-BAN-001",
        "name": "Banaras Meenakari Pendant",
        "description": "Decorative handcrafted pendant inspired by traditional Banaras enamel craft.",
        "craft": "Gulabi Meenakari",
        "material": "Metal and enamel",
        "region": "Banaras, Uttar Pradesh",
        "gi_status": "Verification Required",
        "image_url": "/images/banaras-pendant.jpg",
        "price": 1200.0,
    },

    {
        "product_id": "NEELAM-BAN-012",
        "artisan_id": "ART-BAN-001",
        "name": "Banaras Enamel Decorative Plate",
        "description": "Handcrafted decorative plate featuring traditional enamel detailing.",
        "craft": "Gulabi Meenakari",
        "material": "Metal and enamel",
        "region": "Banaras, Uttar Pradesh",
        "gi_status": "Verification Required",
        "image_url": "/images/banaras-plate.jpg",
        "price": 1850.0,
    },

    {
        "product_id": "NEELAM-BAN-013",
        "artisan_id": "ART-BAN-001",
        "name": "Banaras Meenakari Craft Box",
        "description": "Small decorative craft box featuring traditional Banaras enamel work.",
        "craft": "Gulabi Meenakari",
        "material": "Metal and enamel",
        "region": "Banaras, Uttar Pradesh",
        "gi_status": "Verification Required",
        "image_url": "/images/banaras-box.jpg",
        "price": 2100.0,
    },


    # --------------------------------------------------------
    # TAMIL NADU — 5
    # --------------------------------------------------------

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
        "product_id": "NEELAM-NEG-014",
        "artisan_id": "ART-NEG-002",
        "name": "Negamam Cotton Dupatta",
        "description": "Handwoven cotton dupatta inspired by traditional Negamam weaving.",
        "craft": "Handloom Weaving",
        "material": "Cotton",
        "region": "Negamam, Tamil Nadu",
        "gi_status": "Verification Required",
        "image_url": "/images/negamam-dupatta.jpg",
        "price": 950.0,
    },

    {
        "product_id": "NEELAM-NEG-015",
        "artisan_id": "ART-NEG-002",
        "name": "Negamam Handloom Shawl",
        "description": "Traditional handwoven textile created using cotton weaving techniques.",
        "craft": "Handloom Weaving",
        "material": "Cotton",
        "region": "Negamam, Tamil Nadu",
        "gi_status": "Verification Required",
        "image_url": "/images/negamam-shawl.jpg",
        "price": 1400.0,
    },

    {
        "product_id": "NEELAM-NEG-016",
        "artisan_id": "ART-NEG-002",
        "name": "Negamam Cotton Home Textile",
        "description": "Handwoven cotton textile suitable for traditional home use.",
        "craft": "Handloom Weaving",
        "material": "Cotton",
        "region": "Negamam, Tamil Nadu",
        "gi_status": "Verification Required",
        "image_url": "/images/negamam-home-textile.jpg",
        "price": 1250.0,
    },

    {
        "product_id": "NEELAM-NEG-017",
        "artisan_id": "ART-NEG-002",
        "name": "Negamam Traditional Saree Set",
        "description": "Traditional handloom saree set showcasing regional weaving techniques.",
        "craft": "Handloom Weaving",
        "material": "Cotton",
        "region": "Negamam, Tamil Nadu",
        "gi_status": "Verification Required",
        "image_url": "/images/negamam-saree-set.jpg",
        "price": 2600.0,
    },


    # --------------------------------------------------------
    # KASHMIR — 2
    # --------------------------------------------------------

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
        "product_id": "NEELAM-KAS-018",
        "artisan_id": "ART-KAS-003",
        "name": "Kashmir Wool Hand-Knotted Rug",
        "description": "Traditional hand-knotted wool rug showcasing Kashmir carpet-making techniques.",
        "craft": "Hand Knotting",
        "material": "Wool",
        "region": "Kashmir",
        "gi_status": "Verification Required",
        "image_url": "/images/kashmir-rug.jpg",
        "price": 8500.0,
    },


    # --------------------------------------------------------
    # ASSAM — 3
    # --------------------------------------------------------

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

    {
        "product_id": "NEELAM-ASS-019",
        "artisan_id": "ART-ASS-005",
        "name": "Assam Handwoven Gamosa",
        "description": "Traditional handwoven cotton textile representing Assam's weaving heritage.",
        "craft": "Gamosa Weaving",
        "material": "Cotton",
        "region": "Assam",
        "gi_status": "Verification Required",
        "image_url": "/images/assam-gamosa-2.jpg",
        "price": 650.0,
    },

    {
        "product_id": "NEELAM-ASS-020",
        "artisan_id": "ART-ASS-005",
        "name": "Assam Traditional Cotton Textile",
        "description": "Handwoven cotton textile inspired by traditional Assamese patterns.",
        "craft": "Gamosa Weaving",
        "material": "Cotton",
        "region": "Assam",
        "gi_status": "Verification Required",
        "image_url": "/images/assam-textile.jpg",
        "price": 1100.0,
    },


    # --------------------------------------------------------
    # KARNATAKA — 3
    # --------------------------------------------------------

    {
        "product_id": "NEELAM-KAR-006",
        "artisan_id": "ART-KAR-006",
        "name": "Channapatna Wooden Craft Toy",
        "description": "Traditional lacquered wooden craft product representing the toy-making heritage of Channapatna.",
        "craft": "Wooden Toy Making",
        "material": "Wood and natural lacquer",
        "region": "Channapatna, Karnataka",
        "gi_status": "Verification Required",
        "image_url": "/images/channapatna-toy.jpg",
        "price": 750.0,
    },

    {
        "product_id": "NEELAM-KAR-021",
        "artisan_id": "ART-KAR-006",
        "name": "Channapatna Wooden Spinning Toy",
        "description": "Colourful handcrafted wooden toy made using traditional turning and lacquering techniques.",
        "craft": "Wooden Toy Making",
        "material": "Wood and natural lacquer",
        "region": "Channapatna, Karnataka",
        "gi_status": "Verification Required",
        "image_url": "/images/channapatna-spinning-toy.jpg",
        "price": 500.0,
    },

    {
        "product_id": "NEELAM-KAR-022",
        "artisan_id": "ART-KAR-006",
        "name": "Channapatna Wooden Decorative Set",
        "description": "Traditional handcrafted wooden decorative set inspired by Channapatna toy-making.",
        "craft": "Wooden Toy Making",
        "material": "Wood and natural lacquer",
        "region": "Channapatna, Karnataka",
        "gi_status": "Verification Required",
        "image_url": "/images/channapatna-set.jpg",
        "price": 1300.0,
    },


    # --------------------------------------------------------
    # TELANGANA — 2
    # --------------------------------------------------------

    {
        "product_id": "NEELAM-TEL-007",
        "artisan_id": "ART-TEL-007",
        "name": "Pochampally Ikat Textile",
        "description": "Traditional Ikat textile showcasing the distinctive tie-and-dye weaving techniques of Pochampally.",
        "craft": "Ikat Weaving",
        "material": "Cotton and silk",
        "region": "Pochampally, Telangana",
        "gi_status": "Verification Required",
        "image_url": "/images/pochampally-ikat.jpg",
        "price": 2800.0,
    },

    {
        "product_id": "NEELAM-TEL-023",
        "artisan_id": "ART-TEL-007",
        "name": "Pochampally Ikat Dupatta",
        "description": "Traditional Ikat-woven textile accessory inspired by the Pochampally weaving tradition.",
        "craft": "Ikat Weaving",
        "material": "Cotton and silk",
        "region": "Pochampally, Telangana",
        "gi_status": "Verification Required",
        "image_url": "/images/pochampally-dupatta.jpg",
        "price": 1600.0,
    },


    # --------------------------------------------------------
    # KERALA — 3
    # --------------------------------------------------------

    {
        "product_id": "NEELAM-KER-008",
        "artisan_id": "ART-KER-008",
        "name": "Aranmula Traditional Metal Mirror",
        "description": "Traditional handcrafted metal mirror representing the heritage craft of Aranmula, Kerala.",
        "craft": "Metal Mirror Making",
        "material": "Special metal alloy",
        "region": "Aranmula, Kerala",
        "gi_status": "Verification Required",
        "image_url": "/images/aranmula-mirror.jpg",
        "price": 4500.0,
    },

    {
        "product_id": "NEELAM-KER-024",
        "artisan_id": "ART-KER-008",
        "name": "Aranmula Decorative Mirror",
        "description": "Handcrafted traditional metal mirror with a decorative frame.",
        "craft": "Metal Mirror Making",
        "material": "Special metal alloy",
        "region": "Aranmula, Kerala",
        "gi_status": "Verification Required",
        "image_url": "/images/aranmula-decorative-mirror.jpg",
        "price": 5200.0,
    },

    {
        "product_id": "NEELAM-KER-025",
        "artisan_id": "ART-KER-008",
        "name": "Aranmula Heritage Mirror",
        "description": "Traditional handcrafted mirror representing Kerala's metal craft heritage.",
        "craft": "Metal Mirror Making",
        "material": "Special metal alloy",
        "region": "Aranmula, Kerala",
        "gi_status": "Verification Required",
        "image_url": "/images/aranmula-heritage-mirror.jpg",
        "price": 6000.0,
    },


    # --------------------------------------------------------
    # ANDHRA PRADESH — 1
    # --------------------------------------------------------

    {
        "product_id": "NEELAM-AND-009",
        "artisan_id": "ART-AND-009",
        "name": "Kondapalli Wooden Figurine",
        "description": "Handcrafted wooden figurine inspired by the traditional toy-making heritage of Kondapalli.",
        "craft": "Wooden Toy Making",
        "material": "Softwood and natural colours",
        "region": "Kondapalli, Andhra Pradesh",
        "gi_status": "Verification Required",
        "image_url": "/images/kondapalli-toy.jpg",
        "price": 1100.0,
    },


    # --------------------------------------------------------
    # BIHAR — 2
    # --------------------------------------------------------

    {
        "product_id": "NEELAM-BIH-010",
        "artisan_id": "ART-BIH-010",
        "name": "Madhubani Folk Art Painting",
        "description": "Traditional folk painting inspired by the Madhubani artistic tradition of Bihar.",
        "craft": "Madhubani Painting",
        "material": "Handmade paper and natural pigments",
        "region": "Madhubani, Bihar",
        "gi_status": "Verification Required",
        "image_url": "/images/madhubani-painting.jpg",
        "price": 2500.0,
    },

    {
        "product_id": "NEELAM-BIH-026",
        "artisan_id": "ART-BIH-010",
        "name": "Madhubani Floral Folk Painting",
        "description": "Hand-painted folk artwork featuring traditional Madhubani-inspired floral motifs.",
        "craft": "Madhubani Painting",
        "material": "Handmade paper and natural pigments",
        "region": "Madhubani, Bihar",
        "gi_status": "Verification Required",
        "image_url": "/images/madhubani-floral.jpg",
        "price": 1800.0,
    },
]


# ============================================================
# DATABASE SEEDING
# ============================================================

def seed_database():

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # ARTISANS
        # ----------------------------------------------------

        for artisan_data in artisans:

            existing_artisan = (
                db.query(ArtisanTable)
                .filter(
                    ArtisanTable.artisan_id
                    == artisan_data["artisan_id"]
                )
                .first()
            )

            if not existing_artisan:

                db.add(
                    ArtisanTable(
                        **artisan_data
                    )
                )

        db.commit()

        # ----------------------------------------------------
        # PRODUCTS
        # ----------------------------------------------------

        for product_data in products:

            existing_product = (
                db.query(ProductTable)
                .filter(
                    ProductTable.product_id
                    == product_data["product_id"]
                )
                .first()
            )

            if not existing_product:

                db.add(
                    ProductTable(
                        **product_data
                    )
                )

        db.commit()

        print("Demo data seeded successfully.")
        print(f"Artisans available: {len(artisans)}")
        print(f"Products available: {len(products)}")

        print("\nProduct distribution:")

        regions = {}

        for product in products:

            region = product["region"]

            regions[region] = (
                regions.get(region, 0) + 1
            )

        for region, count in regions.items():

            print(
                f"  {region}: {count}"
            )

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()