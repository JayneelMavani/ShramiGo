from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.review import ReviewCreate, ReviewResponse


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)


@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Customer submits a rating/review for a completed booking.
    Only one review allowed per booking.
    """
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can submit reviews",
        )

    # Find and validate the booking
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == data.booking_id,
            Booking.customer_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if booking.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review completed bookings",
        )

    # Check for duplicate review
    existing = (
        db.query(Review)
        .filter(Review.booking_id == data.booking_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this booking",
        )

    review = Review(
        booking_id=data.booking_id,
        customer_id=current_user.id,
        worker_id=booking.worker_id,
        rating=data.rating,
        review_text=data.review_text,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get(
    "/booking/{booking_id}",
    response_model=ReviewResponse | None,
)
def get_booking_review(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if a review exists for a given booking."""
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
        booking.customer_id != current_user.id
        and booking.worker_id != current_user.id
        and current_user.role != UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view this booking's review",
        )

    review = (
        db.query(Review)
        .filter(Review.booking_id == booking_id)
        .first()
    )

    return review


@router.get(
    "/worker/{worker_id}",
    response_model=list[ReviewResponse],
)
def get_worker_reviews(
    worker_id: int,
    db: Session = Depends(get_db),
):
    """Public: get all reviews for a worker."""
    reviews = (
        db.query(Review)
        .filter(Review.worker_id == worker_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return reviews


@router.get(
    "/worker/{worker_id}/stats",
)
def get_worker_review_stats(
    worker_id: int,
    db: Session = Depends(get_db),
):
    """Public: get average rating and review count for a worker."""
    result = (
        db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("total_reviews"),
        )
        .filter(Review.worker_id == worker_id)
        .first()
    )

    return {
        "worker_id": worker_id,
        "avg_rating": round(float(result.avg_rating or 0), 1),
        "total_reviews": result.total_reviews or 0,
    }
