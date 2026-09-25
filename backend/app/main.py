from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes.product import router as product_router
from app.api.routes.artisan import router as artisan_router
from app.api.routes.gi import router as gi_router

from app.api.routes.provenance import (
    router as provenance_router,
    initialize_demo_provenance,
)

from app.api.routes.qr import router as qr_router
from app.api.routes.auth import router as auth_router
from app.api.routes.image import router as image_router
from app.api.routes.payment import router as payment_router
from app.api.routes.voice import router as voice_router
from app.api.routes.story import router as story_router
from app.api.routes.demo import router as demo_router
from app.api.routes.admin import router as admin_router

from app.database.database import Base, engine

from app.models.product import ProductTable
from app.models.artisan import ArtisanTable
from app.models.gi import GITable
from app.models.provenance import ProvenanceEventTable
from app.models.payment import PaymentTable
from app.models.admin import AdminTable


# --------------------------------------------------
# Paths
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BACKEND_DIR / "public"
PUBLIC_HTML = PUBLIC_DIR / "code.html"


# --------------------------------------------------
# Create database tables
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# Initialize demo NEELAM records
# --------------------------------------------------

initialize_demo_provenance()


app = FastAPI(
    title="SIH26090 Artisan Platform API",
    description=(
        "Backend for AI-driven market linkage and "
        "smart cataloguing for marginalized artisans."
    ),
    version="0.1.0",
)


# --------------------------------------------------
# CORS - allows frontend to communicate with backend
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API Routes
# --------------------------------------------------

app.include_router(product_router)
app.include_router(artisan_router)
app.include_router(gi_router)
app.include_router(provenance_router)
app.include_router(qr_router)
app.include_router(auth_router)
app.include_router(image_router)
app.include_router(payment_router)
app.include_router(voice_router)
app.include_router(story_router)
app.include_router(demo_router)
app.include_router(admin_router)


# --------------------------------------------------
# Public NEELAM HTML page
# --------------------------------------------------

@app.get("/public/neelam")
def public_neelam_page():
    return FileResponse(
        PUBLIC_HTML,
        media_type="text/html",
    )


# --------------------------------------------------
# Processed image files
# --------------------------------------------------

app.mount(
    "/processed-images",
    StaticFiles(directory="processed_images"),
    name="processed-images",
)


# --------------------------------------------------
# Basic endpoints
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SIH26090 Backend is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }