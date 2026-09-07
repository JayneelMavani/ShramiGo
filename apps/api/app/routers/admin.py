from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile
from app.models.customer_profile import CustomerProfile


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: ensures the current user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# ──────────────────────────────────────────
# STATS
# ──────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total_users = db.query(User).count()
    total_customers = db.query(User).filter(
        User.role == UserRole.CUSTOMER
    ).count()
    total_workers = db.query(User).filter(
        User.role == UserRole.WORKER,
        User.is_active == True,
    ).count()
    total_bookings = db.query(Booking).count()
    pending_bookings = db.query(Booking).filter(
        Booking.status == "pending"
    ).count()
    completed_bookings = db.query(Booking).filter(
        Booking.status == "completed"
    ).count()

    gross_result = db.query(
        func.sum(Booking.total_amount)
    ).filter(
        Booking.payment_status == "paid"
    ).scalar()
    platform_result = db.query(func.sum(Booking.service_charge)).filter(
        Booking.payment_status == "paid"
    ).scalar()
    payout_result = db.query(func.sum(Booking.worker_payout)).filter(
        Booking.payment_status == "paid"
    ).scalar()

    total_revenue = float(platform_result or 0)

    return {
        "total_users": total_users,
        "total_customers": total_customers,
        "total_workers": total_workers,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "completed_bookings": completed_bookings,
        "total_revenue": total_revenue,
        "gross_booking_value": float(gross_result or 0),
        "worker_payouts": float(payout_result or 0),
        "platform_revenue": total_revenue,
    }


# ──────────────────────────────────────────
# USERS
# ──────────────────────────────────────────

@router.get("/users")
def get_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate an admin account",
        )

    user.is_active = not user.is_active
    db.commit()

    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "is_active": user.is_active,
    }


# ──────────────────────────────────────────
# WORKERS
# ──────────────────────────────────────────

@router.get("/workers")
def get_all_workers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    results = (
        db.query(User, WorkerProfile)
        .outerjoin(
            WorkerProfile,
            WorkerProfile.user_id == User.id,
        )
        .filter(User.role == UserRole.WORKER)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    workers = []
    for user, profile in results:
        # Count bookings for this worker
        booking_count = db.query(Booking).filter(
            Booking.worker_id == user.id
        ).count()

        workers.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "city": profile.city if profile else None,
            "state": profile.state if profile else None,
            "experience_years": profile.experience_years if profile else 0,
            "booking_count": booking_count,
            "created_at": user.created_at.isoformat(),
        })

    return workers


@router.put("/workers/{worker_id}/verify")
def toggle_worker_verified(
    worker_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    worker = (
        db.query(User)
        .filter(
            User.id == worker_id,
            User.role == UserRole.WORKER,
        )
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found",
        )

    worker.is_verified = not worker.is_verified
    db.commit()

    return {
        "message": f"Worker {'verified' if worker.is_verified else 'unverified'} successfully",
        "is_verified": worker.is_verified,
    }


# ──────────────────────────────────────────
# BOOKINGS
# ──────────────────────────────────────────

@router.get("/bookings")
def get_all_bookings(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = db.query(Booking)

    if status_filter:
        query = query.filter(
            Booking.status == status_filter.lower()
        )

    bookings = (
        query
        .order_by(Booking.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for b in bookings:
        # Get customer and worker names
        customer = db.query(User).filter(
            User.id == b.customer_id
        ).first()
        worker = db.query(User).filter(
            User.id == b.worker_id
        ).first()

        result.append({
            "id": b.id,
            "customer_id": b.customer_id,
            "customer_name": customer.full_name if customer else "Unknown",
            "worker_id": b.worker_id,
            "worker_name": worker.full_name if worker else "Unknown",
            "service_id": b.service_id,
            "booking_date": str(b.booking_date),
            "booking_time": str(b.booking_time),
            "hours": b.hours,
            "service_address": b.service_address,
            "hourly_rate": b.hourly_rate,
            "subtotal": b.subtotal,
            "service_charge": b.service_charge,
            "total_amount": b.total_amount,
            "status": b.status,
            "payment_status": b.payment_status,
            "created_at": b.created_at.isoformat(),
        })

    return result
