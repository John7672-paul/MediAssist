"""Import all ORM models so SQLAlchemy can register their tables."""

from app.models.ai import AIConversation, AIMessage, AIMessageRole
from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.availability import Availability, DayOfWeek
from app.models.doctor import Doctor
from app.models.notification import Notification, NotificationType
from app.models.patient import Patient
from app.models.specialization import Specialization
from app.models.user import User, UserRole

__all__ = [
    "AIConversation",
    "AIMessage",
    "AIMessageRole",
    "Appointment",
    "AppointmentStatus",
    "AppointmentType",
    "Availability",
    "DayOfWeek",
    "Doctor",
    "Notification",
    "NotificationType",
    "Patient",
    "Specialization",
    "User",
    "UserRole",
]
