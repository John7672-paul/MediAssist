from datetime import date, time
from decimal import Decimal

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

import app.models  # noqa: F401  # Registers all models before creating test tables.
from app.database.session import Base
from app.models.ai import AIConversation, AIMessage, AIMessageRole
from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.availability import Availability, DayOfWeek
from app.models.doctor import Doctor
from app.models.notification import Notification, NotificationType
from app.models.patient import Patient
from app.models.specialization import Specialization
from app.models.user import User, UserRole


@pytest.fixture
def db_session() -> Session:
    """Use an isolated SQLite database; no configured PostgreSQL data is touched."""
    engine = create_engine("sqlite+pysqlite:///:memory:")

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_all_core_model_relationships(db_session: Session) -> None:
    patient_user = User(
        email="patient@example.com",
        password_hash="hashed-password",
        full_name="Pat Patient",
        role=UserRole.PATIENT,
    )
    doctor_user = User(
        email="doctor@example.com",
        password_hash="hashed-password",
        full_name="Dr. Doe",
        role=UserRole.DOCTOR,
    )
    specialization = Specialization(name="Cardiology", description="Heart care")
    patient = Patient(user=patient_user, date_of_birth=date(1995, 1, 1), gender="Female")
    doctor = Doctor(
        user=doctor_user,
        specialization=specialization,
        qualification="MD Cardiology",
        experience_years=8,
        location="Pune",
        consultation_fee=Decimal("750.00"),
    )
    availability = Availability(
        doctor=doctor,
        day_of_week=DayOfWeek.MONDAY,
        start_time=time(9, 0),
        end_time=time(12, 0),
        slot_duration_minutes=30,
    )
    appointment = Appointment(
        patient=patient,
        doctor=doctor,
        appointment_date=date(2026, 9, 1),
        start_time=time(10, 0),
        end_time=time(10, 30),
        appointment_type=AppointmentType.IN_PERSON,
    )
    notification = Notification(
        user=patient_user,
        title="Appointment requested",
        message="Your appointment request was received.",
        notification_type=NotificationType.SYSTEM,
    )
    conversation = AIConversation(user=patient_user, title="Symptoms")
    message = AIMessage(
        conversation=conversation,
        role=AIMessageRole.USER,
        content="I have a headache.",
    )

    db_session.add_all([patient, doctor, availability, appointment, notification, conversation, message])
    db_session.commit()

    assert patient.user is patient_user
    assert doctor.user is doctor_user
    assert doctor.specialization is specialization
    assert specialization.doctors == [doctor]
    assert doctor.availability == [availability]
    assert patient.appointments == [appointment]
    assert doctor.appointments == [appointment]
    assert patient_user.notifications == [notification]
    assert patient_user.ai_conversations == [conversation]
    assert conversation.messages == [message]
    assert appointment.status is AppointmentStatus.PENDING


def test_unique_user_email_constraint(db_session: Session) -> None:
    db_session.add_all(
        [
            User(email="duplicate@example.com", password_hash="hash-one", full_name="First", role=UserRole.PATIENT),
            User(email="duplicate@example.com", password_hash="hash-two", full_name="Second", role=UserRole.DOCTOR),
        ]
    )

    with pytest.raises(IntegrityError):
        db_session.commit()


@pytest.mark.parametrize(
    ("start_time", "end_time", "slot_duration"),
    [(time(10, 0), time(9, 0), 30), (time(9, 0), time(10, 0), 20)],
)
def test_availability_constraints(db_session: Session, start_time: time, end_time: time, slot_duration: int) -> None:
    doctor_user = User(email="availability@example.com", password_hash="hash", full_name="Doctor", role=UserRole.DOCTOR)
    specialization = Specialization(name="Dermatology")
    doctor = Doctor(
        user=doctor_user,
        specialization=specialization,
        qualification="MBBS",
        experience_years=1,
        consultation_fee=Decimal("500.00"),
    )
    db_session.add(doctor)
    db_session.flush()
    db_session.add(
        Availability(
            doctor=doctor,
            day_of_week=DayOfWeek.MONDAY,
            start_time=start_time,
            end_time=end_time,
            slot_duration_minutes=slot_duration,
        )
    )

    with pytest.raises(IntegrityError):
        db_session.commit()
