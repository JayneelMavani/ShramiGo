from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Any


class PaymentProvider(ABC):
    name: str

    @abstractmethod
    def create_order(self, amount: Decimal, currency: str, receipt: str) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def verify_payment(self, order_id: str, payment_id: str, signature: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def verify_webhook(self, body: bytes, signature: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def refund_payment(self, payment_id: str, amount: Decimal | None = None) -> dict[str, Any]:
        raise NotImplementedError