import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.models import User  # noqa: F401 - ensures model metadata is registered
from app.routers import auth, health, profile, services, worker_services, workers, bookings
from app.routers import reviews, notifications, admin, payments, ai

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend API for ShramiGo Cooperative Gig Services Platform",
)


# Global exception handler to guarantee CORS headers on uncaught 500 errors
@app.exception_handler(Exception)
async def global_cors_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server exception: %s", exc)
    origin = request.headers.get("origin", "*")
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response


# Allow requests from React frontend (supporting localhost, mobile LAN, tunnels, and host mode).
configured_origins = [o for o in settings.cors_origins if o]
cors_origins = configured_origins if configured_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    allow_private_network=True,
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