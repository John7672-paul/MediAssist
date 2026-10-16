from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.availability import DayOfWeek


class AvailabilityCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(default=30, ge=15, le=60)

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        if self.slot_duration_minutes not in (15, 30, 45, 60):
            raise ValueError("slot_duration_minutes must be 15, 30, 45, or 60")
        return self


class AvailabilityUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day_of_week: DayOfWeek | None = None
    start_time: time | None = None
    end_time: time | None = None
    slot_duration_minutes: int | None = Field(default=None, ge=15, le=60)
    is_active: bool | None = None


class AvailabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    doctor_id: int
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    slot_duration_minutes: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AvailableSlotsResponse(BaseModel):
    doctor_id: int
    date: str
    slots: list[str]
