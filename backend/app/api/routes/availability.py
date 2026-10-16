from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.database.session import get_db
from app.models.doctor import Doctor
from app.models.user import User, UserRole
from app.schemas.availability import (
    AvailabilityCreate,
    AvailabilityResponse,
    AvailabilityUpdate,
    AvailableSlotsResponse,
)
from app.services import availability as availability_service

router = APIRouter(tags=["availability"])
DbSession = Annotated[Session, Depends(get_db)]
DoctorUser = Annotated[User, Depends(require_role(UserRole.DOCTOR))]


def _resolve_doctor_id(db: Session, doctor_id_param: int, current_user: User) -> int:
    """If doctor_id == 0, resolve to the current doctor's profile id. Otherwise validate access."""
    if current_user.role == UserRole.DOCTOR:
        my_doctor = db.scalar(select(Doctor).where(Doctor.user_id == current_user.id))
        if my_doctor is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found.")
        if my_doctor.id != doctor_id_param:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot manage another doctor's availability.")
        return my_doctor.id
    return doctor_id_param  # ADMIN can manage any doctor


@router.get("/doctors/{doctor_id}/availability", response_model=list[AvailabilityResponse])
def list_availability(doctor_id: int, _current_user: CurrentUser, db: DbSession):
    """List all availability slots for a doctor."""
    return availability_service.get_availability_for_doctor(db, doctor_id)


@router.post(
    "/doctors/{doctor_id}/availability",
    response_model=AvailabilityResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_availability(doctor_id: int, payload: AvailabilityCreate, current_user: DoctorUser, db: DbSession):
    """Add a new availability slot (doctor only, for their own profile)."""
    resolved_id = _resolve_doctor_id(db, doctor_id, current_user)
    try:
        return availability_service.create_availability(db, resolved_id, payload)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.put("/doctors/{doctor_id}/availability/{avail_id}", response_model=AvailabilityResponse)
def update_availability(
    doctor_id: int, avail_id: int, payload: AvailabilityUpdate, current_user: DoctorUser, db: DbSession
):
    """Update an availability slot."""
    _resolve_doctor_id(db, doctor_id, current_user)
    avail = availability_service.get_availability(db, avail_id)
    if avail is None or avail.doctor_id != doctor_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found.")
    return availability_service.update_availability(db, avail, payload)


@router.delete("/doctors/{doctor_id}/availability/{avail_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    doctor_id: int, avail_id: int, current_user: DoctorUser, db: DbSession
) -> Response:
    """Delete an availability slot."""
    _resolve_doctor_id(db, doctor_id, current_user)
    avail = availability_service.get_availability(db, avail_id)
    if avail is None or avail.doctor_id != doctor_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found.")
    availability_service.delete_availability(db, avail)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/doctors/{doctor_id}/available-slots", response_model=AvailableSlotsResponse)
def get_available_slots(
    doctor_id: int,
    _current_user: CurrentUser,
    db: DbSession,
    query_date: date = Query(..., alias="date", description="Date in YYYY-MM-DD format"),
):
    """Get list of available time slots for a doctor on a specific date."""
    slots = availability_service.get_available_slots(db, doctor_id, query_date)
    return AvailableSlotsResponse(
        doctor_id=doctor_id,
        date=str(query_date),
        slots=slots,
    )
