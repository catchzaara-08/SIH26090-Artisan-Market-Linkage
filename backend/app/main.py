from fastapi import FastAPI
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


# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize demo NEELAM provenance records
initialize_demo_provenance()


app = FastAPI(
    title="SIH26090 Artisan Platform API",
    description=(
        "Backend for AI-driven market linkage and "
        "smart cataloguing for marginalized artisans."
    ),
    version="0.1.0",
)


# Register API routes
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


# Serve processed AI images
app.mount(
    "/processed-images",
    StaticFiles(directory="processed_images"),
    name="processed-images",
)


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