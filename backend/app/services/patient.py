from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.schemas.patient import PatientProfileCreate, PatientProfileUpdate


def get_patient_for_user(db: Session, user_id: int) -> Patient | None:
    return db.scalar(select(Patient).where(Patient.user_id == user_id))


def create_patient_profile(db: Session, user_id: int, payload: PatientProfileCreate) -> Patient:
    patient = Patient(user_id=user_id, **payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def update_patient_profile(db: Session, patient: Patient, payload: PatientProfileUpdate) -> Patient:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient
