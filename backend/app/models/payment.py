from sqlalchemy import Column, Float, Integer, String

from pydantic import BaseModel

from app.database.database import Base


class PaymentTable(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    razorpay_order_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    razorpay_payment_id = Column(
        String,
        nullable=True,
        index=True
    )

    product_id = Column(
        String,
        nullable=False,
        index=True
    )

    artisan_id = Column(
        String,
        nullable=False,
        index=True
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    currency = Column(
        String,
        nullable=False,
        default="INR"
    )

    status = Column(
        String,
        nullable=False,
        default="created"
    )


class Payment(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str | None = None
    product_id: str
    artisan_id: str
    quantity: int
    amount: float
    currency: str = "INR"
    status: str