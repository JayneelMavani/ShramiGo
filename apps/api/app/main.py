from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models import User  # noqa: F401 - ensures model metadata is registered
from app.routers import auth, health, profile, services, worker_services, workers, bookings
from app.routers import reviews, notifications, admin, payments, ai

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend API for ShramiGo Cooperative Gig Services Platform",
)


# Allow requests from the React frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers.
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(services.router)
app.include_router(worker_services.router)
app.include_router(workers.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to ShramiGo API",
        "status": "running",
    }