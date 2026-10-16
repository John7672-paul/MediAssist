from datetime import date, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.api.deps import get_db
from app.core.config import get_settings
from app.database.session import Base
from app.main import app
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.specialization import Specialization
from app.models.user import User, UserRole
from app.services.auth import hash_password


@pytest.fixture
def client_and_db(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-32-chars-long-strictly")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    get_settings.cache_clear()

    engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)

    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client, session_factory
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()
    get_settings.cache_clear()


def token_for(client: TestClient, email: str, password: str = "secure-pass-123") -> str:
    return client.post("/api/auth/login", json={"email": email, "password": password}).json()["access_token"]


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def setup_users(client: TestClient, session_factory):
    # Admin
    with session_factory() as db:
        admin = User(email="admin@test.com", password_hash=hash_password("secure-pass-123"), full_name="Admin User", role=UserRole.ADMIN)
        db.add(admin)
        db.commit()

    # Doctor 1 & Doctor 2
    client.post("/api/auth/register", json={"full_name": "Dr. House", "email": "house@test.com", "password": "secure-pass-123", "role": "DOCTOR"})
    client.post("/api/auth/register", json={"full_name": "Dr. Wilson", "email": "wilson@test.com", "password": "secure-pass-123", "role": "DOCTOR"})

    # Patient 1 & Patient 2
    client.post("/api/auth/register", json={"full_name": "John Patient", "email": "patient1@test.com", "password": "secure-pass-123", "role": "PATIENT"})
    client.post("/api/auth/register", json={"full_name": "Jane Patient", "email": "patient2@test.com", "password": "secure-pass-123", "role": "PATIENT"})

    admin_token = token_for(client, "admin@test.com")
    doc1_token = token_for(client, "house@test.com")
    pat1_token = token_for(client, "patient1@test.com")
    pat2_token = token_for(client, "patient2@test.com")

    # Create Specialization
    spec_res = client.post("/api/specializations", json={"name": "Cardiology", "description": "Heart care"}, headers=bearer(admin_token))
    spec_id = spec_res.json()["id"]

    # Doctor Profile
    doc_res = client.post("/api/doctors/profile", json={
        "specialization_id": spec_id,
        "qualification": "MBBS, MD",
        "experience_years": 10,
        "location": "New York",
        "consultation_fee": 150.0
    }, headers=bearer(doc1_token))
    doctor_id = doc_res.json()["id"]

    # Verify Doctor
    client.patch(f"/api/doctors/{doctor_id}/verify", json={"is_verified": True}, headers=bearer(admin_token))

    # Patient 1 Profile
    client.post("/api/patients/profile", json={"gender": "Male", "date_of_birth": "1990-05-15"}, headers=bearer(pat1_token))
    # Patient 2 Profile
    client.post("/api/patients/profile", json={"gender": "Female", "date_of_birth": "1995-08-20"}, headers=bearer(pat2_token))

    return {
        "admin_token": admin_token,
        "doc1_token": doc1_token,
        "pat1_token": pat1_token,
        "pat2_token": pat2_token,
        "doctor_id": doctor_id,
        "spec_id": spec_id,
    }


def test_patient_profile_crud(client_and_db):
    client, session_factory = client_and_db
    env = setup_users(client, session_factory)

    # Read my profile
    res = client.get("/api/patients/me", headers=bearer(env["pat1_token"]))
    assert res.status_code == 200
    assert res.json()["gender"] == "Male"
    assert res.json()["user"]["full_name"] == "John Patient"

    # Update profile
    res2 = client.put("/api/patients/me", json={"gender": "Other"}, headers=bearer(env["pat1_token"]))
    assert res2.status_code == 200
    assert res2.json()["gender"] == "Other"


def test_doctor_availability_and_slots(client_and_db):
    client, session_factory = client_and_db
    env = setup_users(client, session_factory)
    doc_token = env["doc1_token"]
    doctor_id = env["doctor_id"]

    # Add Availability (Monday 09:00 - 11:00, 30 min slots)
    avail_res = client.post(f"/api/doctors/{doctor_id}/availability", json={
        "day_of_week": "MONDAY",
        "start_time": "09:00:00",
        "end_time": "11:00:00",
        "slot_duration_minutes": 30
    }, headers=bearer(doc_token))
    assert avail_res.status_code == 201
    avail_id = avail_res.json()["id"]

    # List availability
    list_res = client.get(f"/api/doctors/{doctor_id}/availability", headers=bearer(doc_token))
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Find the next Monday
    today = date.today()
    days_ahead = 0 - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    next_monday = today + timedelta(days=days_ahead)

    # Query computed available slots for that Monday
    slots_res = client.get(f"/api/doctors/{doctor_id}/available-slots?date={next_monday.isoformat()}", headers=bearer(doc_token))
    assert slots_res.status_code == 200
    slots = slots_res.json()["slots"]
    assert "09:00" in slots
    assert "09:30" in slots
    assert "10:00" in slots
    assert "10:30" in slots


def test_appointment_booking_double_booking_and_lifecycle(client_and_db):
    client, session_factory = client_and_db
    env = setup_users(client, session_factory)
    pat1_token = env["pat1_token"]
    pat2_token = env["pat2_token"]
    doc_token = env["doc1_token"]
    doctor_id = env["doctor_id"]

    # Find a future date
    future_date = (date.today() + timedelta(days=5)).isoformat()

    # 1. Patient 1 Books appointment
    book_res = client.post("/api/appointments", json={
        "doctor_id": doctor_id,
        "appointment_date": future_date,
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "appointment_type": "IN_PERSON",
        "patient_note": "Need regular checkup"
    }, headers=bearer(pat1_token))
    assert book_res.status_code == 201
    appt = book_res.json()
    appt_id = appt["id"]
    assert appt["status"] == "PENDING"
    assert appt["doctor"]["qualification"] == "MBBS, MD"

    # 2. Patient 2 tries to book the EXACT SAME slot -> Must be rejected (Double booking prevention)
    dup_res = client.post("/api/appointments", json={
        "doctor_id": doctor_id,
        "appointment_date": future_date,
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "appointment_type": "ONLINE"
    }, headers=bearer(pat2_token))
    assert dup_res.status_code == 409
    assert "already booked" in dup_res.json()["detail"].lower()

    # 3. Patient 2 tries to book an OVERLAPPING slot (09:45 to 10:15) -> Must be rejected
    overlap_res = client.post("/api/appointments", json={
        "doctor_id": doctor_id,
        "appointment_date": future_date,
        "start_time": "09:45:00",
        "end_time": "10:15:00",
        "appointment_type": "ONLINE"
    }, headers=bearer(pat2_token))
    assert overlap_res.status_code == 409

    # 4. List appointments for Patient 1
    list_res = client.get("/api/appointments", headers=bearer(pat1_token))
    assert list_res.status_code == 200
    assert len(list_res.json()["items"]) == 1

    # 5. Doctor confirms appointment
    status_res = client.patch(f"/api/appointments/{appt_id}/status", json={"status": "CONFIRMED"}, headers=bearer(doc_token))
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "CONFIRMED"

    # 6. Patient 1 reschedules to an open slot
    resched_res = client.patch(f"/api/appointments/{appt_id}/reschedule", json={
        "appointment_date": future_date,
        "start_time": "11:00:00",
        "end_time": "11:30:00"
    }, headers=bearer(pat1_token))
    assert resched_res.status_code == 200
    assert resched_res.json()["status"] == "RESCHEDULED"

    # 7. Now the old slot (10:00 to 10:30) is free for Patient 2!
    pat2_book = client.post("/api/appointments", json={
        "doctor_id": doctor_id,
        "appointment_date": future_date,
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "appointment_type": "ONLINE"
    }, headers=bearer(pat2_token))
    assert pat2_book.status_code == 201

    # 8. Cancel appointment
    cancel_res = client.patch(f"/api/appointments/{appt_id}/cancel", headers=bearer(pat1_token))
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"


def test_notifications_lifecycle(client_and_db):
    client, session_factory = client_and_db
    env = setup_users(client, session_factory)
    pat1_token = env["pat1_token"]

    # List notifications (booking above creates a notification)
    future_date = (date.today() + timedelta(days=3)).isoformat()
    client.post("/api/appointments", json={
        "doctor_id": env["doctor_id"],
        "appointment_date": future_date,
        "start_time": "14:00:00",
        "end_time": "14:30:00",
        "appointment_type": "IN_PERSON"
    }, headers=bearer(pat1_token))

    notifs_res = client.get("/api/notifications", headers=bearer(pat1_token))
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert len(notifs) >= 1
    notif_id = notifs[0]["id"]

    # Mark single as read
    read_res = client.patch(f"/api/notifications/{notif_id}/read", headers=bearer(pat1_token))
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Mark all read
    all_read = client.patch("/api/notifications/read-all", headers=bearer(pat1_token))
    assert all_read.status_code == 200


def test_ai_chat_and_demo_fallback(client_and_db):
    client, session_factory = client_and_db
    env = setup_users(client, session_factory)
    pat1_token = env["pat1_token"]

    # Send message in demo mode (no key set)
    chat_res = client.post("/api/ai/chat", json={"message": "I need to find a cardiologist"}, headers=bearer(pat1_token))
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert data["is_demo_mode"] is True
    assert "cardiolog" in data["reply"].lower() or "doctor" in data["reply"].lower() or "mediassist" in data["reply"].lower()
    # Medical safety disclaimer check
    assert "disclaimer" in data["reply"].lower() or "medical" in data["reply"].lower()

    conv_id = data["conversation_id"]

    # List conversations
    convs_res = client.get("/api/ai/conversations", headers=bearer(pat1_token))
    assert convs_res.status_code == 200
    assert len(convs_res.json()) >= 1

    # Get conversation messages
    msgs_res = client.get(f"/api/ai/conversations/{conv_id}/messages", headers=bearer(pat1_token))
    assert msgs_res.status_code == 200
    assert len(msgs_res.json()) >= 2  # user + assistant


def test_admin_analytics_and_management(client_and_db):
    client, session_factory = client_and_db
    env = setup_users(client, session_factory)
    admin_token = env["admin_token"]
    pat_token = env["pat1_token"]

    # Patient forbidden from admin analytics
    forbidden_res = client.get("/api/admin/analytics", headers=bearer(pat_token))
    assert forbidden_res.status_code == 403

    # Admin access analytics
    analytics_res = client.get("/api/admin/analytics", headers=bearer(admin_token))
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    assert "total_patients" in data
    assert "total_doctors" in data
    assert "verified_doctors" in data
    assert "total_appointments" in data

    # Admin list patients
    patients_res = client.get("/api/admin/patients", headers=bearer(admin_token))
    assert patients_res.status_code == 200
    assert len(patients_res.json()["items"]) >= 2

    # Admin list all appointments
    appts_res = client.get("/api/admin/appointments", headers=bearer(admin_token))
    assert appts_res.status_code == 200
