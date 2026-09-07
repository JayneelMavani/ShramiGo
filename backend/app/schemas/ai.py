from pydantic import BaseModel, Field


class AIRecommendationRequest(BaseModel):
    description: str = Field(default="", max_length=1000)
    service: str | None = Field(default=None, max_length=100)
    max_price: float | None = Field(default=None, gt=0)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    limit: int = Field(default=5, ge=1, le=10)


class AIRecommendationWorker(BaseModel):
    id: int
    name: str
    service: str
    rating: float
    reviews: int
    distance_km: float | None = None
    price: float
    experience_years: int
    available: bool
    verified: bool
    image: str | None = None
    city: str | None = None
    state: str | None = None
    match_score: int
    match_reasons: list[str]


class AIRecommendationResponse(BaseModel):
    detected_service: str | None
    confidence: int
    explanation: str
    workers: list[AIRecommendationWorker]
