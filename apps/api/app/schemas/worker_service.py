from decimal import Decimal

from pydantic import BaseModel, Field


class WorkerServiceCreate(BaseModel):
    service_id: int = Field(gt=0)
    custom_price: Decimal | None = Field(
        default=None,
        gt=0,
    )


class WorkerServiceUpdate(BaseModel):
    custom_price: Decimal | None = Field(
        default=None,
        gt=0,
    )
    is_active: bool | None = None