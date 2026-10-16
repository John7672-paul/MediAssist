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
from app.models.specialization import Specialization
from app.models.user import User, UserRole
from app.services.auth import hash_password


@pytest.fixture
def client_and_session(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("SECRET_KEY", "test-secret-not-for-production")
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


def register(client: TestClient, email: str, role: str) -> str:
    response = client.post("/api/auth/register", json={"full_name": role.title() + " User", "email": email, "password": "secure-pass-123", "role": role})
    assert response.status_code == 201
    return token_for(client, email)


def create_admin(session_factory) -> User:
    with session_factory() as session:
        admin = User(email="admin@example.com", password_hash=hash_password("secure-pass-123"), full_name="Admin User", role=UserRole.ADMIN)
        session.add(admin)
        session.commit()
        session.refresh(admin)
        return admin


def create_specialization(client: TestClient, admin_token: str, name: str = "Cardiology") -> dict:
    response = client.post("/api/specializations", headers=bearer(admin_token), json={"name": name, "description": "Specialist care"})
    assert response.status_code == 201
    return response.json()


def doctor_profile_payload(specialization_id: int, **overrides) -> dict:
    payload = {"specialization_id": specialization_id, "qualification": "MD", "experience_years": 5, "bio": "Experienced specialist", "location": "Hyderabad", "consultation_fee": "750.00"}
    payload.update(overrides)
    return payload


def test_specialization_permissions_crud_and_safe_deletion(client_and_session) -> None:
    client, session_factory = client_and_session
    patient_token = register(client, "patient@example.com", "PATIENT")
    doctor_token = register(client, "doctor@example.com", "DOCTOR")
    create_admin(session_factory)
    admin_token = token_for(client, "admin@example.com")

    assert client.get("/api/specializations").status_code == 401
    assert client.get("/api/specializations", headers=bearer(patient_token)).status_code == 200
    assert client.post("/api/specializations", headers=bearer(patient_token), json={"name": "Cardiology"}).status_code == 403
    assert client.post("/api/specializations", headers=bearer(doctor_token), json={"name": "Cardiology"}).status_code == 403
    specialization = create_specialization(client, admin_token)
    assert client.post("/api/specializations", headers=bearer(admin_token), json={"name": "Cardiology"}).status_code == 409
    assert client.put(f"/api/specializations/{specialization['id']}", headers=bearer(patient_token), json={"name": "Heart Care"}).status_code == 403
    updated = client.put(f"/api/specializations/{specialization['id']}", headers=bearer(admin_token), json={"name": "Heart Care"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Heart Care"
    assert client.delete(f"/api/specializations/{specialization['id']}", headers=bearer(admin_token)).status_code == 204


def test_referenced_specialization_cannot_be_deleted(client_and_session) -> None:
    client, session_factory = client_and_session
    doctor_token = register(client, "reference-doctor@example.com", "DOCTOR")
    create_admin(session_factory)
    admin_token = token_for(client, "admin@example.com")
    specialization = create_specialization(client, admin_token)
    profile = client.post("/api/doctors/profile", headers=bearer(doctor_token), json=doctor_profile_payload(specialization["id"]))
    assert profile.status_code == 201
    assert client.delete(f"/api/specializations/{specialization['id']}", headers=bearer(admin_token)).status_code == 409


def test_doctor_profile_ownership_validation_and_response_safety(client_and_session) -> None:
    client, session_factory = client_and_session
    patient_token = register(client, "profile-patient@example.com", "PATIENT")
    doctor_token = register(client, "profile-doctor@example.com", "DOCTOR")
    create_admin(session_factory)
    admin_token = token_for(client, "admin@example.com")
    specialization = create_specialization(client, admin_token)

    assert client.post("/api/doctors/profile", headers=bearer(patient_token), json=doctor_profile_payload(specialization["id"])).status_code == 403
    created = client.post("/api/doctors/profile", headers=bearer(doctor_token), json=doctor_profile_payload(specialization["id"]))
    assert created.status_code == 201
    assert "password_hash" not in created.text
    assert client.post("/api/doctors/profile", headers=bearer(doctor_token), json=doctor_profile_payload(specialization["id"])).status_code == 409
    mine = client.get("/api/doctors/me", headers=bearer(doctor_token))
    assert mine.status_code == 200
    assert mine.json()["user"]["full_name"] == "Doctor User"
    updated = client.put("/api/doctors/profile", headers=bearer(doctor_token), json={"location": "Pune", "experience_years": 6})
    assert updated.status_code == 200
    assert updated.json()["location"] == "Pune"
    assert updated.json()["is_verified"] is False
    assert client.put("/api/doctors/profile", headers=bearer(doctor_token), json={"is_verified": True}).status_code == 422


def test_doctor_listing_filters_details_and_verification_permissions(client_and_session) -> None:
    client, session_factory = client_and_session
    patient_token = register(client, "listing-patient@example.com", "PATIENT")
    doctor_token = register(client, "listing-doctor@example.com", "DOCTOR")
    create_admin(session_factory)
    admin_token = token_for(client, "admin@example.com")
    specialization = create_specialization(client, admin_token, "Dermatology")
    created = client.post("/api/doctors/profile", headers=bearer(doctor_token), json=doctor_profile_payload(specialization["id"], qualification="Dermatology MD", bio="Skin and cardio support", location="Hyderabad"))
    doctor_id = created.json()["id"]

    assert client.get("/api/doctors").status_code == 401
    listing = client.get("/api/doctors", headers=bearer(patient_token), params={"search": "skin", "page": 1, "page_size": 20})
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    assert client.get("/api/doctors", headers=bearer(patient_token), params={"specialization_id": specialization["id"]}).json()["total"] == 1
    assert client.get("/api/doctors", headers=bearer(patient_token), params={"location": "Hyder"}).json()["total"] == 1
    assert client.get(f"/api/doctors/{doctor_id}", headers=bearer(patient_token)).status_code == 200
    assert client.get("/api/doctors/9999", headers=bearer(patient_token)).status_code == 404
    assert client.patch(f"/api/doctors/{doctor_id}/verify", headers=bearer(doctor_token), json={"is_verified": True}).status_code == 403
    assert client.patch(f"/api/doctors/{doctor_id}/verify", headers=bearer(patient_token), json={"is_verified": True}).status_code == 403
    verified = client.patch(f"/api/doctors/{doctor_id}/verify", headers=bearer(admin_token), json={"is_verified": True})
    assert verified.status_code == 200
    assert verified.json()["is_verified"] is True
