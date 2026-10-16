from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.api.deps import get_db
from app.core.config import get_settings
from app.database.session import Base
from app.main import app
from app.models.user import User, UserRole
from app.services.auth import ALGORITHM, hash_password


@pytest.fixture
def client_and_session(monkeypatch: pytest.MonkeyPatch):
    """Provide an isolated database and a test-only JWT secret."""
    monkeypatch.setenv("SECRET_KEY", "test-secret-not-for-production")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
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


def register(client: TestClient, *, email: str, role: str = "PATIENT", password: str = "secure-pass-123"):
    return client.post("/api/auth/register", json={"full_name": "Test User", "email": email, "password": password, "phone": "9999999999", "role": role})


def login(client: TestClient, email: str, password: str = "secure-pass-123"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_patient_and_doctor_registration_hash_passwords(client_and_session) -> None:
    client, session_factory = client_and_session
    patient = register(client, email="patient@example.com")
    doctor = register(client, email="doctor@example.com", role="DOCTOR")
    assert patient.status_code == 201
    assert doctor.status_code == 201
    assert patient.json()["role"] == "PATIENT"
    assert doctor.json()["role"] == "DOCTOR"
    assert "password_hash" not in patient.json()
    assert "password" not in patient.json()
    with session_factory() as session:
        saved_patient = session.scalar(select(User).where(User.email == "patient@example.com"))
        assert saved_patient is not None
        assert saved_patient.password_hash != "secure-pass-123"
        assert saved_patient.password_hash.startswith("$argon2")


def test_admin_registration_duplicate_email_and_weak_password_are_rejected(client_and_session) -> None:
    client, _ = client_and_session
    assert register(client, email="admin@example.com", role="ADMIN").status_code == 403
    assert register(client, email="duplicate@example.com").status_code == 201
    assert register(client, email="duplicate@example.com").status_code == 409
    assert register(client, email="weak@example.com", password="short").status_code == 422
    assert register(client, email="spaces@example.com", password="        ").status_code == 422


def test_login_returns_jwt_and_me_returns_safe_user(client_and_session) -> None:
    client, _ = client_and_session
    register(client, email="login@example.com")
    response = login(client, "login@example.com")
    assert response.status_code == 200
    token_data = response.json()
    assert token_data["token_type"] == "bearer"
    assert token_data["expires_in"] == 1800
    assert token_data["access_token"]
    me = client.get("/api/auth/me", headers=bearer(token_data["access_token"]))
    assert me.status_code == 200
    assert me.json()["email"] == "login@example.com"
    assert "password_hash" not in me.json()


def test_invalid_credentials_and_inactive_users_return_401(client_and_session) -> None:
    client, session_factory = client_and_session
    register(client, email="inactive@example.com")
    assert login(client, "inactive@example.com", "wrong-password").status_code == 401
    assert login(client, "unknown@example.com").status_code == 401
    with session_factory() as session:
        user = session.scalar(select(User).where(User.email == "inactive@example.com"))
        assert user is not None
        user.is_active = False
        session.commit()
    assert login(client, "inactive@example.com").status_code == 401


def test_missing_invalid_and_expired_tokens_return_401(client_and_session) -> None:
    client, _ = client_and_session
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers=bearer("not.a.valid.token")).status_code == 401
    expired_token = jwt.encode({"sub": "1", "role": "PATIENT", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}, "test-secret-not-for-production", algorithm=ALGORITHM)
    assert client.get("/api/auth/me", headers=bearer(expired_token)).status_code == 401


def test_role_authorization_uses_401_for_missing_and_403_for_wrong_role(client_and_session) -> None:
    client, session_factory = client_and_session
    register(client, email="role-patient@example.com", role="PATIENT")
    register(client, email="role-doctor@example.com", role="DOCTOR")
    with session_factory() as session:
        session.add(User(email="role-admin@example.com", password_hash=hash_password("secure-pass-123"), full_name="Admin User", role=UserRole.ADMIN))
        session.commit()
    patient_token = login(client, "role-patient@example.com").json()["access_token"]
    doctor_token = login(client, "role-doctor@example.com").json()["access_token"]
    admin_token = login(client, "role-admin@example.com").json()["access_token"]
    assert client.get("/api/auth/test/patient").status_code == 401
    assert client.get("/api/auth/test/doctor", headers=bearer(patient_token)).status_code == 403
    assert client.get("/api/auth/test/admin", headers=bearer(doctor_token)).status_code == 403
    assert client.get("/api/auth/test/admin", headers=bearer(admin_token)).status_code == 200
    assert client.get("/api/auth/test/patient", headers=bearer(patient_token)).status_code == 200
