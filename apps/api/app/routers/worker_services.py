from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.service import Service
from app.models.user import User, UserRole
from app.models.worker_service import WorkerService
from app.schemas.worker_service import (
    WorkerServiceCreate,
    WorkerServiceUpdate,
)

router = APIRouter(
    prefix="/api/worker/services",
    tags=["Worker Services"],
)


@router.get("")
def get_my_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access worker services",
        )

    results = (
        db.query(WorkerService, Service)
        .join(
            Service,
            WorkerService.service_id == Service.id,
        )
        .filter(
            WorkerService.worker_id == current_user.id,
            WorkerService.is_active == True,
        )
        .order_by(Service.category, Service.name)
        .all()
    )

    return [
        {
            "id": worker_service.id,
            "service_id": service.id,
            "name": service.name,
            "category": service.category,
            "description": service.description,
            "base_price": float(service.base_price),
            "custom_price": (
                float(worker_service.custom_price)
                if worker_service.custom_price is not None
                else None
            ),
            "icon": service.icon,
            "is_active": worker_service.is_active,
        }
        for worker_service, service in results
    ]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def add_my_service(
    data: WorkerServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can add services",
        )

    service = (
        db.query(Service)
        .filter(
            Service.id == data.service_id,
            Service.is_active == True,
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found or inactive",
        )

    existing = (
        db.query(WorkerService)
        .filter(
            WorkerService.worker_id == current_user.id,
            WorkerService.service_id == data.service_id,
        )
        .first()
    )

    if existing:
        if existing.is_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already provide this service",
            )

        existing.is_active = True
        existing.custom_price = data.custom_price

        db.commit()
        db.refresh(existing)

        return {
            "message": "Service reactivated successfully",
            "worker_service_id": existing.id,
        }

    worker_service = WorkerService(
        worker_id=current_user.id,
        service_id=data.service_id,
        custom_price=data.custom_price,
        is_active=True,
    )

    db.add(worker_service)
    db.commit()
    db.refresh(worker_service)

    return {
        "message": "Service added successfully",
        "worker_service_id": worker_service.id,
    }


@router.put(
    "/{worker_service_id}",
)
def update_my_service(
    worker_service_id: int,
    data: WorkerServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can update services",
        )

    worker_service = (
        db.query(WorkerService)
        .filter(
            WorkerService.id == worker_service_id,
            WorkerService.worker_id == current_user.id,
        )
        .first()
    )

    if not worker_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker service not found",
        )

    if data.custom_price is not None:
        worker_service.custom_price = data.custom_price

    if data.is_active is not None:
        worker_service.is_active = data.is_active

    db.commit()
    db.refresh(worker_service)

    return {
        "message": "Worker service updated successfully",
    }


@router.delete(
    "/{worker_service_id}",
)
def remove_my_service(
    worker_service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can remove services",
        )

    worker_service = (
        db.query(WorkerService)
        .filter(
            WorkerService.id == worker_service_id,
            WorkerService.worker_id == current_user.id,
        )
        .first()
    )

    if not worker_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker service not found",
        )

    worker_service.is_active = False

    db.commit()

    return {
        "message": "Service removed successfully",
    }