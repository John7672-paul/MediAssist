from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.database.session import get_db
from app.models.appointment import AppointmentStatus
from app.models.doctor import Doctor
from app.models.notification import NotificationType
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentListResponse,
    AppointmentReschedule,
    AppointmentResponse,
    AppointmentStatusUpdate,
)
from app.services import appointment as appointment_service
from app.services import notification as notification_service

router = APIRouter(tags=["appointments"])
DbSession = Annotated[Session, Depends(get_db)]
PatientUser = Annotated[User, Depends(require_role(UserRole.PATIENT))]
DoctorUser = Annotated[User, Depends(require_role(UserRole.DOCTOR))]
AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


def _get_patient_or_404(db: Session, user_id: int) -> Patient:
    patient = db.scalar(select(Patient).where(Patient.user_id == user_id))
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found. Please create your patient profile first.",
        )
    return patient


def _get_doctor_or_404(db: Session, user_id: int) -> Doctor:
    doctor = db.scalar(select(Doctor).where(Doctor.user_id == user_id))
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found.")
    return doctor


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(payload: AppointmentCreate, current_user: PatientUser, db: DbSession):
    """Book a new appointment. Validates doctor, prevents double-booking."""
    patient = _get_patient_or_404(db, current_user.id)
    try:
        appointment = appointment_service.create_appointment(db, patient.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    # Create notifications for patient and doctor
    doctor = db.scalar(select(Doctor).where(Doctor.id == payload.doctor_id))
    if doctor:
        doctor_user_id = doctor.user_id
        notification_service.create_notification(
            db,
            current_user.id,
            "Appointment Booked",
            f"Your appointment on {payload.appointment_date} at {payload.start_time} has been booked successfully.",
            NotificationType.APPOINTMENT_CONFIRMED,
        )
        notification_service.create_notification(
            db,
            doctor_user_id,
            "New Appointment Request",
            f"A new appointment has been booked for {payload.appointment_date} at {payload.start_time}.",
            NotificationType.APPOINTMENT_CONFIRMED,
        )
    return appointment


@router.get("", response_model=AppointmentListResponse)
def list_appointments(
    current_user: CurrentUser,
    db: DbSession,
    appt_status: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List appointments. Role determines what is returned."""
    if current_user.role == UserRole.PATIENT:
        patient = _get_patient_or_404(db, current_user.id)
        items, total = appointment_service.list_appointments_for_patient(db, patient.id, appt_status, page, page_size)
    elif current_user.role == UserRole.DOCTOR:
        doctor = _get_doctor_or_404(db, current_user.id)
        items, total = appointment_service.list_appointments_for_doctor(db, doctor.id, appt_status, page, page_size)
    else:  # ADMIN
        items, total = appointment_service.list_all_appointments(db, appt_status, page, page_size)
    return AppointmentListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, current_user: CurrentUser, db: DbSession):
    """Get a single appointment by ID (authorized parties only)."""
    appointment = appointment_service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    # Authorization check
    if current_user.role == UserRole.PATIENT:
        patient = db.scalar(select(Patient).where(Patient.user_id == current_user.id))
        if patient is None or appointment.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")
    elif current_user.role == UserRole.DOCTOR:
        doctor = db.scalar(select(Doctor).where(Doctor.user_id == current_user.id))
        if doctor is None or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")
    return appointment


@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(appointment_id: int, current_user: CurrentUser, db: DbSession):
    """Cancel an appointment."""
    appointment = appointment_service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    # Authorization
    if current_user.role == UserRole.PATIENT:
        patient = db.scalar(select(Patient).where(Patient.user_id == current_user.id))
        if patient is None or appointment.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")
    elif current_user.role == UserRole.DOCTOR:
        doctor = db.scalar(select(Doctor).where(Doctor.user_id == current_user.id))
        if doctor is None or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")

    try:
        updated = appointment_service.cancel_appointment(db, appointment)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Notify both parties
    patient_user_id = updated.patient.user_id
    doctor_user_id = updated.doctor.user_id
    for uid in {patient_user_id, doctor_user_id}:
        notification_service.create_notification(
            db, uid, "Appointment Cancelled",
            f"Appointment on {updated.appointment_date} has been cancelled.",
            NotificationType.APPOINTMENT_CANCELLED,
        )
    return updated


@router.patch("/{appointment_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment(
    appointment_id: int,
    payload: AppointmentReschedule,
    current_user: CurrentUser,
    db: DbSession,
):
    """Reschedule an appointment."""
    appointment = appointment_service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    if current_user.role == UserRole.PATIENT:
        patient = db.scalar(select(Patient).where(Patient.user_id == current_user.id))
        if patient is None or appointment.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")
    elif current_user.role == UserRole.DOCTOR:
        doctor = db.scalar(select(Doctor).where(Doctor.user_id == current_user.id))
        if doctor is None or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")

    try:
        updated = appointment_service.reschedule_appointment(db, appointment, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    patient_user_id = updated.patient.user_id
    doctor_user_id = updated.doctor.user_id
    for uid in {patient_user_id, doctor_user_id}:
        notification_service.create_notification(
            db, uid, "Appointment Rescheduled",
            f"Appointment rescheduled to {updated.appointment_date} at {updated.start_time}.",
            NotificationType.APPOINTMENT_RESCHEDULED,
        )
    return updated


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    """Update appointment status (doctor/admin only)."""
    if current_user.role == UserRole.PATIENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients cannot update appointment status directly.")

    appointment = appointment_service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    if current_user.role == UserRole.DOCTOR:
        doctor = db.scalar(select(Doctor).where(Doctor.user_id == current_user.id))
        if doctor is None or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your appointment.")

    return appointment_service.update_appointment_status(db, appointment, payload.status)
