from sqlalchemy import Column, String

from pydantic import BaseModel

from app.database.database import Base


class ArtisanTable(Base):
    __tablename__ = "artisans"

    artisan_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    language = Column(String, nullable=False)
    region = Column(String, nullable=False)
    craft = Column(String, nullable=False)


class Artisan(BaseModel):
    artisan_id: str
    name: str
    phone: str
    language: str
    region: str
    craft: str