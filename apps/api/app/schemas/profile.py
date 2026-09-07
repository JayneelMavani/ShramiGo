from datetime import datetime,time

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CustomerProfileResponse(BaseModel):
    id: int
    user_id: int
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    profile_image: str | None = None
    bio: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class CustomerProfileUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        max_length=100,
    )
    phone: str | None = Field(
        default=None,
        max_length=20,
    )
    address: str | None = Field(
        default=None,
        max_length=255,
    )
    city: str | None = Field(
        default=None,
        max_length=100,
    )
    state: str | None = Field(
        default=None,
        max_length=100,
    )
    pincode: str | None = Field(
        default=None,
        max_length=10,
    )
    profile_image: str | None = Field(
        default=None,
        max_length=400_000,
    )
    bio: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @field_validator("longitude")
    @classmethod
    def longitude_requires_latitude(cls, value: float | None, info):
        latitude = info.data.get("latitude")
        if value is not None and latitude is None:
            raise ValueError("latitude is required when longitude is provided")
        return value



class WorkerProfileResponse(BaseModel):
    id: int
    user_id: int
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    profile_image: str | None = None
    bio: str | None = None
    experience_years: int
    latitude: float | None = None
    longitude: float | None = None
    service_radius_km: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class WorkerProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(
        default=None,
        max_length=255,
    )
    city: str | None = Field(
        default=None,
        max_length=100,
    )
    state: str | None = Field(
        default=None,
        max_length=100,
    )
    pincode: str | None = Field(
        default=None,
        max_length=10,
    )
    profile_image: str | None = Field(
        default=None,
        max_length=400_000,
    )
    bio: str | None = None
    experience_years: int = Field(
        default=0,
        ge=0,
        le=60,
    )
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    service_radius_km: float | None = Field(default=None, ge=0.1, le=200)

    @field_validator("longitude")
    @classmethod
    def longitude_requires_latitude(cls, value: float | None, info):
        latitude = info.data.get("latitude")
        if value is not None and latitude is None:
            raise ValueError("latitude is required when longitude is provided")
        return value


class WorkerSkillCreate(BaseModel):
    skill_name: str = Field(
        min_length=2,
        max_length=100,
    )
    category: str | None = Field(
        default=None,
        max_length=100,
    )
    description: str | None = None


class WorkerSkillUpdate(BaseModel):
    skill_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    category: str | None = Field(
        default=None,
        max_length=100,
    )
    description: str | None = None


class WorkerSkillResponse(BaseModel):
    id: int
    worker_id: int
    skill_name: str
    category: str | None = None
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )

class WorkerAvailabilityCreate(BaseModel):
    day_of_week: str = Field(
        min_length=3,
        max_length=20,
    )
    start_time: str | None = None
    end_time: str | None = None
    is_available: bool = True


class WorkerAvailabilityUpdate(BaseModel):
    day_of_week: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )
    start_time: str | None = None
    end_time: str | None = None
    is_available: bool | None = None


class WorkerAvailabilityResponse(BaseModel):
    id: int
    worker_id: int
    day_of_week: str
    start_time: time | None = None
    end_time: time | None = None
    is_available: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )