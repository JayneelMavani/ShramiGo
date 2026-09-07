from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=100)
    description: str | None = None
    base_price: Decimal = Field(default=0, ge=0)
    icon: str | None = Field(default=None, max_length=100)


class ServiceUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    description: str | None = None

    base_price: Decimal | None = Field(
        default=None,
        ge=0,
    )

    icon: str | None = Field(
        default=None,
        max_length=100,
    )

    is_active: bool | None = None


class ServiceResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str | None = None
    base_price: Decimal
    icon: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)