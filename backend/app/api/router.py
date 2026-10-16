from fastapi import APIRouter

from app.api.routes.admin import router as admin_router
from app.api.routes.ai import router as ai_router
from app.api.routes.appointments import router as appointments_router
from app.api.routes.auth import router as auth_router
from app.api.routes.availability import router as availability_router
from app.api.routes.doctors import router as doctors_router
from app.api.routes.health import router as health_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.patients import router as patients_router
from app.api.routes.specializations import router as specializations_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(specializations_router, prefix="/specializations")
api_router.include_router(doctors_router, prefix="/doctors")
api_router.include_router(patients_router, prefix="/patients")
api_router.include_router(appointments_router, prefix="/appointments")
api_router.include_router(availability_router)  # nested under /doctors/{id}/...
api_router.include_router(notifications_router, prefix="/notifications")
api_router.include_router(ai_router, prefix="/ai")
api_router.include_router(admin_router, prefix="/admin")
