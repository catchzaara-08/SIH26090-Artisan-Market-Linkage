from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product, ProductTable
from app.models.artisan import ArtisanTable
from app.database.database import get_db
from app.api.routes.auth import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(ProductTable).all()

    return [
        {
            "product_id": product.product_id,
            "artisan_id": product.artisan_id,
            "name": product.name,
            "description": product.description,
            "craft": product.craft,
            "material": product.material,
            "region": product.region,
            "gi_status": product.gi_status,
            "image_url": product.image_url,
            "price": product.price
        }
        for product in products
    ]


@router.get("/{product_id}")
def get_product(
    product_id: str,
    db: Session = Depends(get_db)
):
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

    return {
        "product_id": product.product_id,
        "artisan_id": product.artisan_id,
        "name": product.name,
        "description": product.description,
        "craft": product.craft,
        "material": product.material,
        "region": product.region,
        "gi_status": product.gi_status,
        "image_url": product.image_url,
        "price": product.price
    }


@router.post("/")
def create_product(
    product: Product,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    artisan = (
        db.query(ArtisanTable)
        .filter(ArtisanTable.artisan_id == product.artisan_id)
        .first()
    )

    if not artisan:
        raise HTTPException(
            status_code=404,
            detail="Artisan not found"
        )

    existing_product = (
        db.query(ProductTable)
        .filter(ProductTable.product_id == product.product_id)
        .first()
    )

    if existing_product:
        raise HTTPException(
            status_code=400,
            detail="Product already exists"
        )

    new_product = ProductTable(
        product_id=product.product_id,
        artisan_id=product.artisan_id,
        name=product.name,
        description=product.description,
        craft=product.craft,
        material=product.material,
        region=product.region,
        gi_status=product.gi_status,
        image_url=product.image_url,
        price=product.price
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product created successfully",
        "created_by": current_user,
        "product": {
            "product_id": new_product.product_id,
            "artisan_id": new_product.artisan_id,
            "name": new_product.name,
            "description": new_product.description,
            "craft": new_product.craft,
            "material": new_product.material,
            "region": new_product.region,
            "gi_status": new_product.gi_status,
            "image_url": new_product.image_url,
            "price": new_product.price
        }
    }


@router.put("/{product_id}")
def update_product(
    product_id: str,
    product: Product,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    existing_product = (
        db.query(ProductTable)
        .filter(ProductTable.product_id == product_id)
        .first()
    )

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing_product.artisan_id = product.artisan_id
    existing_product.name = product.name
    existing_product.description = product.description
    existing_product.craft = product.craft
    existing_product.material = product.material
    existing_product.region = product.region
    existing_product.gi_status = product.gi_status
    existing_product.image_url = product.image_url
    existing_product.price = product.price

    db.commit()
    db.refresh(existing_product)

    return {
        "message": "Product updated successfully",
        "updated_by": current_user,
        "product": {
            "product_id": existing_product.product_id,
            "artisan_id": existing_product.artisan_id,
            "name": existing_product.name,
            "description": existing_product.description,
            "craft": existing_product.craft,
            "material": existing_product.material,
            "region": existing_product.region,
            "gi_status": existing_product.gi_status,
            "image_url": existing_product.image_url,
            "price": existing_product.price
        }
    }