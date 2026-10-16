from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PatientProfileCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=50)


class PatientProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=50)


class PatientUserDisplay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    phone: str | None


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user: PatientUserDisplay
    date_of_birth: date | None
    gender: str | None
    created_at: datetime
    updated_at: datetime
