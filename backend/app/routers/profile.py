from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import time
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.customer_profile import CustomerProfile
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.schemas.profile import (
    CustomerProfileResponse,
    CustomerProfileUpdate,
    WorkerProfileResponse,
    WorkerProfileUpdate,
    WorkerSkillCreate,
    WorkerSkillUpdate,
    WorkerSkillResponse,
    WorkerAvailabilityCreate,
    WorkerAvailabilityUpdate,
    WorkerAvailabilityResponse,
)
from app.models.worker_availability import WorkerAvailability


router = APIRouter(
    prefix="/api/profile",
    tags=["Profiles"],
)


# =========================
# CUSTOMER PROFILE
# =========================

@router.get(
    "/customer",
    response_model=CustomerProfileResponse,
)
def get_customer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can access this profile",
        )

    profile = db.query(CustomerProfile).filter(
        CustomerProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = CustomerProfile(
            user_id=current_user.id,
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.put(
    "/customer",
    response_model=CustomerProfileResponse,
)
def update_customer_profile(
    data: CustomerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can update this profile",
        )

    profile = db.query(CustomerProfile).filter(
        CustomerProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = CustomerProfile(
            user_id=current_user.id,
        )
        db.add(profile)

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "full_name" in update_data and update_data["full_name"]:
        current_user.full_name = update_data.pop("full_name").strip()

    if "phone" in update_data and update_data["phone"]:
        current_user.phone = update_data.pop("phone").strip()

    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


# =========================
# WORKER PROFILE
# =========================

@router.get(
    "/worker",
    response_model=WorkerProfileResponse,
)
def get_worker_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access this profile",
        )

    profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = WorkerProfile(
            user_id=current_user.id,
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.put(
    "/worker",
    response_model=WorkerProfileResponse,
)
def update_worker_profile(
    data: WorkerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can update this profile",
        )

    profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = WorkerProfile(
            user_id=current_user.id,
        )
        db.add(profile)

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "full_name" in update_data:
        value = update_data.pop("full_name")
        if value is not None and value.strip():
            current_user.full_name = value.strip()

    if "phone" in update_data:
        value = update_data.pop("phone")
        if value is not None and value.strip():
            # Prevent accidental duplicate phone numbers.
            existing = db.query(User).filter(
                User.phone == value.strip(),
                User.id != current_user.id,
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This phone number is already registered.",
                )
            current_user.phone = value.strip()

    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile

@router.get(
    "/worker/skills",
    response_model=list[WorkerSkillResponse],
)
def get_worker_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access skills",
        )

    skills = db.query(WorkerSkill).filter(
        WorkerSkill.worker_id == current_user.id
    ).order_by(
        WorkerSkill.created_at.desc()
    ).all()

    return skills


@router.post(
    "/worker/skills",
    response_model=WorkerSkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_worker_skill(
    data: WorkerSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can add skills",
        )

    skill = WorkerSkill(
        worker_id=current_user.id,
        skill_name=data.skill_name,
        category=data.category,
        description=data.description,
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill


@router.put(
    "/worker/skills/{skill_id}",
    response_model=WorkerSkillResponse,
)
def update_worker_skill(
    skill_id: int,
    data: WorkerSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can update skills",
        )

    skill = db.query(WorkerSkill).filter(
        WorkerSkill.id == skill_id,
        WorkerSkill.worker_id == current_user.id,
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(skill, field, value)

    db.commit()
    db.refresh(skill)

    return skill


@router.delete(
    "/worker/skills/{skill_id}",
)
def delete_worker_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can delete skills",
        )

    skill = db.query(WorkerSkill).filter(
        WorkerSkill.id == skill_id,
        WorkerSkill.worker_id == current_user.id,
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    db.delete(skill)
    db.commit()

    return {
        "message": "Skill deleted successfully",
    }

@router.get(
    "/worker/availability",
    response_model=list[WorkerAvailabilityResponse],
)
def get_worker_availability(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access availability",
        )

    availability = db.query(WorkerAvailability).filter(
        WorkerAvailability.worker_id == current_user.id
    ).order_by(
        WorkerAvailability.id
    ).all()

    return availability


@router.post(
    "/worker/availability",
    response_model=WorkerAvailabilityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_worker_availability(
    data: WorkerAvailabilityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can add availability",
        )

    start_time = None
    end_time = None

    if data.start_time:
        try:
            start_time = time.fromisoformat(data.start_time)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_time format. Use HH:MM",
            )

    if data.end_time:
        try:
            end_time = time.fromisoformat(data.end_time)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_time format. Use HH:MM",
            )

    availability = WorkerAvailability(
        worker_id=current_user.id,
        day_of_week=data.day_of_week,
        start_time=start_time,
        end_time=end_time,
        is_available=data.is_available,
    )

    db.add(availability)
    db.commit()
    db.refresh(availability)

    return availability


@router.put(
    "/worker/availability/{availability_id}",
    response_model=WorkerAvailabilityResponse,
)
def update_worker_availability(
    availability_id: int,
    data: WorkerAvailabilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can update availability",
        )

    availability = db.query(WorkerAvailability).filter(
        WorkerAvailability.id == availability_id,
        WorkerAvailability.worker_id == current_user.id,
    ).first()

    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "start_time" in update_data:
        value = update_data["start_time"]

        if value:
            try:
                update_data["start_time"] = time.fromisoformat(value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_time format. Use HH:MM",
                )
        else:
            update_data["start_time"] = None

    if "end_time" in update_data:
        value = update_data["end_time"]

        if value:
            try:
                update_data["end_time"] = time.fromisoformat(value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_time format. Use HH:MM",
                )
        else:
            update_data["end_time"] = None

    for field, value in update_data.items():
        setattr(availability, field, value)

    db.commit()
    db.refresh(availability)

    return availability


@router.delete(
    "/worker/availability/{availability_id}",
)
def delete_worker_availability(
    availability_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can delete availability",
        )

    availability = db.query(WorkerAvailability).filter(
        WorkerAvailability.id == availability_id,
        WorkerAvailability.worker_id == current_user.id,
    ).first()

    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found",
        )

    db.delete(availability)
    db.commit()

    return {
        "message": "Availability deleted successfully",
    }