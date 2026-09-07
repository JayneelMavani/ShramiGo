from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile
from app.models.customer_profile import CustomerProfile
from app.models.payment import Payment
from app.models.review import Review
from app.models.service import Service
from app.models.notification import Notification
from app.models.refresh_token import RefreshToken
from app.models.worker_skill import WorkerSkill
from app.models.worker_service import WorkerService
from app.models.worker_availability import WorkerAvailability


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


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an admin account",
        )

    user_name = user.full_name

    # Delete related dependencies cleanly
    db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete(synchronize_session=False)
    db.query(Review).filter((Review.customer_id == user_id) | (Review.worker_id == user_id)).delete(synchronize_session=False)
    db.query(Payment).filter((Payment.customer_id == user_id) | (Payment.worker_id == user_id)).delete(synchronize_session=False)
    db.query(Booking).filter((Booking.customer_id == user_id) | (Booking.worker_id == user_id)).delete(synchronize_session=False)
    db.query(WorkerSkill).filter(WorkerSkill.worker_id == user_id).delete(synchronize_session=False)
    db.query(WorkerService).filter(WorkerService.worker_id == user_id).delete(synchronize_session=False)
    db.query(WorkerAvailability).filter(WorkerAvailability.worker_id == user_id).delete(synchronize_session=False)
    db.query(WorkerProfile).filter(WorkerProfile.user_id == user_id).delete(synchronize_session=False)
    db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).delete(synchronize_session=False)

    db.delete(user)
    db.commit()

    return {
        "message": f"User '{user_name}' permanently deleted",
        "user_id": user_id,
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


# ──────────────────────────────────────────
# SERVICES (admin view – includes inactive)
# ──────────────────────────────────────────

@router.get("/services")
def get_all_services(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    services = (
        db.query(Service)
        .order_by(Service.category, Service.name)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "description": s.description,
            "base_price": float(s.base_price),
            "icon": s.icon,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat(),
            "updated_at": s.updated_at.isoformat(),
        }
        for s in services
    ]


# ──────────────────────────────────────────
# PAYMENTS
# ──────────────────────────────────────────

@router.get("/payments")
def get_all_payments(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = db.query(Payment)

    if status_filter:
        query = query.filter(
            Payment.payment_status == status_filter.lower()
        )

    payments = (
        query
        .order_by(Payment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for p in payments:
        customer = db.query(User).filter(User.id == p.customer_id).first()
        worker = db.query(User).filter(User.id == p.worker_id).first()

        result.append({
            "id": p.id,
            "booking_id": p.booking_id,
            "customer_id": p.customer_id,
            "customer_name": customer.full_name if customer else "Unknown",
            "worker_id": p.worker_id,
            "worker_name": worker.full_name if worker else "Unknown",
            "amount": float(p.amount),
            "currency": p.currency,
            "payment_method": p.payment_method,
            "payment_status": p.payment_status,
            "provider": p.provider,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
            "created_at": p.created_at.isoformat(),
        })

    return result


@router.get("/payments/summary")
def get_payment_summary(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total_collected = float(
        db.query(func.sum(Payment.amount))
        .filter(Payment.payment_status == "paid")
        .scalar() or 0
    )
    total_pending = float(
        db.query(func.sum(Payment.amount))
        .filter(Payment.payment_status == "pending")
        .scalar() or 0
    )
    cash_total = float(
        db.query(func.sum(Payment.amount))
        .filter(Payment.payment_status == "paid", Payment.payment_method == "cash")
        .scalar() or 0
    )
    online_total = float(
        db.query(func.sum(Payment.amount))
        .filter(Payment.payment_status == "paid", Payment.payment_method == "razorpay")
        .scalar() or 0
    )
    total_count = db.query(Payment).count()
    paid_count = db.query(Payment).filter(Payment.payment_status == "paid").count()
    pending_count = db.query(Payment).filter(Payment.payment_status == "pending").count()
    failed_count = db.query(Payment).filter(Payment.payment_status == "failed").count()

    return {
        "total_collected": total_collected,
        "total_pending": total_pending,
        "cash_total": cash_total,
        "online_total": online_total,
        "total_count": total_count,
        "paid_count": paid_count,
        "pending_count": pending_count,
        "failed_count": failed_count,
    }


# ──────────────────────────────────────────
# REVIEWS
# ──────────────────────────────────────────

@router.get("/reviews")
def get_all_reviews(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    rating_filter: int | None = Query(default=None, alias="rating"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = db.query(Review)

    if rating_filter and 1 <= rating_filter <= 5:
        query = query.filter(Review.rating == rating_filter)

    reviews = (
        query
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for r in reviews:
        customer = db.query(User).filter(User.id == r.customer_id).first()
        worker = db.query(User).filter(User.id == r.worker_id).first()

        result.append({
            "id": r.id,
            "booking_id": r.booking_id,
            "customer_id": r.customer_id,
            "customer_name": customer.full_name if customer else "Unknown",
            "worker_id": r.worker_id,
            "worker_name": worker.full_name if worker else "Unknown",
            "rating": r.rating,
            "review_text": r.review_text,
            "created_at": r.created_at.isoformat(),
        })

    return result


@router.get("/reviews/summary")
def get_review_summary(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total_reviews = db.query(Review).count()
    avg_rating = float(
        db.query(func.avg(Review.rating)).scalar() or 0
    )
    rating_dist = {}
    for star in range(1, 6):
        rating_dist[str(star)] = db.query(Review).filter(
            Review.rating == star
        ).count()

    return {
        "total_reviews": total_reviews,
        "avg_rating": round(avg_rating, 1),
        "rating_distribution": rating_dist,
    }


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully"}
