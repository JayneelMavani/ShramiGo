import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User, UserRole
from app.schemas.payment import PaymentOrderResponse, PaymentVerifyRequest
from app.services.payment.service import amount_matches, get_provider, transition_payment


router = APIRouter(prefix="/api/payments", tags=["Payments"])


def _customer_payment(booking_id: int, user: User, db: Session) -> Payment:
    payment = db.query(Payment).join(Booking, Booking.id == Payment.booking_id).filter(
        Payment.booking_id == booking_id,
        Booking.customer_id == user.id,
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.post("/bookings/{booking_id}/order", response_model=PaymentOrderResponse)
def create_order(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can create payment orders")
    payment = _customer_payment(booking_id, current_user, db)
    if payment.payment_method != "razorpay":
        raise HTTPException(status_code=400, detail="This payment is not a Razorpay payment")
    if payment.payment_status == "paid":
        raise HTTPException(status_code=409, detail="Payment is already paid")
    try:
        provider = get_provider("razorpay")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail="Online payments are not configured") from exc
    order = provider.create_order(payment.amount, payment.currency, f"booking-{payment.booking_id}")
    payment.provider = provider.name
    payment.provider_order_id = str(order["id"])
    payment.payment_status = "pending"
    db.commit()
    return PaymentOrderResponse(payment_id=payment.id, order_id=payment.provider_order_id, key_id=settings.RAZORPAY_KEY_ID or "", amount=payment.amount, currency=payment.currency)


@router.post("/bookings/{booking_id}/verify")
def verify_payment(booking_id: int, data: PaymentVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can verify payments")
    payment = _customer_payment(booking_id, current_user, db)
    if payment.provider_order_id != data.razorpay_order_id:
        raise HTTPException(status_code=400, detail="Payment order mismatch")
    if payment.payment_status == "paid":
        return {"status": "paid"}
    try:
        provider = get_provider("razorpay")
        provider.verify_payment(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail="Online payments are not configured") from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Payment signature verification failed") from exc
    payment.provider_payment_id = data.razorpay_payment_id
    payment.provider_signature = data.razorpay_signature
    transition_payment(payment.payment_status, "paid", verified_provider_event=True)
    payment.payment_status = "paid"
    payment.paid_at = datetime.now(timezone.utc).replace(tzinfo=None)
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        booking.payment_status = "paid"
    db.commit()
    return {"status": "paid", "payment_id": payment.id}


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing webhook signature")
    body = await request.body()
    try:
        provider = get_provider("razorpay")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail="Online payments are not configured") from exc
    try:
        provider.verify_webhook(body, signature)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc
    try:
        payload = json.loads(body)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook payload") from exc
    event_id = request.headers.get("X-Razorpay-Event-Id") or payload.get("event_id")
    if not event_id:
        raise HTTPException(status_code=400, detail="Missing webhook event identifier")
    existing = db.query(Payment).filter(Payment.provider_event_id == event_id).first()
    if existing:
        return {"status": "already_processed"}
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = entity.get("order_id")
    payment_id = entity.get("id")
    payment = db.query(Payment).filter(Payment.provider_order_id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")
    payment.provider_event_id = event_id
    payment.provider_payment_id = payment_id
    payment.provider = "razorpay"
    if payload.get("event") == "payment.captured":
        if not amount_matches(payment.amount, int(entity.get("amount", 0))) or entity.get("currency") != payment.currency:
            raise HTTPException(status_code=400, detail="Webhook amount mismatch")
        if payment.payment_status != "paid":
            transition_payment(payment.payment_status, "paid", verified_provider_event=True)
            payment.payment_status = "paid"
            payment.paid_at = datetime.now(timezone.utc).replace(tzinfo=None)
            booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
            if booking:
                booking.payment_status = "paid"
    elif payload.get("event") == "payment.failed" and payment.payment_status == "pending":
        transition_payment(payment.payment_status, "failed")
        payment.payment_status = "failed"
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        if db.query(Payment).filter(Payment.provider_event_id == event_id).first():
            return {"status": "already_processed"}
        raise
    return {"status": "processed"}