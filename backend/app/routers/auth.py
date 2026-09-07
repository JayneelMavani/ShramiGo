import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.customer_profile import CustomerProfile
from app.models.worker_profile import WorkerProfile
from app.models.refresh_token import RefreshToken
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    RefreshRequest,
)
from app.services.rate_limit import login_rate_limiter


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


def _new_refresh_token(user: User, request: Request, db: Session) -> str:
    raw = secrets.token_urlsafe(48)
    token = RefreshToken(
        user_id=user.id,
        token_hash=hashlib.sha256(raw.encode()).hexdigest(),
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(token)
    return raw


def _response(user: User, request: Request, db: Session) -> TokenResponse:
    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = _new_refresh_token(user, request, db)
    db.commit()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, user=user)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    # Admin accounts cannot be created through public registration.
    if data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin registration is not allowed",
        )

    # Check whether email already exists.
    existing_email = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    # Check whether phone already exists.
    existing_phone = db.query(User).filter(
        User.phone == data.phone
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number is already registered",
        )

    # Create user.
    user = User(
        full_name=data.full_name,
        phone=data.phone,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )

    db.add(user)
    db.flush()

    # Automatically create the appropriate profile.
    if data.role == UserRole.WORKER:
        worker_profile = WorkerProfile(
            user_id=user.id,
        )
        db.add(worker_profile)

    elif data.role == UserRole.CUSTOMER:
        customer_profile = CustomerProfile(
            user_id=user.id,
        )
        db.add(customer_profile)

    # Save user + profile together.
    db.commit()
    db.refresh(user)

    # Create JWT token.
    return _response(user, request=request, db=db)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else "unknown"
    if not login_rate_limiter.check(ip_address, data.email):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts. Please try again later.")
    # Find user by email.
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password.
    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check account status.
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive",
        )

    # Create JWT token.
    return _response(user, request, db)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if not stored or stored.revoked_at or stored.expires_at <= now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == stored.user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    stored.revoked_at = now
    response = _response(user, request, db)
    replacement = db.query(RefreshToken).filter(RefreshToken.token_hash == hashlib.sha256(response.refresh_token.encode()).hexdigest()).first()
    stored.replaced_by_token_id = replacement.id if replacement else None
    db.commit()
    return response


@router.post("/logout")
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored and not stored.revoked_at:
        stored.revoked_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
    return {"message": "Logged out"}


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user