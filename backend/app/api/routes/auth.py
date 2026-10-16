from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import Token, UserLogin, UserRegister, UserResponse
from app.services.auth import (
    authenticate_user,
    create_access_token,
    hash_password,
    is_public_registration_role,
)


router = APIRouter(tags=["authentication"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: DbSession) -> User:
    """Create a PATIENT or DOCTOR account with an Argon2 password hash."""
    if not is_public_registration_role(payload.role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Public ADMIN registration is not allowed.")

    existing_user = db.scalar(select(User).where(User.email == str(payload.email)))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    user = User(
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: DbSession) -> Token:
    """Authenticate a user and return a short-lived bearer token."""
    user = authenticate_user(db, str(payload.email), payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        access_token, expires_in = create_access_token(user)
    except RuntimeError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)) from error
    return Token(access_token=access_token, expires_in=expires_in)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: CurrentUser) -> User:
    return current_user


# Temporary Phase 4C endpoints for checking authorization only.
@router.get("/test/patient")
def patient_test_endpoint(
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
) -> dict[str, str]:
    return {"message": f"Patient authorization verified for {current_user.email}"}


@router.get("/test/doctor")
def doctor_test_endpoint(
    current_user: Annotated[User, Depends(require_role(UserRole.DOCTOR))],
) -> dict[str, str]:
    return {"message": f"Doctor authorization verified for {current_user.email}"}


@router.get("/test/admin")
def admin_test_endpoint(
    current_user: Annotated[User, Depends(require_role(UserRole.ADMIN))],
) -> dict[str, str]:
    return {"message": f"Admin authorization verified for {current_user.email}"}
