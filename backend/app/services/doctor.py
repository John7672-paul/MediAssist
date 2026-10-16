from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.doctor import Doctor
from app.models.specialization import Specialization
from app.schemas.doctor import DoctorProfileCreate, DoctorProfileUpdate


def _profile_statement():
    return select(Doctor).options(joinedload(Doctor.user), joinedload(Doctor.specialization))


def get_doctor(db: Session, doctor_id: int) -> Doctor | None:
    return db.scalar(_profile_statement().where(Doctor.id == doctor_id))


def get_doctor_for_user(db: Session, user_id: int) -> Doctor | None:
    return db.scalar(_profile_statement().where(Doctor.user_id == user_id))


def create_profile(db: Session, user_id: int, payload: DoctorProfileCreate) -> Doctor:
    doctor = Doctor(user_id=user_id, **payload.model_dump())
    db.add(doctor)
    db.commit()
    return get_doctor(db, doctor.id)  # type: ignore[return-value]


def update_profile(db: Session, doctor: Doctor, payload: DoctorProfileUpdate) -> Doctor:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)
    db.commit()
    return get_doctor(db, doctor.id)  # type: ignore[return-value]


def list_doctors(
    db: Session,
    *,
    specialization_id: int | None,
    location: str | None,
    search: str | None,
    is_verified: bool | None,
    page: int,
    page_size: int,
) -> tuple[list[Doctor], int]:
    filters = []
    if specialization_id is not None:
        filters.append(Doctor.specialization_id == specialization_id)
    if location:
        filters.append(Doctor.location.ilike(f"%{location.strip()}%"))
    if is_verified is not None:
        filters.append(Doctor.is_verified == is_verified)
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(or_(Doctor.qualification.ilike(pattern), Doctor.bio.ilike(pattern), Doctor.location.ilike(pattern), Specialization.name.ilike(pattern)))

    statement = _profile_statement().join(Doctor.specialization)
    count_statement = select(func.count()).select_from(Doctor).join(Doctor.specialization)
    if filters:
        statement = statement.where(*filters)
        count_statement = count_statement.where(*filters)
    statement = statement.order_by(Doctor.id).offset((page - 1) * page_size).limit(page_size)
    return list(db.scalars(statement).unique().all()), db.scalar(count_statement) or 0


def update_verification(db: Session, doctor: Doctor, is_verified: bool) -> Doctor:
    doctor.is_verified = is_verified
    db.commit()
    return get_doctor(db, doctor.id)  # type: ignore[return-value]
