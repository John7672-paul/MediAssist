from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.database.session import get_db
from app.models.user import User, UserRole
from app.schemas.specialization import SpecializationCreate, SpecializationResponse, SpecializationUpdate
from app.services import specialization as specialization_service


router = APIRouter(tags=["specializations"])
DbSession = Annotated[Session, Depends(get_db)]
AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


@router.get("", response_model=list[SpecializationResponse])
def read_specializations(_current_user: CurrentUser, db: DbSession):
    return specialization_service.list_specializations(db)


@router.post("", response_model=SpecializationResponse, status_code=status.HTTP_201_CREATED)
def create_specialization(payload: SpecializationCreate, db: DbSession, _admin: AdminUser):
    if specialization_service.specialization_name_exists(db, payload.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A specialization with this name already exists.")
    return specialization_service.create_specialization(db, payload)


@router.put("/{specialization_id}", response_model=SpecializationResponse)
def edit_specialization(specialization_id: int, payload: SpecializationUpdate, db: DbSession, _admin: AdminUser):
    specialization = specialization_service.get_specialization(db, specialization_id)
    if specialization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found.")
    if payload.name and specialization_service.specialization_name_exists(db, payload.name, specialization_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A specialization with this name already exists.")
    return specialization_service.update_specialization(db, specialization, payload)


@router.delete("/{specialization_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_specialization(specialization_id: int, db: DbSession, _admin: AdminUser) -> Response:
    specialization = specialization_service.get_specialization(db, specialization_id)
    if specialization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialization not found.")
    if specialization_service.specialization_is_in_use(db, specialization_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This specialization is in use by one or more doctors.")
    specialization_service.delete_specialization(db, specialization)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
