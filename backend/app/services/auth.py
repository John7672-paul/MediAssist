from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.user import User, UserRole


ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plaintext password with Argon2 before it is stored."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its Argon2 hash."""
    return password_hash.verify(password, hashed_password)


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Return an active matching user, without exposing which check failed."""
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not user.is_active or not verify_password(password, user.password_hash):
        return None
    return user


def _get_secret_key() -> str:
    secret_key = get_settings().secret_key
    if not secret_key:
        raise RuntimeError("SECRET_KEY must be configured before issuing or validating tokens.")
    return secret_key


def create_access_token(user: User) -> tuple[str, int]:
    """Create a short-lived HS256 bearer token for one user."""
    settings = get_settings()
    expires_in = settings.access_token_expire_minutes * 60
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    payload = {"sub": str(user.id), "role": user.role.value, "exp": expires_at}
    return jwt.encode(payload, _get_secret_key(), algorithm=ALGORITHM), expires_in


def decode_access_token(token: str) -> dict[str, object]:
    """Verify a JWT signature and expiry before returning its claims."""
    return jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])


def is_public_registration_role(role: UserRole) -> bool:
    return role in {UserRole.PATIENT, UserRole.DOCTOR}
