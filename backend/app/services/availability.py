from datetime import date, datetime, time, timedelta

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus
from app.models.availability import Availability, DayOfWeek
from app.schemas.availability import AvailabilityCreate, AvailabilityUpdate

_DAY_MAP = {
    "Monday": DayOfWeek.MONDAY,
    "Tuesday": DayOfWeek.TUESDAY,
    "Wednesday": DayOfWeek.WEDNESDAY,
    "Thursday": DayOfWeek.THURSDAY,
    "Friday": DayOfWeek.FRIDAY,
    "Saturday": DayOfWeek.SATURDAY,
    "Sunday": DayOfWeek.SUNDAY,
}


def get_availability_for_doctor(db: Session, doctor_id: int) -> list[Availability]:
    return list(
        db.scalars(
            select(Availability)
            .where(Availability.doctor_id == doctor_id, Availability.is_active == True)
            .order_by(Availability.day_of_week, Availability.start_time)
        ).all()
    )


def get_availability(db: Session, avail_id: int) -> Availability | None:
    return db.get(Availability, avail_id)


def create_availability(db: Session, doctor_id: int, payload: AvailabilityCreate) -> Availability:
    avail = Availability(doctor_id=doctor_id, **payload.model_dump())
    db.add(avail)
    db.commit()
    db.refresh(avail)
    return avail


def update_availability(db: Session, avail: Availability, payload: AvailabilityUpdate) -> Availability:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(avail, field, value)
    db.commit()
    db.refresh(avail)
    return avail


def delete_availability(db: Session, avail: Availability) -> None:
    db.delete(avail)
    db.commit()


def get_available_slots(db: Session, doctor_id: int, target_date: date) -> list[str]:
    """Return list of available HH:MM time slot strings for the given doctor and date."""
    day_name = target_date.strftime("%A")
    day_enum = _DAY_MAP.get(day_name)
    if day_enum is None:
        return []

    avail_rows = list(
        db.scalars(
            select(Availability).where(
                Availability.doctor_id == doctor_id,
                Availability.day_of_week == day_enum,
                Availability.is_active == True,
            )
        ).all()
    )
    if not avail_rows:
        return []

    # Fetch already-booked slots for that day
    booked = list(
        db.scalars(
            select(Appointment).where(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_date == target_date,
                Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED]),
            )
        ).all()
    )

    slots: list[str] = []
    for row in avail_rows:
        cursor = datetime.combine(target_date, row.start_time)
        end_dt = datetime.combine(target_date, row.end_time)
        slot_dur = timedelta(minutes=row.slot_duration_minutes)

        while cursor + slot_dur <= end_dt:
            slot_start = cursor.time()
            slot_end = (cursor + slot_dur).time()
            # Check if this slot overlaps with a booked appointment
            overlaps = any(
                b.start_time < slot_end and b.end_time > slot_start for b in booked
            )
            if not overlaps:
                slots.append(cursor.strftime("%H:%M"))
            cursor += slot_dur

    return slots
