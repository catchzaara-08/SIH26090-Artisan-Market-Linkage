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
    """
    Main admin dashboard data.

    Provides:
    - Summary statistics
    - NEELAM verification statistics
    - Showcase products
    - Available dashboard modules
    """

    # -----------------------------
    # Summary counts
    # -----------------------------

    total_products = (
        db.query(ProductTable).count()
    )

    total_artisans = (
        db.query(ArtisanTable).count()
    )

    total_gi_records = (
        db.query(GITable).count()
    )

    # -----------------------------
    # NEELAM verification counts
    # -----------------------------

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

    # -----------------------------
    # Product cards / showcase list
    # -----------------------------

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
    """
    Return all products for the admin portal.
    Requires admin authentication.
    """

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