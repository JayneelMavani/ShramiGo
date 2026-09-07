import pytest
from pydantic import ValidationError

from app.schemas.booking import BookingCreate


def test_booking_requires_explicit_service() -> None:
    with pytest.raises(ValidationError):
        BookingCreate(
            worker_id=1,
            booking_date="2030-01-01",
            booking_time="10:00",
            service_address="A valid service address",
        )


def test_booking_rejects_unknown_payment_method() -> None:
    with pytest.raises(ValidationError):
        BookingCreate(
            worker_id=1,
            service_id=2,
            booking_date="2030-01-01",
            booking_time="10:00",
            service_address="A valid service address",
            payment_method="upi",
        )
