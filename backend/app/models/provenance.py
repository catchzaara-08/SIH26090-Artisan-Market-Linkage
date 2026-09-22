from sqlalchemy import Column, Integer, String, Text

from pydantic import BaseModel

from app.database.database import Base


class ProvenanceEventTable(Base):
    __tablename__ = "provenance_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, nullable=False, index=True)
    product_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    event_data = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)
    previous_hash = Column(String, nullable=False)
    event_hash = Column(String, nullable=False)


class ProvenanceEvent(BaseModel):
    event_id: str
    product_id: str
    event_type: str
    event_data: dict
    timestamp: str
    previous_hash: str
    event_hash: str