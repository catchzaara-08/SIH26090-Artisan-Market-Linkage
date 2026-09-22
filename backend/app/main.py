from fastapi import FastAPI

from app.api.routes.product import router as product_router
from app.api.routes.artisan import router as artisan_router
from app.api.routes.gi import router as gi_router
from app.api.routes.provenance import router as provenance_router
from app.api.routes.qr import router as qr_router
from app.api.routes.auth import router as auth_router

from app.database.database import Base, engine

from app.models.product import ProductTable
from app.models.artisan import ArtisanTable
from app.models.gi import GITable
from app.models.provenance import ProvenanceEventTable


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SIH26090 Artisan Platform API",
    description="Backend for AI-driven market linkage and smart cataloguing for marginalized artisans.",
    version="0.1.0",
)


app.include_router(product_router)
app.include_router(artisan_router)
app.include_router(gi_router)
app.include_router(provenance_router)
app.include_router(qr_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "SIH26090 Backend is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }