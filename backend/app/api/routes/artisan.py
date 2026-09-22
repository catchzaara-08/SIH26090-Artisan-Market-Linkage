from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.artisan import Artisan, ArtisanTable
from app.database.database import get_db


router = APIRouter(
    prefix="/artisans",
    tags=["Artisans"]
)


@router.get("/")
def get_artisans(db: Session = Depends(get_db)):
    artisans = db.query(ArtisanTable).all()

    return [
        {
            "artisan_id": artisan.artisan_id,
            "name": artisan.name,
            "phone": artisan.phone,
            "language": artisan.language,
            "region": artisan.region,
            "craft": artisan.craft
        }
        for artisan in artisans
    ]


@router.get("/{artisan_id}")
def get_artisan(
    artisan_id: str,
    db: Session = Depends(get_db)
):
    artisan = (
        db.query(ArtisanTable)
        .filter(ArtisanTable.artisan_id == artisan_id)
        .first()
    )

    if not artisan:
        raise HTTPException(
            status_code=404,
            detail="Artisan not found"
        )

    return {
        "artisan_id": artisan.artisan_id,
        "name": artisan.name,
        "phone": artisan.phone,
        "language": artisan.language,
        "region": artisan.region,
        "craft": artisan.craft
    }


@router.post("/")
def create_artisan(
    artisan: Artisan,
    db: Session = Depends(get_db)
):
    existing_artisan = (
        db.query(ArtisanTable)
        .filter(ArtisanTable.artisan_id == artisan.artisan_id)
        .first()
    )

    if existing_artisan:
        raise HTTPException(
            status_code=400,
            detail="Artisan already exists"
        )

    new_artisan = ArtisanTable(
        artisan_id=artisan.artisan_id,
        name=artisan.name,
        phone=artisan.phone,
        language=artisan.language,
        region=artisan.region,
        craft=artisan.craft
    )

    db.add(new_artisan)
    db.commit()
    db.refresh(new_artisan)

    return {
        "message": "Artisan created successfully",
        "artisan": {
            "artisan_id": new_artisan.artisan_id,
            "name": new_artisan.name,
            "phone": new_artisan.phone,
            "language": new_artisan.language,
            "region": new_artisan.region,
            "craft": new_artisan.craft
        }
    }