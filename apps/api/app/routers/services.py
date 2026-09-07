from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.service import Service
from app.models.user import User, UserRole
from app.schemas.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceUpdate,
)

router = APIRouter(
    prefix="/api/services",
    tags=["Services"],
)


@router.get(
    "",
    response_model=list[ServiceResponse],
)
def get_services(
    db: Session = Depends(get_db),
):
    return (
        db.query(Service)
        .filter(Service.is_active == True)
        .order_by(Service.category, Service.name)
        .all()
    )


@router.get(
    "/{service_id}",
    response_model=ServiceResponse,
)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    service = (
        db.query(Service)
        .filter(Service.id == service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return service


@router.post(
    "",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create services",
        )

    existing = (
        db.query(Service)
        .filter(Service.name == data.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Service already exists",
        )

    service = Service(
        name=data.name,
        category=data.category,
        description=data.description,
        base_price=data.base_price,
        icon=data.icon,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@router.put(
    "/{service_id}",
    response_model=ServiceResponse,
)
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update services",
        )

    service = (
        db.query(Service)
        .filter(Service.id == service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        duplicate = (
            db.query(Service)
            .filter(
                Service.name == update_data["name"],
                Service.id != service_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another service with this name already exists",
            )

    for key, value in update_data.items():
        setattr(service, key, value)

    db.commit()
    db.refresh(service)

    return service


@router.delete(
    "/{service_id}",
)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete services",
        )

    service = (
        db.query(Service)
        .filter(Service.id == service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    service.is_active = False

    db.commit()

    return {
        "message": "Service deactivated successfully"
    }