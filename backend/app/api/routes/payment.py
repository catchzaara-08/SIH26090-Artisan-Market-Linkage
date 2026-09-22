import os

import razorpay
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.product import ProductTable
from app.models.payment import PaymentTable

from app.api.routes.provenance import provenance_events
from app.neelam.hash_chain import create_event


router = APIRouter(
    prefix="/payments",
    tags=["Razorpay Payments"]
)


KEY_ID = os.getenv("RAZORPAY_KEY_ID")
KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


if not KEY_ID or not KEY_SECRET:
    raise RuntimeError(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set."
    )


razorpay_client = razorpay.Client(
    auth=(KEY_ID, KEY_SECRET)
)


class CreateOrderRequest(BaseModel):
    product_id: str
    quantity: int = 1


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/order")
def create_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db)
):
    # Find the product in our database
    product = (
        db.query(ProductTable)
        .filter(ProductTable.product_id == request.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if request.quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1"
        )

    # Calculate amount from our database price
    total_amount_rupees = product.price * request.quantity

    # Razorpay expects INR amount in paise
    total_amount_paise = int(
        round(total_amount_rupees * 100)
    )

    receipt = (
        f"SIH_{product.product_id}_{request.quantity}"
    )

    # Create Razorpay test order
    razorpay_order = razorpay_client.order.create(
        {
            "amount": total_amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "notes": {
                "product_id": product.product_id,
                "artisan_id": product.artisan_id,
                "quantity": request.quantity
            }
        }
    )

    # Save payment/order information in our database
    payment_record = PaymentTable(
        razorpay_order_id=razorpay_order["id"],
        product_id=product.product_id,
        artisan_id=product.artisan_id,
        quantity=request.quantity,
        amount=total_amount_rupees,
        currency="INR",
        status="created"
    )

    db.add(payment_record)
    db.commit()
    db.refresh(payment_record)

    # -----------------------------------------
    # NEELAM PAYMENT PROVENANCE EVENT
    # -----------------------------------------

    product_events = provenance_events.setdefault(
        product.product_id,
        []
    )

    if product_events:
        previous_hash = product_events[-1]["event_hash"]
    else:
        previous_hash = "000000"

    event_id = (
        f"EVT-{product.product_id}-"
        f"{len(product_events) + 1}"
    )

    neelam_event = create_event(
        event_id=event_id,
        product_id=product.product_id,
        event_type="PAYMENT_ORDER_CREATED",
        event_data={
            "razorpay_order_id": payment_record.razorpay_order_id,
            "artisan_id": payment_record.artisan_id,
            "amount": payment_record.amount,
            "currency": payment_record.currency,
            "quantity": payment_record.quantity
        },
        previous_hash=previous_hash
    )

    product_events.append(neelam_event)

    return {
        "message": "Razorpay order created successfully",
        "payment": {
            "razorpay_order_id": payment_record.razorpay_order_id,
            "product_id": payment_record.product_id,
            "artisan_id": payment_record.artisan_id,
            "quantity": payment_record.quantity,
            "amount": payment_record.amount,
            "currency": payment_record.currency,
            "status": payment_record.status
        },
        "order": razorpay_order,
        "neelam_event": {
            "event_type": neelam_event["event_type"],
            "event_hash": neelam_event["event_hash"],
            "previous_hash": neelam_event["previous_hash"]
        }
    }


@router.post("/verify")
def verify_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db)
):
    try:
        # Verify Razorpay payment signature
        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id": request.razorpay_order_id,
                "razorpay_payment_id": request.razorpay_payment_id,
                "razorpay_signature": request.razorpay_signature
            }
        )

        # Find the saved payment record
        payment = (
            db.query(PaymentTable)
            .filter(
                PaymentTable.razorpay_order_id
                == request.razorpay_order_id
            )
            .first()
        )

        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Payment record not found"
            )

        # Update payment status
        payment.razorpay_payment_id = (
            request.razorpay_payment_id
        )

        payment.status = "verified"

        db.commit()
        db.refresh(payment)

        # -----------------------------------------
        # NEELAM PAYMENT VERIFIED EVENT
        # -----------------------------------------

        product_events = provenance_events.setdefault(
            payment.product_id,
            []
        )

        if product_events:
            previous_hash = product_events[-1]["event_hash"]
        else:
            previous_hash = "000000"

        event_id = (
            f"EVT-{payment.product_id}-"
            f"{len(product_events) + 1}"
        )

        neelam_event = create_event(
            event_id=event_id,
            product_id=payment.product_id,
            event_type="PAYMENT_VERIFIED",
            event_data={
                "razorpay_order_id": payment.razorpay_order_id,
                "razorpay_payment_id": payment.razorpay_payment_id,
                "amount": payment.amount,
                "currency": payment.currency,
                "artisan_id": payment.artisan_id,
                "status": payment.status
            },
            previous_hash=previous_hash
        )

        product_events.append(neelam_event)

        return {
            "message": "Payment signature verified successfully",
            "verified": True,
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "status": payment.status,
            "neelam_event": {
                "event_type": neelam_event["event_type"],
                "event_hash": neelam_event["event_hash"],
                "previous_hash": neelam_event["previous_hash"]
            }
        }

    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature"
        )


@router.get("/")
def get_all_payments(
    db: Session = Depends(get_db)
):
    payments = db.query(PaymentTable).all()

    return [
        {
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "product_id": payment.product_id,
            "artisan_id": payment.artisan_id,
            "quantity": payment.quantity,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status
        }
        for payment in payments
    ]


@router.get("/{razorpay_order_id}")
def get_payment(
    razorpay_order_id: str,
    db: Session = Depends(get_db)
):
    payment = (
        db.query(PaymentTable)
        .filter(
            PaymentTable.razorpay_order_id
            == razorpay_order_id
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found"
        )

    return {
        "razorpay_order_id": payment.razorpay_order_id,
        "razorpay_payment_id": payment.razorpay_payment_id,
        "product_id": payment.product_id,
        "artisan_id": payment.artisan_id,
        "quantity": payment.quantity,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status
    }