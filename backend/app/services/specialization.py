from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.specialization import Specialization
from app.schemas.specialization import SpecializationCreate, SpecializationUpdate


def list_specializations(db: Session) -> list[Specialization]:
    return list(db.scalars(select(Specialization).order_by(Specialization.name)).all())


def get_specialization(db: Session, specialization_id: int) -> Specialization | None:
    return db.get(Specialization, specialization_id)


def specialization_name_exists(db: Session, name: str, exclude_id: int | None = None) -> bool:
    statement = select(Specialization.id).where(Specialization.name == name)
    if exclude_id is not None:
        statement = statement.where(Specialization.id != exclude_id)
    return db.scalar(statement) is not None


def create_specialization(db: Session, payload: SpecializationCreate) -> Specialization:
    specialization = Specialization(name=payload.name, description=payload.description)
    db.add(specialization)
    db.commit()
    db.refresh(specialization)
    return specialization


def update_specialization(db: Session, specialization: Specialization, payload: SpecializationUpdate) -> Specialization:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(specialization, field, value)
    db.commit()
    db.refresh(specialization)
    return specialization


def specialization_is_in_use(db: Session, specialization_id: int) -> bool:
    return db.scalar(select(Doctor.id).where(Doctor.specialization_id == specialization_id)) is not None


def delete_specialization(db: Session, specialization: Specialization) -> None:
    db.delete(specialization)
    db.commit()
