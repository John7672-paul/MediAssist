from datetime import date, time, timedelta, datetime as dt

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate, AppointmentReschedule


def _stmt_with_relations():
    return select(Appointment).options(
        joinedload(Appointment.patient).joinedload(Patient.user),
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
    )


def get_appointment(db: Session, appointment_id: int) -> Appointment | None:
    return db.scalar(_stmt_with_relations().where(Appointment.id == appointment_id))


def _count(db: Session, *filters) -> int:
    stmt = select(func.count(Appointment.id))
    if filters:
        stmt = stmt.where(*filters)
    return db.scalar(stmt) or 0


def list_appointments_for_patient(
    db: Session, patient_id: int, status: str | None = None, page: int = 1, page_size: int = 20
) -> tuple[list[Appointment], int]:
    filters = [Appointment.patient_id == patient_id]
    if status:
        filters.append(Appointment.status == status)
    total = _count(db, *filters)
    stmt = (
        _stmt_with_relations()
        .where(*filters)
        .order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(db.scalars(stmt).unique().all())
    return items, total


def list_appointments_for_doctor(
    db: Session, doctor_id: int, status: str | None = None, page: int = 1, page_size: int = 20
) -> tuple[list[Appointment], int]:
    filters = [Appointment.doctor_id == doctor_id]
    if status:
        filters.append(Appointment.status == status)
    total = _count(db, *filters)
    stmt = (
        _stmt_with_relations()
        .where(*filters)
        .order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(db.scalars(stmt).unique().all())
    return items, total


def list_all_appointments(
    db: Session, status: str | None = None, page: int = 1, page_size: int = 50
) -> tuple[list[Appointment], int]:
    filters = []
    if status:
        filters.append(Appointment.status == status)
    total = _count(db, *filters)
    stmt = _stmt_with_relations()
    if filters:
        stmt = stmt.where(*filters)
    stmt = stmt.order_by(Appointment.appointment_date.desc()).offset((page - 1) * page_size).limit(page_size)
    items = list(db.scalars(stmt).unique().all())
    return items, total


def _is_double_booked(
    db: Session, doctor_id: int, appt_date: date, start: time, end: time, exclude_id: int | None = None
) -> bool:
    """Return True if the doctor already has an overlapping PENDING/CONFIRMED/RESCHEDULED appointment."""
    filters = [
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appt_date,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED]),
        Appointment.start_time < end,
        Appointment.end_time > start,
    ]
    if exclude_id is not None:
        filters.append(Appointment.id != exclude_id)
    return db.scalar(select(Appointment.id).where(*filters)) is not None


def create_appointment(db: Session, patient_id: int, payload: AppointmentCreate) -> Appointment:
    """Book an appointment after validating doctor and availability, preventing double booking."""
    doctor = db.scalar(select(Doctor).where(Doctor.id == payload.doctor_id))
    if doctor is None:
        raise ValueError("Doctor not found.")
    if not doctor.is_verified:
        raise ValueError("This doctor is not yet verified and cannot accept appointments.")

    start = payload.start_time
    end = payload.end_time
    if end <= start:
        raise ValueError("End time must be after start time.")
    if payload.appointment_date < date.today():
        raise ValueError("Cannot book appointments in the past.")

    # Double-booking guard
    if _is_double_booked(db, payload.doctor_id, payload.appointment_date, start, end):
        raise ValueError("This time slot is already booked. Please choose another slot.")

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=payload.doctor_id,
        appointment_date=payload.appointment_date,
        start_time=start,
        end_time=end,
        appointment_type=payload.appointment_type,
        patient_note=payload.patient_note,
        status=AppointmentStatus.PENDING,
    )
    db.add(appointment)
    db.commit()
    return get_appointment(db, appointment.id)  # type: ignore[return-value]


def cancel_appointment(db: Session, appointment: Appointment) -> Appointment:
    if appointment.status in (AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED):
        raise ValueError(f"Cannot cancel an appointment with status '{appointment.status.value}'.")
    appointment.status = AppointmentStatus.CANCELLED
    db.commit()
    return get_appointment(db, appointment.id)  # type: ignore[return-value]


def reschedule_appointment(
    db: Session, appointment: Appointment, payload: AppointmentReschedule
) -> Appointment:
    if appointment.status in (AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED):
        raise ValueError(f"Cannot reschedule an appointment with status '{appointment.status.value}'.")

    new_date = payload.appointment_date
    new_start = payload.start_time
    new_end = payload.end_time
    if new_end <= new_start:
        raise ValueError("End time must be after start time.")
    if new_date < date.today():
        raise ValueError("Cannot reschedule to a past date.")

    if _is_double_booked(db, appointment.doctor_id, new_date, new_start, new_end, exclude_id=appointment.id):
        raise ValueError("The requested new slot is already booked. Please choose another slot.")

    appointment.appointment_date = new_date
    appointment.start_time = new_start
    appointment.end_time = new_end
    appointment.status = AppointmentStatus.RESCHEDULED
    db.commit()
    return get_appointment(db, appointment.id)  # type: ignore[return-value]


def update_appointment_status(db: Session, appointment: Appointment, new_status: AppointmentStatus) -> Appointment:
    appointment.status = new_status
    db.commit()
    return get_appointment(db, appointment.id)  # type: ignore[return-value]
