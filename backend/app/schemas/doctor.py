from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.specialization import SpecializationResponse


class _DoctorProfileFields(BaseModel):
    specialization_id: int = Field(ge=1)
    qualification: str = Field(min_length=1, max_length=255)
    experience_years: int = Field(ge=0)
    bio: str | None = Field(default=None, max_length=10000)
    location: str | None = Field(default=None, max_length=255)
    consultation_fee: Decimal = Field(ge=0, max_digits=10, decimal_places=2)

    @field_validator("qualification")
    @classmethod
    def qualification_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Qualification cannot be blank.")
        return value

    @field_validator("bio", "location")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class DoctorProfileCreate(_DoctorProfileFields):
    model_config = ConfigDict(extra="forbid")


class DoctorProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    specialization_id: int | None = Field(default=None, ge=1)
    qualification: str | None = Field(default=None, min_length=1, max_length=255)
    experience_years: int | None = Field(default=None, ge=0)
    bio: str | None = Field(default=None, max_length=10000)
    location: str | None = Field(default=None, max_length=255)
    consultation_fee: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)

    @field_validator("qualification")
    @classmethod
    def qualification_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Qualification cannot be blank.")
        return value

    @field_validator("bio", "location")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class DoctorUserDisplay(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str


class DoctorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user: DoctorUserDisplay
    specialization: SpecializationResponse
    qualification: str
    experience_years: int
    bio: str | None
    location: str | None
    consultation_fee: Decimal
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class DoctorListResponse(BaseModel):
    items: list[DoctorResponse]
    total: int
    page: int
    page_size: int


class DoctorVerificationUpdate(BaseModel):
    is_verified: bool
