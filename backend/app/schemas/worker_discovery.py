from pydantic import BaseModel


class WorkerDiscoveryResponse(BaseModel):
    id: int
    name: str
    service: str
    experience: str
    rating: float
    reviews: int
    distance: str | None
    price: str
    available: bool
    verified: bool
    image: str | None = None
    city: str | None = None
    state: str | None = None