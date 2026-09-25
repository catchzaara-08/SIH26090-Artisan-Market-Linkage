from datetime import datetime, timedelta, timezone
import os

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.admin import AdminTable
from app.models.product import ProductTable
from app.models.artisan import ArtisanTable
from app.models.gi import GITable

from app.api.routes.provenance import (
    provenance_events,
    verify_provenance,
    create_provenance_event,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin Portal"]
)


password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "dev-secret-change-this"
)

ALGORITHM = "HS256"

security = HTTPBearer()


class AdminLoginRequest(BaseModel):
    username: str
    password: str


def create_admin_token(username: str):
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(hours=2)
    )

    payload = {
        "sub": username,
        "role": "admin",
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username = payload.get("sub")
        role = payload.get("role")

        if not username or role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required",
            )

        return username

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Admin token has expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin token",
        )


@router.post("/login")
def admin_login(
    request: AdminLoginRequest,
    db: Session = Depends(get_db),
):
    admin = (
        db.query(AdminTable)
        .filter(
            AdminTable.username == request.username
        )
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin username or password",
        )

    if not password_hash.verify(
        request.password,
        admin.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid admin username or password",
        )

    access_token = create_admin_token(
        admin.username
    )

    return {
        "message": "Admin login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "role": "admin",
    }


@router.get("/me")
def admin_me(
    current_admin: str = Depends(get_current_admin),
):
    return {
        "authenticated": True,
        "username": current_admin,
        "role": "admin",
    }


@router.get("/dashboard")
def admin_dashboard(
    current_admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_products = (
        db.query(ProductTable).count()
    )

    total_artisans = (
        db.query(ArtisanTable).count()
    )

    total_gi_records = (
        db.query(GITable).count()
    )

    total_neelam_records = len(
        provenance_events
    )

    neelam_verified = 0
    neelam_pending = 0

    for product_id in provenance_events:
        result = verify_provenance(product_id)

        if result.get("valid"):
            neelam_verified += 1
        else:
            neelam_pending += 1

    products = (
        db.query(ProductTable)
        .order_by(ProductTable.product_id)
        .all()
    )

    product_list = []

    for product in products:

        provenance_result = verify_provenance(
            product.product_id
        )

        product_list.append({
            "product_id": product.product_id,
            "name": product.name,
            "craft": product.craft,
            "material": product.material,
            "region": product.region,
            "price": product.price,
            "gi_status": product.gi_status,
            "neelam_status": (
                "Verified"
                if provenance_result.get("valid")
                else "Pending"
            ),
        })

    return {
        "admin": {
            "username": current_admin,
            "role": "admin",
        },

        "summary": {
            "total_products": total_products,
            "total_artisans": total_artisans,
            "total_gi_records": total_gi_records,
            "total_neelam_records": total_neelam_records,
            "neelam_verified": neelam_verified,
            "neelam_pending": neelam_pending,
        },

        "showcase_products": product_list,

        "modules": {
            "products": True,
            "artisans": True,
            "gi_records": True,
            "neelam_authentication": True,
            "digital_storytelling": True,
            "voice_cataloguing": True,
            "image_enhancement": True,
            "payments": True,
        },

        "message": (
            "NEELAM Admin Dashboard data "
            "retrieved successfully"
        ),
    }


@router.get("/products")
def admin_products(
    current_admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    products = (
        db.query(ProductTable)
        .order_by(ProductTable.product_id)
        .all()
    )

    return {
        "admin": current_admin,
        "total_products": len(products),
        "products": [
            {
                "product_id": product.product_id,
                "name": product.name,
                "artisan_id": product.artisan_id,
                "craft": product.craft,
                "material": product.material,
                "region": product.region,
                "gi_status": product.gi_status,
                "price": product.price,
            }
            for product in products
        ],
    }


# ============================================================
# NEELAM TAG MANAGEMENT
# ============================================================

@router.get("/neelam")
def admin_neelam_records(
    current_admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Return NEELAM tag records for owner/admin review.
    """

    products = (
        db.query(ProductTable)
        .order_by(ProductTable.product_id)
        .all()
    )

    records = []

    for product in products:

        artisan = (
            db.query(ArtisanTable)
            .filter(
                ArtisanTable.artisan_id
                == product.artisan_id
            )
            .first()
        )

        provenance_result = verify_provenance(
            product.product_id
        )

        product_events = provenance_events.get(
            product.product_id,
            []
        )

        tag_approved = any(
            event["event_type"] == "TAG_APPROVED"
            for event in product_events
        )

        if tag_approved:
            tag_status = "Approved"
        else:
            tag_status = "Pending Review"

        records.append({
            "product_id": product.product_id,
            "neelam_id": (
                f"NEELAM-{product.product_id}"
            ),

            "product": product.name,

            "artisan_id": product.artisan_id,

            "artisan": (
                artisan.name
                if artisan
                else "Not available"
            ),

            "craft": product.craft,

            "region": product.region,

            "material": product.material,

            "gi_status": product.gi_status,

            "provenance_valid": (
                provenance_result.get("valid", False)
            ),

            "events_verified": (
                provenance_result.get(
                    "events_verified",
                    0
                )
            ),

            "tag_status": tag_status,
        })

    return {
        "admin": current_admin,
        "total_records": len(records),
        "records": records,
    }


@router.get("/neelam/{product_id}")
def admin_neelam_detail(
    product_id: str,
    current_admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Return detailed NEELAM review information
    for one product.
    """

    product = (
        db.query(ProductTable)
        .filter(
            ProductTable.product_id == product_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    artisan = (
        db.query(ArtisanTable)
        .filter(
            ArtisanTable.artisan_id
            == product.artisan_id
        )
        .first()
    )

    provenance_result = verify_provenance(
        product_id
    )

    events = provenance_events.get(
        product_id,
        []
    )

    tag_approved = any(
        event["event_type"] == "TAG_APPROVED"
        for event in events
    )

    return {
        "product": {
            "product_id": product.product_id,
            "name": product.name,
            "craft": product.craft,
            "material": product.material,
            "region": product.region,
            "price": product.price,
        },

        "artisan": {
            "artisan_id": (
                artisan.artisan_id
                if artisan
                else None
            ),
            "name": (
                artisan.name
                if artisan
                else "Not available"
            ),
            "language": (
                artisan.language
                if artisan
                else "Not available"
            ),
            "region": (
                artisan.region
                if artisan
                else "Not available"
            ),
        },

        "gi": {
            "status": product.gi_status,
        },

        "neelam": {
            "neelam_id": (
                f"NEELAM-{product.product_id}"
            ),

            "tag_status": (
                "Approved"
                if tag_approved
                else "Pending Review"
            ),

            "provenance_valid": (
                provenance_result.get(
                    "valid",
                    False
                )
            ),

            "events_verified": (
                provenance_result.get(
                    "events_verified",
                    0
                )
            ),
        },

        "provenance_history": events,
    }


@router.post("/neelam/{product_id}/approve")
def approve_neelam_tag(
    product_id: str,
    current_admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Approve a NEELAM tag for a product.

    Approval is recorded as a provenance event.
    """

    product = (
        db.query(ProductTable)
        .filter(
            ProductTable.product_id == product_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    existing_events = provenance_events.get(
        product_id,
        []
    )

    already_approved = any(
        event["event_type"] == "TAG_APPROVED"
        for event in existing_events
    )

    if already_approved:
        return {
            "message": "NEELAM tag is already approved",
            "product_id": product_id,
            "neelam_id": (
                f"NEELAM-{product_id}"
            ),
            "tag_status": "Approved",
        }

    event = create_provenance_event(
        product_id=product_id,
        event_type="TAG_APPROVED",
        event_data={
            "approved_by": current_admin,
            "product_id": product_id,
            "artisan_id": product.artisan_id,
            "neelam_id": (
                f"NEELAM-{product_id}"
            ),
            "approval_type": "Owner/Admin approval",
        },
    )

    return {
        "message": "NEELAM tag approved successfully",
        "product_id": product_id,
        "neelam_id": (
            f"NEELAM-{product_id}"
        ),
        "tag_status": "Approved",
        "approved_by": current_admin,
        "provenance_event": event,
    }