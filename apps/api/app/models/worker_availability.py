from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WorkerAvailability(Base):
    __tablename__ = "worker_availability"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    worker_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    day_of_week: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    start_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    end_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )