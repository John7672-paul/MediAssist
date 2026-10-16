from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ai import AIMessageRole


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    is_demo_mode: bool


class AIMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    conversation_id: int
    role: AIMessageRole
    content: str
    created_at: datetime


class AIConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    title: str | None
    created_at: datetime
    updated_at: datetime
