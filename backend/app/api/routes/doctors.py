from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.doctor import DoctorListResponse, DoctorProfileCreate, DoctorProfileUpdate, DoctorResponse, DoctorVerificationUpdate
from app.services import doctor as doctor_service
from app.services import specialization as specialization_service


router = APIRouter(tags=["doctors"])
DbSession = Annotated[Session, Depends(get_db)]
DoctorUser = Annotated[User, Depends(require_role(UserRole.DOCTOR))]
AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


def ensure_specialization_exists(db: Session, specialization_id: int) -> None:
    if specialization_service.get_specialization(db, specialization_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found.")


@router.get("", response_model=DoctorListResponse)
def read_doctors(
    _current_user: CurrentUser,
    db: DbSession,
    specialization_id: int | None = Query(default=None, ge=1),
    location: str | None = Query(default=None, max_length=255),
    search: str | None = Query(default=None, max_length=255),
    is_verified: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> DoctorListResponse:
    doctors, total = doctor_service.list_doctors(db, specialization_id=specialization_id, location=location, search=search, is_verified=is_verified, page=page, page_size=page_size)
    return DoctorListResponse(items=doctors, total=total, page=page, page_size=page_size)


@router.get("/me", response_model=DoctorResponse)
def read_my_profile(current_user: DoctorUser, db: DbSession):
    doctor = doctor_service.get_doctor_for_user(db, current_user.id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found.")
    return doctor


@router.post("/profile", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_my_profile(payload: DoctorProfileCreate, current_user: DoctorUser, db: DbSession):
    if doctor_service.get_doctor_for_user(db, current_user.id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A doctor profile already exists for this user.")
    ensure_specialization_exists(db, payload.specialization_id)
    return doctor_service.create_profile(db, current_user.id, payload)


@router.put("/profile", response_model=DoctorResponse)
def update_my_profile(payload: DoctorProfileUpdate, current_user: DoctorUser, db: DbSession):
    doctor = doctor_service.get_doctor_for_user(db, current_user.id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found.")
    if payload.specialization_id is not None:
        ensure_specialization_exists(db, payload.specialization_id)
    return doctor_service.update_profile(db, doctor, payload)


@router.patch("/{doctor_id}/verify", response_model=DoctorResponse)
def verify_doctor(doctor_id: int, payload: DoctorVerificationUpdate, db: DbSession, _admin: AdminUser):
    doctor = doctor_service.get_doctor(db, doctor_id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found.")
    return doctor_service.update_verification(db, doctor, payload.is_verified)


@router.get("/{doctor_id}", response_model=DoctorResponse)
def read_doctor(doctor_id: int, _current_user: CurrentUser, db: DbSession):
    doctor = doctor_service.get_doctor(db, doctor_id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found.")
    return doctor
