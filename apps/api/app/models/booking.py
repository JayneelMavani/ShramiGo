from datetime import datetime, date, time
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
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

    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL"),
        nullable=False,
        index=True,
    )

    booking_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    booking_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    hours: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    service_address: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    hourly_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    service_charge: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=30,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    worker_payout: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
    )

    payment_method: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="cash",
    )

    payment_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
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

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint("hours > 0 AND hours <= 24", name="ck_booking_hours_range"),
        CheckConstraint("hourly_rate >= 0 AND subtotal >= 0 AND service_charge >= 0 AND total_amount >= 0", name="ck_booking_amounts_nonnegative"),
    )