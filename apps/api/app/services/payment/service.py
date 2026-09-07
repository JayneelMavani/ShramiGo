from decimal import Decimal

from app.services.payment.base import PaymentProvider
from app.services.payment.razorpay import RazorpayProvider


PAYMENT_TRANSITIONS: dict[str, set[str]] = {
    "created": {"pending", "cancelled"},
    "pending": {"paid", "failed", "cancelled"},
    "paid": {"refunded"},
    "failed": set(),
    "refunded": set(),
    "cancelled": set(),
    "cash_pending": {"paid", "cancelled"},
}


def transition_payment(payment_status: str, new_status: str, verified_provider_event: bool = False) -> None:
    if verified_provider_event and payment_status == "failed" and new_status == "paid":
        return
    if new_status not in PAYMENT_TRANSITIONS.get(payment_status, set()):
        raise ValueError(f"Invalid payment transition: {payment_status} -> {new_status}")


def get_provider(name: str) -> PaymentProvider:
    if name == "razorpay":
        return RazorpayProvider()
    raise ValueError(f"Unsupported payment provider: {name}")


def amount_matches(expected: Decimal, received_minor_units: int, tolerance: Decimal = Decimal("0.01")) -> bool:
    received = Decimal(received_minor_units) / Decimal(100)
    return abs(expected - received) <= tolerance