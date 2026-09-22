from sqlalchemy import Column, String

from pydantic import BaseModel

from app.database.database import Base


class GITable(Base):
    __tablename__ = "gi_records"

    gi_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    craft = Column(String, nullable=False)
    state = Column(String, nullable=False)
    status = Column(String, nullable=False)


class GI(BaseModel):
    gi_id: str
    name: str
    craft: str
    state: str
    status: str