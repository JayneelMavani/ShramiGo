from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        min_length=10,
        max_length=20,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    role: UserRole = UserRole.CUSTOMER


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


class UserResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: EmailStr
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str
    expires_in: int
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=32, max_length=512)