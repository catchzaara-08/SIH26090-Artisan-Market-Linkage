from sqlalchemy import Column, Float, String
from pydantic import BaseModel

from app.database.database import Base


class ProductTable(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, index=True)
    artisan_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    craft = Column(String, nullable=False)
    material = Column(String, nullable=False)
    region = Column(String, nullable=False)
    gi_status = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    price = Column(Float, nullable=False)


class Product(BaseModel):
    product_id: str
    artisan_id: str
    name: str
    description: str
    craft: str
    material: str
    region: str
    gi_status: str
    image_url: str
    price: float 

    
