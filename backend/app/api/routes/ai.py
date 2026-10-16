from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.core.config import get_settings
from app.database.session import get_db
from app.schemas.ai import AIConversationResponse, AIMessageResponse, ChatRequest, ChatResponse
from app.services import ai as ai_service

router = APIRouter(tags=["ai"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, current_user: CurrentUser, db: DbSession):
    """
    Send a message to the AI appointment assistant.
    The assistant helps with doctor search, slot lookup, and appointment management.
    It NEVER diagnoses or prescribes - medical decisions must go through qualified doctors.
    """
    reply, conv_id = ai_service.chat(
        db=db,
        user_id=current_user.id,
        user_message=payload.message,
        conversation_id=payload.conversation_id,
    )
    settings = get_settings()
    is_demo = not bool(settings.openai_api_key)
    return ChatResponse(reply=reply, conversation_id=conv_id, is_demo_mode=is_demo)


@router.get("/conversations", response_model=list[AIConversationResponse])
def list_conversations(current_user: CurrentUser, db: DbSession):
    """List all AI conversations for the current user."""
    return ai_service.list_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}/messages", response_model=list[AIMessageResponse])
def get_conversation_messages(conversation_id: int, current_user: CurrentUser, db: DbSession):
    """Get all messages in a conversation."""
    from sqlalchemy import select
    from app.models.ai import AIConversation
    conv = db.scalar(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == current_user.id,
        )
    )
    if conv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return ai_service.get_conversation_messages(db, conversation_id)
