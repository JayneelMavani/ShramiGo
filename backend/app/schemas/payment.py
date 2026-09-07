from decimal import Decimal

from pydantic import BaseModel, Field


class PaymentOrderResponse(BaseModel):
    payment_id: int
    order_id: str
    key_id: str
    amount: Decimal
    currency: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str = Field(min_length=5, max_length=150)
    razorpay_payment_id: str = Field(min_length=5, max_length=150)
    razorpay_signature: str = Field(min_length=10, max_length=255)