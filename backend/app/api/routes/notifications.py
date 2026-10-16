from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.database.session import get_db
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services import notification as notification_service

router = APIRouter(tags=["notifications"])
DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[NotificationResponse])
def list_notifications(current_user: CurrentUser, db: DbSession):
    """List all notifications for the current user."""
    return notification_service.list_notifications_for_user(db, current_user.id)


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(current_user: CurrentUser, db: DbSession):
    """Get count of unread notifications."""
    return UnreadCountResponse(count=notification_service.unread_count(db, current_user.id))


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: int, current_user: CurrentUser, db: DbSession):
    """Mark a single notification as read."""
    notif = notification_service.get_notification(db, notification_id)
    if notif is None or notif.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return notification_service.mark_as_read(db, notif)


@router.patch("/read-all", response_model=UnreadCountResponse)
def mark_all_read(current_user: CurrentUser, db: DbSession):
    """Mark all notifications as read for the current user."""
    count = notification_service.mark_all_read(db, current_user.id)
    return UnreadCountResponse(count=count)
