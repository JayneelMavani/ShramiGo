from datetime import date, time, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict, field_validator


class BookingCreate(BaseModel):
    worker_id: int = Field(gt=0)
    service_id: int = Field(gt=0)

    booking_date: date
    booking_time: time

    hours: int = Field(default=1, ge=1, le=24)

    service_address: str = Field(
        min_length=5,
        max_length=500,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    payment_method: Literal["cash", "razorpay"] = Field(
        default="cash",
        description="razorpay or cash",
    )

    @field_validator("service_address")
    @classmethod
    def validate_service_address(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 5:
            raise ValueError("Service address must contain at least 5 non-space characters")
        return value

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., description="accepted, on_the_way, in_progress, completed, cancelled")


class PaymentMethodUpdate(BaseModel):
    payment_method: Literal["razorpay", "cash"] = Field(..., description="razorpay or cash")



class BookingResponse(BaseModel):
    id: int

    customer_id: int
    worker_id: int
    service_id: int

    booking_date: date
    booking_time: time

    hours: int

    service_address: str
    description: str | None

    hourly_rate: Decimal
    subtotal: Decimal
    service_charge: Decimal
    total_amount: Decimal
    worker_payout: Decimal

    status: str
    payment_method: str = "cash"
    payment_status: str

    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )