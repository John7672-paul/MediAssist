from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.appointment import AppointmentStatus, AppointmentType
from app.schemas.doctor import DoctorResponse
from app.schemas.patient import PatientResponse


class AppointmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    doctor_id: int = Field(ge=1)
    appointment_date: date
    start_time: time
    end_time: time
    appointment_type: AppointmentType
    patient_note: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class AppointmentReschedule(BaseModel):
    model_config = ConfigDict(extra="forbid")
    appointment_date: date
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentPatientDisplay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    date_of_birth: date | None
    gender: str | None


class AppointmentDoctorDisplay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    qualification: str
    location: str | None
    consultation_fee: float


class AppointmentUserDisplay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    phone: str | None


class AppointmentPatientFull(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user: AppointmentUserDisplay


class AppointmentDoctorFull(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user: AppointmentUserDisplay
    qualification: str
    location: str | None
    consultation_fee: float


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    patient: AppointmentPatientFull
    doctor: AppointmentDoctorFull
    appointment_date: date
    start_time: time
    end_time: time
    appointment_type: AppointmentType
    status: AppointmentStatus
    patient_note: str | None
    created_at: datetime
    updated_at: datetime


class AppointmentListResponse(BaseModel):
    items: list[AppointmentResponse]
    total: int
    page: int
    page_size: int
