from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.patient import PatientProfileCreate, PatientProfileUpdate, PatientResponse
from app.services import patient as patient_service

router = APIRouter(tags=["patients"])
DbSession = Annotated[Session, Depends(get_db)]
PatientUser = Annotated[User, Depends(require_role(UserRole.PATIENT))]


@router.get("/me", response_model=PatientResponse)
def read_my_patient_profile(current_user: PatientUser, db: DbSession):
    """Get the current patient's profile."""
    patient = patient_service.get_patient_for_user(db, current_user.id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found. Please create one first.")
    return patient


@router.post("/profile", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_my_patient_profile(payload: PatientProfileCreate, current_user: PatientUser, db: DbSession):
    """Create the current patient's profile (run once after registration)."""
    existing = patient_service.get_patient_for_user(db, current_user.id)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Patient profile already exists.")
    return patient_service.create_patient_profile(db, current_user.id, payload)


@router.put("/me", response_model=PatientResponse)
def update_my_patient_profile(payload: PatientProfileUpdate, current_user: PatientUser, db: DbSession):
    """Update the current patient's profile."""
    patient = patient_service.get_patient_for_user(db, current_user.id)
    if patient is None:
        # Auto-create if missing
        from app.schemas.patient import PatientProfileCreate
        create_payload = PatientProfileCreate(**payload.model_dump(exclude_unset=True))
        return patient_service.create_patient_profile(db, current_user.id, create_payload)
    return patient_service.update_patient_profile(db, patient, payload)
