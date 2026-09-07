from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.service import Service
from app.models.user import User, UserRole
from app.models.worker_service import WorkerService
from app.models.worker_availability import WorkerAvailability
from app.models.payment import Payment
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingStatusUpdate,
    PaymentMethodUpdate,
)
from app.services.payment.service import transition_payment


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


SERVICE_CHARGE = Decimal("30.00")


def _local_now() -> datetime:
    """Return the current time in the configured application timezone."""
    try:
        return datetime.now(ZoneInfo(settings.TIMEZONE)).replace(tzinfo=None)
    except Exception:
        return datetime.now(timezone.utc).replace(tzinfo=None)

# Valid status transitions for workers
WORKER_ALLOWED_TRANSITIONS = {
    "pending": ["accepted", "cancelled"],
    "accepted": ["on_the_way", "cancelled"],
    "on_the_way": ["in_progress"],
    "in_progress": ["completed"],
}


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only customers can create bookings
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create bookings",
        )

    # Check worker
    worker = (
        db.query(User)
        .filter(
            User.id == data.worker_id,
            User.role == UserRole.WORKER,
            User.is_active == True,
        )
        .with_for_update()
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found",
        )

    service = db.query(Service).filter(
        Service.id == data.service_id,
        Service.is_active == True,
    ).first()

    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    worker_service = db.query(WorkerService).filter(
        WorkerService.worker_id == data.worker_id,
        WorkerService.service_id == data.service_id,
        WorkerService.is_active == True,
    ).first()

    if not worker_service:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Worker does not provide this service")

    now_local = _local_now()
    if data.booking_date < now_local.date():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking date cannot be in the past")

    requested_start = datetime.combine(data.booking_date, data.booking_time)
    requested_end = requested_start + timedelta(hours=data.hours)
    if data.booking_date == now_local.date() and requested_start <= now_local:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking time must be in the future")

    weekday = data.booking_date.strftime("%A").lower()
    availability = db.query(WorkerAvailability).filter(
        WorkerAvailability.worker_id == data.worker_id,
        WorkerAvailability.is_available == True,
        func.lower(WorkerAvailability.day_of_week) == weekday,
    ).all()
    if not any(
        slot.start_time is not None
        and slot.end_time is not None
        and slot.start_time <= data.booking_time
        and slot.end_time >= requested_end.time()
        for slot in availability
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Requested time is outside worker availability")

    existing_bookings = db.query(Booking).filter(
        Booking.worker_id == data.worker_id,
        Booking.booking_date == data.booking_date,
        Booking.status.notin_(["cancelled", "completed"]),
    ).all()
    for existing in existing_bookings:
        existing_start = datetime.combine(existing.booking_date, existing.booking_time)
        existing_end = existing_start + timedelta(hours=existing.hours)
        if existing_start < requested_end and existing_end > requested_start:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Worker is already booked for this time")

    hourly_rate = (
        worker_service.custom_price
        if worker_service.custom_price is not None
        else service.base_price
    )

    # Calculate price on backend
    subtotal = hourly_rate * Decimal(data.hours)
    total_amount = subtotal + SERVICE_CHARGE

    booking = Booking(
        customer_id=current_user.id,
        worker_id=data.worker_id,
        service_id=service.id,
        booking_date=data.booking_date,
        booking_time=data.booking_time,
        hours=data.hours,
        service_address=data.service_address.strip(),
        description=(
            data.description.strip()
            if data.description
            else None
        ),
        hourly_rate=hourly_rate,
        subtotal=subtotal,
        service_charge=SERVICE_CHARGE,
        total_amount=total_amount,
        worker_payout=subtotal,
        status="pending",
        payment_method=data.payment_method,
        payment_status="cash_pending" if data.payment_method == "cash" else "pending",
    )

    db.add(booking)
    db.flush()
    db.add(Payment(
        booking_id=booking.id,
        customer_id=current_user.id,
        worker_id=data.worker_id,
        amount=total_amount,
        payment_method=data.payment_method,
        payment_status="cash_pending" if data.payment_method == "cash" else "pending",
        provider="manual" if data.payment_method == "cash" else "razorpay",
    ))
    from app.routers.notifications import create_notification
    create_notification(
        db=db,
        user_id=data.worker_id,
        title="New Booking Request",
        message=f"You have a new booking request for {service.name} on {data.booking_date}.",
        notif_type="booking_request",
    )
    db.commit()
    db.refresh(booking)

    return booking


@router.get(
    "/my",
    response_model=list[BookingResponse],
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(
            Booking.customer_id == current_user.id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )

    return bookings


@router.get(
    "/worker",
    response_model=list[BookingResponse],
)
def get_worker_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all bookings assigned to the logged-in worker."""
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access worker bookings",
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.worker_id == current_user.id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )

    return bookings


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Customer can see their own booking.
    # Worker can see bookings assigned to them.
    # Admin can see any booking.
    if current_user.role == UserRole.ADMIN:
        pass
    elif (
        booking.customer_id != current_user.id
        and booking.worker_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this booking",
        )

    return booking


@router.put(
    "/{booking_id}/status",
    response_model=BookingResponse,
)
def update_booking_status(
    booking_id: int,
    body: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Worker updates the booking status.
    Allowed transitions:
      pending → accepted | cancelled
      accepted → on_the_way | cancelled
      on_the_way → in_progress
      in_progress → completed
    """
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can update booking status",
        )

    new_status = body.status.strip().lower()

    if not new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status field is required",
        )

    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.worker_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    current_status = booking.status.lower()
    allowed = WORKER_ALLOWED_TRANSITIONS.get(current_status, [])

    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'. Allowed: {allowed}",
        )

    # A job can only be completed after payment is settled.
    # For cash, the worker/admin must first confirm that cash was received.
    if new_status == "completed" and booking.payment_status != "paid":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Complete the payment first, then mark the service as completed.",
        )

    booking.status = new_status
    if new_status == "completed":
        booking.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    from app.routers.notifications import create_notification
    status_messages = {
        "accepted": "Your booking has been accepted by the worker.",
        "on_the_way": "Your worker is on the way to your location.",
        "in_progress": "Your service has started.",
        "completed": "Your service has been completed. Please rate your experience.",
        "cancelled": "Your booking has been cancelled by the worker.",
    }
    create_notification(
        db=db,
        user_id=booking.customer_id,
        title="Booking Update",
        message=status_messages.get(new_status, f"Your booking status changed to {new_status}."),
        notif_type=f"booking_{new_status}",
    )
    db.commit()
    db.refresh(booking)

    return booking


@router.put(
    "/{booking_id}/payment",
    response_model=BookingResponse,
)
def update_payment_status(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find booking
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Only the customer who created the booking
    # can complete its payment.
    if (
        current_user.role != UserRole.CUSTOMER
        or booking.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to make payment for this booking",
        )

    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Payment cannot be marked successful directly. Complete provider verification first.",
    )


@router.put("/{booking_id}/cash-received", response_model=BookingResponse)
def mark_cash_received(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).with_for_update().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == UserRole.WORKER and booking.worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not allowed to update this payment")
    if current_user.role not in {UserRole.WORKER, UserRole.ADMIN}:
        raise HTTPException(status_code=403, detail="Only the assigned worker or an admin can confirm cash")
    if booking.payment_method != "cash":
        raise HTTPException(status_code=400, detail="This booking is not a cash payment")
    if booking.status != "in_progress":
        raise HTTPException(status_code=409, detail="Cash can be confirmed after the service has started")
    if booking.payment_status == "paid":
        return booking
    if booking.payment_status != "cash_pending":
        raise HTTPException(status_code=409, detail="Cash payment is not awaiting receipt")
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).with_for_update().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    transition_payment(payment.payment_status, "paid")
    payment.payment_status = "paid"
    payment.paid_at = datetime.now(timezone.utc).replace(tzinfo=None)
    payment.transaction_reference = f"cash-booking-{booking.id}"
    booking.payment_status = "paid"
    from app.routers.notifications import create_notification
    create_notification(
        db=db,
        user_id=booking.customer_id,
        title="Payment Received",
        message="Your cash payment has been confirmed. The worker can now complete the service.",
        notif_type="payment_received",
    )
    db.commit()
    db.refresh(booking)
    return booking


@router.put(
    "/{booking_id}/payment-method",
    response_model=BookingResponse,
)
def update_payment_method(
    booking_id: int,
    data: PaymentMethodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if (
        current_user.role != UserRole.CUSTOMER
        or booking.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this booking",
        )

    if booking.payment_status == "paid":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment has already been completed",
        )

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if payment and payment.provider_order_id and payment.payment_method != data.payment_method:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A payment order already exists. Complete it or create a new booking.",
        )

    booking.payment_method = data.payment_method
    if data.payment_method == "cash":
        booking.payment_status = "cash_pending"
    elif booking.payment_status != "paid":
        booking.payment_status = "pending"

    if payment and payment.payment_status != "paid":
        payment.payment_method = data.payment_method
        payment.payment_status = "cash_pending" if data.payment_method == "cash" else "pending"
        payment.provider = "manual" if data.payment_method == "cash" else "razorpay"

    db.commit()
    db.refresh(booking)

    return booking


@router.put(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if (
        current_user.role != UserRole.CUSTOMER
        or booking.customer_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings",
        )

    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel booking in '{booking.status}' status. Only pending bookings can be cancelled.",
        )

    booking.status = "cancelled"
    from app.routers.notifications import create_notification
    create_notification(
        db=db,
        user_id=booking.worker_id,
        title="Booking Cancelled",
        message=f"Booking #{booking.id} was cancelled by the customer.",
        notif_type="booking_cancelled",
    )
    db.commit()
    db.refresh(booking)

    return booking