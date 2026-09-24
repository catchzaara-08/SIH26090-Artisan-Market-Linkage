from sqlalchemy import Column, String
from pydantic import BaseModel

from app.database.database import Base


class AdminTable(Base):
    __tablename__ = "admins"

    admin_id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="admin")


class Admin(BaseModel):
    admin_id: str
    username: str
    role: str = "admin"