from math import asin, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.worker_service import WorkerService
from app.models.service import Service
from app.models.worker_availability import WorkerAvailability
from app.schemas.worker_discovery import WorkerDiscoveryResponse


router = APIRouter(
    prefix="/api/workers",
    tags=["Workers"],
)


def haversine_km(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float) -> float:
    earth_radius_km = 6371.0088
    d_lat = radians(latitude_b - latitude_a)
    d_lon = radians(longitude_b - longitude_a)
    value = sin(d_lat / 2) ** 2 + cos(radians(latitude_a)) * cos(radians(latitude_b)) * sin(d_lon / 2) ** 2
    return earth_radius_km * 2 * asin(sqrt(value))


@router.get("/nearby", response_model=list[WorkerDiscoveryResponse])
def nearby_workers(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius: float = Query(default=25, gt=0, le=200),
    service_id: int | None = Query(default=None, gt=0),
    available: bool | None = None,
    minimum_rating: float = Query(default=0, ge=0, le=5),
    maximum_price: float | None = Query(default=None, gt=0),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(User, WorkerProfile, WorkerService, Service).join(
        WorkerProfile, WorkerProfile.user_id == User.id
    ).join(WorkerService, WorkerService.worker_id == User.id).join(
        Service, Service.id == WorkerService.service_id
    ).filter(
        User.role == UserRole.WORKER,
        User.is_active == True,
        WorkerService.is_active == True,
        Service.is_active == True,
        WorkerProfile.latitude.is_not(None),
        WorkerProfile.longitude.is_not(None),
    )
    if service_id:
        query = query.filter(Service.id == service_id)
    candidates: list[WorkerDiscoveryResponse] = []
    seen: set[int] = set()
    for user, profile, worker_service, service_obj in query.all():
        if user.id in seen:
            continue
        distance = haversine_km(latitude, longitude, float(profile.latitude), float(profile.longitude))
        if distance > radius:
            continue
        worker_availability = db.query(WorkerAvailability).filter(
            WorkerAvailability.worker_id == user.id,
            WorkerAvailability.is_available == True,
        ).first() is not None
        if available is not None and worker_availability != available:
            continue
        price = float(worker_service.custom_price or service_obj.base_price)
        if maximum_price is not None and price > maximum_price:
            continue
        rating = float(db.query(func.coalesce(func.avg(Review.rating), 0.0)).filter(Review.worker_id == user.id).scalar() or 0)
        if rating < minimum_rating:
            continue
        seen.add(user.id)
        candidates.append(WorkerDiscoveryResponse(
            id=user.id,
            name=user.full_name,
            service=service_obj.name,
            experience=f"{profile.experience_years} Years Experience",
            rating=round(rating, 1),
            reviews=int(db.query(func.count(Review.id)).filter(Review.worker_id == user.id).scalar() or 0),
            distance=f"{distance:.1f} km",
            price=f"₹{price:.0f}/hr",
            available=worker_availability,
            verified=user.is_verified,
            image=profile.profile_image,
            city=profile.city,
            state=profile.state,
        ))
    candidates.sort(key=lambda item: float(item.distance.split()[0]) if item.distance else float("inf"))
    start = (page - 1) * page_size
    return candidates[start:start + page_size]


# ============================================================
# CUSTOMER WORKER DISCOVERY
# ============================================================

@router.get(
    "",
    response_model=list[WorkerDiscoveryResponse],
)
def discover_workers(
    service: str | None = Query(default=None),
    city: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            User,
            WorkerProfile,
            WorkerService,
            Service,
        )
        .join(
            WorkerProfile,
            WorkerProfile.user_id == User.id,
        )
        .outerjoin(
            WorkerService,
            (WorkerService.worker_id == User.id)
            & (WorkerService.is_active == True),
        )
        .outerjoin(
            Service,
            (Service.id == WorkerService.service_id)
            & (Service.is_active == True),
        )
        .filter(
            User.role == UserRole.WORKER,
            User.is_active == True,
        )
    )

    # Service search with aliases
    if service:
        search_service = service.strip().lower()

        service_aliases = {
            "plumber": ["plumber", "plumbing"],
            "electrician": ["electrician", "electrical"],
            "carpenter": ["carpenter", "carpentry"],
            "cleaner": ["cleaner", "cleaning"],
            "painter": ["painter", "painting"],
            "driver": ["driver", "driving"],
            "ac repair": ["ac repair", "air conditioner"],
            "appliance repair": [
                "appliance repair",
                "appliances",
            ],
            "sofa cleaning": [
                "sofa cleaning",
                "sofa",
            ],
        }

        search_terms = service_aliases.get(
            search_service,
            [search_service],
        )

        query = query.filter(
            or_(
                *[
                    Service.name.ilike(f"%{term}%")
                    for term in search_terms
                ],
                *[
                    Service.category.ilike(f"%{term}%")
                    for term in search_terms
                ],
            )
        )

    # City filter
    if city:
        query = query.filter(
            WorkerProfile.city.ilike(
                f"%{city.strip()}%"
            )
        )

    results = query.order_by(
        User.created_at.desc()
    ).all()

    workers = []

    for user, profile, worker_service, service_obj in results:

        availability = (
            db.query(WorkerAvailability)
            .filter(
                WorkerAvailability.worker_id == user.id,
                WorkerAvailability.is_available == True,
            )
            .first()
        )

        if service_obj is not None and worker_service is not None:
            custom_price = worker_service.custom_price
            if custom_price is not None:
                price = f"₹{float(custom_price):.0f}/hr"
            else:
                price = f"₹{float(service_obj.base_price):.0f}/hr"
            service_name = service_obj.name
        else:
            price = "—"
            service_name = "Services not configured"

        review_stats = (
            db.query(
                func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
                func.count(Review.id).label("reviews_count"),
            )
            .filter(Review.worker_id == user.id)
            .first()
        )
        avg_rating = round(float(review_stats.avg_rating), 1) if review_stats else 0.0
        review_count = int(review_stats.reviews_count) if review_stats else 0

        workers.append(
            WorkerDiscoveryResponse(
                id=user.id,
                name=user.full_name,
                service=service_name,
                experience=(
                    f"{profile.experience_years} "
                    "Years Experience"
                ),
                rating=avg_rating,
                reviews=review_count,
                distance=None,
                price=price,
                available=(worker_service is not None and service_obj is not None and availability is not None),
                verified=user.is_verified,
                image=profile.profile_image,
                city=profile.city,
                state=profile.state,
            )
        )

    return workers


# ============================================================
# CUSTOMER WORKER DETAILS
# ============================================================

@router.get("/{worker_id}")
def get_worker_details(
    worker_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find worker
    # --------------------------------------------------------

    worker = (
        db.query(User)
        .filter(
            User.id == worker_id,
            User.role == UserRole.WORKER,
            User.is_active == True,
        )
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found",
        )

    # --------------------------------------------------------
    # Worker profile
    # --------------------------------------------------------

    profile = (
        db.query(WorkerProfile)
        .filter(
            WorkerProfile.user_id == worker.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found",
        )

    # --------------------------------------------------------
    # Worker skills
    # --------------------------------------------------------

    skills = (
        db.query(WorkerSkill)
        .filter(
            WorkerSkill.worker_id == worker.id
        )
        .order_by(
            WorkerSkill.skill_name
        )
        .all()
    )

    # --------------------------------------------------------
    # Worker services
    # --------------------------------------------------------

    service_results = (
        db.query(
            WorkerService,
            Service,
        )
        .join(
            Service,
            WorkerService.service_id == Service.id,
        )
        .filter(
            WorkerService.worker_id == worker.id,
            WorkerService.is_active == True,
            Service.is_active == True,
        )
        .order_by(
            Service.category,
            Service.name,
        )
        .all()
    )

    services = []

    for worker_service, service_obj in service_results:

        if worker_service.custom_price is not None:
            price = float(
                worker_service.custom_price
            )
        else:
            price = float(
                service_obj.base_price
            )

        services.append(
            {
                "id": worker_service.id,
                "service_id": service_obj.id,
                "name": service_obj.name,
                "category": service_obj.category,
                "description": service_obj.description,
                "base_price": float(
                    service_obj.base_price
                ),
                "price": price,
                "icon": service_obj.icon,
            }
        )

    # --------------------------------------------------------
    # Worker availability
    # --------------------------------------------------------

    availability = (
        db.query(WorkerAvailability)
        .filter(
            WorkerAvailability.worker_id == worker.id
        )
        .order_by(
            WorkerAvailability.id
        )
        .all()
    )

    # --------------------------------------------------------
    # Current availability status
    # --------------------------------------------------------

    is_available = any(
        item.is_available
        for item in availability
    )

    # --------------------------------------------------------
    # Return complete worker details
    # --------------------------------------------------------

    return {
        "id": worker.id,
        "name": worker.full_name,
        "phone": worker.phone,
        "email": worker.email,
        "verified": worker.is_verified,
        "is_active": worker.is_active,

        "profile": {
            "id": profile.id,
            "address": profile.address,
            "city": profile.city,
            "state": profile.state,
            "pincode": profile.pincode,
            "profile_image": profile.profile_image,
            "bio": profile.bio,
            "experience_years": profile.experience_years,
        },

        "skills": [
            {
                "id": skill.id,
                "skill_name": skill.skill_name,
                "category": skill.category,
                "description": skill.description,
            }
            for skill in skills
        ],

        "services": services,

        "availability": [
            {
                "id": item.id,
                "day_of_week": item.day_of_week,
                "start_time": (
                    item.start_time.isoformat()
                    if item.start_time
                    else None
                ),
                "end_time": (
                    item.end_time.isoformat()
                    if item.end_time
                    else None
                ),
                "is_available": item.is_available,
            }
            for item in availability
        ],

        "available": is_available,

        "rating": (
            round(float(db.query(func.coalesce(func.avg(Review.rating), 0.0)).filter(Review.worker_id == worker_id).scalar() or 0.0), 1)
        ),
        "reviews": (
            int(db.query(func.count(Review.id)).filter(Review.worker_id == worker_id).scalar() or 0)
        ),
    }