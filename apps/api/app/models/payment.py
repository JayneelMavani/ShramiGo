from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    worker_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    # "razorpay" | "cash"
    payment_method: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="cash",
    )

    # created | pending | paid | failed | refunded | cancelled
    payment_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
    )

    transaction_reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="manual")
    provider_order_id: Mapped[str | None] = mapped_column(String(150), nullable=True, unique=True)
    provider_payment_id: Mapped[str | None] = mapped_column(String(150), nullable=True, unique=True)
    provider_signature: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider_event_id: Mapped[str | None] = mapped_column(String(180), nullable=True, unique=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

PAYMENT_MODEL = Payment

