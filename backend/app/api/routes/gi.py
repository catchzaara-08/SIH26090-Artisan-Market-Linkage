from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.gi import GI, GITable
from app.database.database import get_db


router = APIRouter(
    prefix="/gi",
    tags=["GI Records"]
)


@router.get("/")
def get_gi_records(db: Session = Depends(get_db)):
    records = db.query(GITable).all()

    return [
        {
            "gi_id": record.gi_id,
            "name": record.name,
            "craft": record.craft,
            "state": record.state,
            "status": record.status
        }
        for record in records
    ]


@router.get("/match/{craft}")
def match_gi_by_craft(
    craft: str,
    db: Session = Depends(get_db)
):
    records = (
        db.query(GITable)
        .filter(GITable.craft.ilike(f"%{craft}%"))
        .all()
    )

    if not records:
        return {
            "message": "No GI match found",
            "matches": []
        }

    return {
        "message": "GI matches found",
        "matches": [
            {
                "gi_id": record.gi_id,
                "name": record.name,
                "craft": record.craft,
                "state": record.state,
                "status": record.status
            }
            for record in records
        ]
    }


@router.get("/{gi_id}")
def get_gi_record(
    gi_id: str,
    db: Session = Depends(get_db)
):
    record = (
        db.query(GITable)
        .filter(GITable.gi_id == gi_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="GI record not found"
        )

    return {
        "gi_id": record.gi_id,
        "name": record.name,
        "craft": record.craft,
        "state": record.state,
        "status": record.status
    }


@router.post("/")
def create_gi_record(
    gi: GI,
    db: Session = Depends(get_db)
):
    existing_record = (
        db.query(GITable)
        .filter(GITable.gi_id == gi.gi_id)
        .first()
    )

    if existing_record:
        raise HTTPException(
            status_code=400,
            detail="GI record already exists"
        )

    new_record = GITable(
        gi_id=gi.gi_id,
        name=gi.name,
        craft=gi.craft,
        state=gi.state,
        status=gi.status
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {
        "message": "GI record created successfully",
        "gi": {
            "gi_id": new_record.gi_id,
            "name": new_record.name,
            "craft": new_record.craft,
            "state": new_record.state,
            "status": new_record.status
        }
    }