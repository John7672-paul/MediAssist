from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.database.session import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.specialization import Specialization
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentListResponse, AppointmentResponse
from app.schemas.patient import PatientResponse
from app.services import appointment as appointment_service

router = APIRouter(tags=["admin"])
DbSession = Annotated[Session, Depends(get_db)]
AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


@router.get("/analytics")
def get_analytics(_admin: AdminUser, db: DbSession) -> dict:
    """Return aggregated platform statistics for the admin dashboard."""
    total_patients = db.scalar(select(func.count(Patient.id))) or 0
    total_doctors = db.scalar(select(func.count(Doctor.id))) or 0
    verified_doctors = db.scalar(select(func.count(Doctor.id)).where(Doctor.is_verified == True)) or 0
    total_appointments = db.scalar(select(func.count(Appointment.id))) or 0
    pending = db.scalar(select(func.count(Appointment.id)).where(Appointment.status == AppointmentStatus.PENDING)) or 0
    confirmed = db.scalar(select(func.count(Appointment.id)).where(Appointment.status == AppointmentStatus.CONFIRMED)) or 0
    completed = db.scalar(select(func.count(Appointment.id)).where(Appointment.status == AppointmentStatus.COMPLETED)) or 0
    cancelled = db.scalar(select(func.count(Appointment.id)).where(Appointment.status == AppointmentStatus.CANCELLED)) or 0
    total_specializations = db.scalar(select(func.count(Specialization.id))) or 0

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "verified_doctors": verified_doctors,
        "unverified_doctors": total_doctors - verified_doctors,
        "total_appointments": total_appointments,
        "appointments_by_status": {
            "PENDING": pending,
            "CONFIRMED": confirmed,
            "COMPLETED": completed,
            "CANCELLED": cancelled,
        },
        "total_specializations": total_specializations,
    }


@router.get("/patients")
def list_all_patients(
    _admin: AdminUser,
    db: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict:
    """List all patients with their user info."""
    from sqlalchemy.orm import joinedload
    stmt = (
        select(Patient)
        .options(joinedload(Patient.user))
        .order_by(Patient.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(db.scalars(stmt).unique().all())
    total = db.scalar(select(func.count(Patient.id))) or 0
    return {
        "items": [
            {
                "id": p.id,
                "user_id": p.user_id,
                "full_name": p.user.full_name,
                "email": p.user.email,
                "phone": p.user.phone,
                "gender": p.gender,
                "date_of_birth": str(p.date_of_birth) if p.date_of_birth else None,
                "is_active": p.user.is_active,
                "created_at": p.created_at.isoformat(),
            }
            for p in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/appointments", response_model=AppointmentListResponse)
def list_all_admin_appointments(
    _admin: AdminUser,
    db: DbSession,
    appt_status: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
) -> AppointmentListResponse:
    """List all appointments across the platform."""
    items, total = appointment_service.list_all_appointments(db, appt_status, page, page_size)
    return AppointmentListResponse(items=items, total=total, page=page, page_size=page_size)
