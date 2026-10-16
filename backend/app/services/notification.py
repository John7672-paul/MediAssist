from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def list_notifications_for_user(db: Session, user_id: int) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        ).all()
    )


def get_notification(db: Session, notification_id: int) -> Notification | None:
    return db.get(Notification, notification_id)


def mark_as_read(db: Session, notification: Notification) -> Notification:
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_read(db: Session, user_id: int) -> int:
    """Mark all unread notifications for a user as read. Returns count updated."""
    notifs = list(
        db.scalars(
            select(Notification).where(
                Notification.user_id == user_id, Notification.is_read == False
            )
        ).all()
    )
    for n in notifs:
        n.is_read = True
    db.commit()
    return len(notifs)


def unread_count(db: Session, user_id: int) -> int:
    from sqlalchemy import func
    return db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
    ) or 0
