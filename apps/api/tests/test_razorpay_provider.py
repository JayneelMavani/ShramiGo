import hashlib
import hmac
from decimal import Decimal

import pytest

from app.core.config import settings
from app.services.payment.razorpay import RazorpayProvider


class FakeUtility:
    def __init__(self) -> None:
        self.calls: list[tuple] = []

    def verify_webhook_signature(self, body: str, signature: str, secret: str) -> None:
        self.calls.append((body, signature, secret))

    def verify_payment_signature(self, payload: dict[str, str]) -> None:
        self.calls.append(payload)


class FakeClient:
    def __init__(self) -> None:
        self.utility = FakeUtility()
        self.order = self

    def create(self, payload: dict):
        return {"id": "order_test_123", **payload}


def test_webhook_verification_delegates_raw_body_and_secret(monkeypatch) -> None:
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "webhook-secret")
    provider = object.__new__(RazorpayProvider)
    provider.client = FakeClient()
    body = b'{"event":"payment.captured"}'
    signature = hmac.new(b"webhook-secret", body, hashlib.sha256).hexdigest()

    provider.verify_webhook(body, signature)

    assert provider.client.utility.calls == [(body.decode(), signature, "webhook-secret")]


def test_order_creation_uses_minor_units(monkeypatch) -> None:
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    provider = object.__new__(RazorpayProvider)
    provider.client = FakeClient()

    order = provider.create_order(Decimal("530.00"), "INR", "booking-1")

    assert order["id"] == "order_test_123"
    assert order["amount"] == 53000


def test_invalid_payment_signature_is_not_suppressed() -> None:
    provider = object.__new__(RazorpayProvider)
    provider.client = FakeClient()
    provider.client.utility.verify_payment_signature = lambda payload: (_ for _ in ()).throw(ValueError("invalid"))

    with pytest.raises(ValueError):
        provider.verify_payment("order", "payment", "invalid")
