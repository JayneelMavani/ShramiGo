from decimal import Decimal
from typing import Any

import razorpay

from app.core.config import settings
from app.services.payment.base import PaymentProvider


class RazorpayProvider(PaymentProvider):
    name = "razorpay"

    def __init__(self) -> None:
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            raise RuntimeError("Razorpay credentials are not configured")
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_order(self, amount: Decimal, currency: str, receipt: str) -> dict[str, Any]:
        return self.client.order.create({
            "amount": int((amount * 100).quantize(Decimal("1"))),
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1,
        })

    def verify_payment(self, order_id: str, payment_id: str, signature: str) -> None:
        self.client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })

    def verify_webhook(self, body: bytes, signature: str) -> None:
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            raise RuntimeError("Razorpay webhook secret is not configured")
        self.client.utility.verify_webhook_signature(body.decode("utf-8"), signature, settings.RAZORPAY_WEBHOOK_SECRET)

    def refund_payment(self, payment_id: str, amount: Decimal | None = None) -> dict[str, Any]:
        payload = {}
        if amount is not None:
            payload["amount"] = int((amount * 100).quantize(Decimal("1")))
        return self.client.payment.refund(payment_id, payload)