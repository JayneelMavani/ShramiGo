from app.schemas.booking import BookingCreate
from app.services.payment.service import transition_payment


def test_cash_booking_is_valid_without_provider_configuration() -> None:
    booking = BookingCreate(
        worker_id=1,
        service_id=1,
        booking_date="2030-01-01",
        booking_time="10:00",
        service_address="A valid service address",
        payment_method="cash",
    )

    assert booking.payment_method == "cash"
    transition_payment("cash_pending", "paid")
