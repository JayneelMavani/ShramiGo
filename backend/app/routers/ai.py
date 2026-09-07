import math
import re
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import require_customer
from app.models.customer_profile import CustomerProfile
from app.models.review import Review
from app.models.service import Service
from app.models.user import User, UserRole
from app.models.worker_availability import WorkerAvailability
from app.models.worker_profile import WorkerProfile
from app.models.worker_service import WorkerService
from app.schemas.ai import (
    AIRecommendationRequest,
    AIRecommendationResponse,
    AIRecommendationWorker,
)

router = APIRouter(prefix="/api/ai", tags=["AI Recommendations"])


SERVICE_ALIASES = {
    "plumber": ["plumber", "plumbing", "pipe", "tap", "faucet", "leak", "water leak", "drain", "toilet"],
    "electrician": ["electrician", "electrical", "electric", "wiring", "switch", "socket", "fan", "light", "power"],
    "carpenter": ["carpenter", "carpentry", "furniture", "wood", "door", "cupboard", "wardrobe", "shelf"],
    "painter": ["painter", "painting", "paint", "wall color", "colour", "wall"],
    "cleaner": ["cleaner", "cleaning", "clean", "house cleaning", "deep cleaning", "mop", "dust"],
    "driver": ["driver", "driving", "ride", "transport", "car driver", "cab"],
    "ac repair": ["ac repair", "air conditioner", "air conditioning", "ac", "cooling", "split ac"],
    "appliance repair": ["appliance", "washing machine", "refrigerator", "fridge", "microwave", "oven", "geyser"],
    "sofa cleaning": ["sofa", "couch", "upholstery"],
}

STOP_WORDS = {
    "the", "a", "an", "is", "are", "my", "me", "i", "need", "want", "please",
    "for", "to", "of", "in", "on", "and", "with", "there", "has", "have", "can",
}


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).strip()


def tokenize(text: str) -> set[str]:
    return {
        word
        for word in normalize(text).split()
        if len(word) > 2 and word not in STOP_WORDS
    }


def detect_service(description: str, services: list[Service], requested_service: str | None):
    if requested_service and requested_service.strip() and requested_service.strip().lower() not in {"any", "any service"}:
        requested = normalize(requested_service)
        best = next(
            (
                service
                for service in services
                if normalize(service.name) == requested
                or normalize(service.category) == requested
                or requested in normalize(service.name)
                or requested in normalize(service.category)
            ),
            None,
        )
        if best:
            return best, 100

    if not description.strip():
        return None, 0

    text = normalize(description)
    scores: list[tuple[int, Service]] = []

    for service in services:
        score = 0
        service_text = f"{service.name} {service.category} {service.description or ''}"
        service_tokens = tokenize(service_text)
        desc_tokens = tokenize(description)

        score += len(desc_tokens & service_tokens) * 10

        for canonical, aliases in SERVICE_ALIASES.items():
            if canonical in normalize(service.name) or canonical in normalize(service.category):
                text_tokens = tokenize(description)
                for alias in aliases:
                    if " " in alias:
                        if alias in text:
                            score += 25
                    elif alias in text_tokens:
                        score += 15

        if normalize(service.name) in text:
            score += 40

        if score > 0:
            scores.append((score, service))

    if not scores:
        return None, 0

    scores.sort(key=lambda item: (-item[0], item[1].name.lower()))
    best_score, best_service = scores[0]
    second_score = scores[1][0] if len(scores) > 1 else 0
    confidence = min(99, max(55, 55 + best_score - second_score // 2))
    return best_service, confidence


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(d_lon / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def service_matches(worker_service: Service, detected: Service) -> bool:
    detected_text = normalize(f"{detected.name} {detected.category}")
    worker_text = normalize(f"{worker_service.name} {worker_service.category}")

    if detected_text in worker_text or worker_text in detected_text:
        return True

    detected_tokens = tokenize(detected_text)
    worker_tokens = tokenize(worker_text)
    return bool(detected_tokens & worker_tokens)


@router.post(
    "/recommendations",
    response_model=AIRecommendationResponse,
)
def get_ai_recommendations(
    data: AIRecommendationRequest,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    services = db.query(Service).filter(Service.is_active == True).all()
    detected_service, confidence = detect_service(data.description, services, data.service)

    customer_profile = (
        db.query(CustomerProfile)
        .filter(CustomerProfile.user_id == current_user.id)
        .first()
    )

    customer_lat = data.latitude
    customer_lon = data.longitude
    if customer_lat is None and customer_profile:
        customer_lat = float(customer_profile.latitude) if customer_profile.latitude is not None else None
    if customer_lon is None and customer_profile:
        customer_lon = float(customer_profile.longitude) if customer_profile.longitude is not None else None

    query = (
        db.query(User, WorkerProfile, WorkerService, Service)
        .join(WorkerProfile, WorkerProfile.user_id == User.id)
        .join(WorkerService, (WorkerService.worker_id == User.id) & (WorkerService.is_active == True))
        .join(Service, (Service.id == WorkerService.service_id) & (Service.is_active == True))
        .filter(
            User.role == UserRole.WORKER,
            User.is_active == True,
        )
    )

    if detected_service:
        candidates = [
            row for row in query.all()
            if service_matches(row[3], detected_service)
        ]
    else:
        candidates = query.all()

    ranked = []

    for user, profile, worker_service, service in candidates:
        price = float(worker_service.custom_price) if worker_service.custom_price is not None else float(service.base_price)
        if data.max_price is not None and price > data.max_price:
            continue

        review_stats = (
            db.query(
                func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
                func.count(Review.id).label("reviews_count"),
            )
            .filter(Review.worker_id == user.id)
            .first()
        )
        rating = round(float(review_stats.avg_rating or 0), 1)
        reviews = int(review_stats.reviews_count or 0)

        availability = (
            db.query(WorkerAvailability)
            .filter(
                WorkerAvailability.worker_id == user.id,
                WorkerAvailability.is_available == True,
            )
            .first()
        )
        available = availability is not None

        distance = None
        if (
            customer_lat is not None
            and customer_lon is not None
            and profile.latitude is not None
            and profile.longitude is not None
        ):
            distance = haversine_km(
                customer_lat,
                customer_lon,
                float(profile.latitude),
                float(profile.longitude),
            )

        score = 0.0
        reasons: list[str] = []

        if detected_service and service_matches(service, detected_service):
            score += 35
            reasons.append("Service skill match")

        if available:
            score += 15
            reasons.append("Availability configured")

        rating_score = min(rating / 5.0, 1.0) * 20
        score += rating_score
        if rating >= 4.5:
            reasons.append("Highly rated")
        elif rating >= 4.0:
            reasons.append("Good ratings")

        experience_score = min(profile.experience_years / 10.0, 1.0) * 10
        score += experience_score
        if profile.experience_years >= 3:
            reasons.append(f"{profile.experience_years} years experience")

        if distance is not None:
            distance_score = max(0.0, 10.0 * (1.0 - min(distance, 10.0) / 10.0))
            score += distance_score
            if distance <= 3:
                reasons.append("Close to your location")
            elif distance <= 7:
                reasons.append("Within your area")
        else:
            score += 5
            reasons.append("Location can be confirmed during booking")

        if data.max_price is not None:
            budget_score = 10.0 if price <= data.max_price else 0.0
            score += budget_score
            if price <= data.max_price:
                reasons.append("Within your budget")
        else:
            score += 5

        if user.is_verified:
            reasons.append("Verified worker")
            score += 2

        ranked.append(
            {
                "id": user.id,
                "name": user.full_name,
                "service": service.name,
                "rating": rating,
                "reviews": reviews,
                "distance_km": round(distance, 1) if distance is not None else None,
                "price": round(price, 2),
                "experience_years": profile.experience_years,
                "available": available,
                "verified": user.is_verified,
                "image": profile.profile_image,
                "city": profile.city,
                "state": profile.state,
                "match_score": min(99, max(1, round(score))),
                "match_reasons": reasons[:4],
            }
        )

    ranked.sort(
        key=lambda worker: (
            -worker["match_score"],
            -(worker["rating"] or 0),
            worker["price"],
            worker["name"].lower(),
        )
    )
    ranked = ranked[: data.limit]

    if detected_service:
        explanation = (
            f"AI identified {detected_service.name} from your request and ranked workers using service match, availability, rating, experience, price and location."
        )
    else:
        explanation = (
            "Describe the work you need or select a service. The recommendation engine will rank suitable workers using your preferences and available worker data."
        )

    return AIRecommendationResponse(
        detected_service=detected_service.name if detected_service else None,
        confidence=confidence,
        explanation=explanation,
        workers=[AIRecommendationWorker(**worker) for worker in ranked],
    )
