from fastapi import APIRouter


router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    """Return a lightweight status response without requiring a database."""
    return {"status": "ok", "service": "MediAssist API"}
