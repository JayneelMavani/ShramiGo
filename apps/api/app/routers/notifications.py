from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


# ──────────────────────────────────────────
# Pydantic schema (inline for simplicity)
# ──────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notif_type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────
# Internal helper used by other routers
# ──────────────────────────────────────────

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notif_type: str = "general",
) -> Notification:
    """Create a notification record for a user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notif_type=notif_type,
    )
    db.add(notif)
    db.flush()  # Don't commit here; caller controls the transaction
    return notif


# ──────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────

@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all notifications for the current user, newest first."""
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )

    return notifications


@router.get(
    "/unread-count",
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .count()
    )

    return {"unread_count": count}


@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)

    return notif


@router.put(
    "/read-all",
)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .update({"is_read": True})
    )

    db.commit()

    return {"message": "All notifications marked as read"}
