"""AI chat service: stores messages in DB, calls OpenAI if key is configured, else demo mode."""
from __future__ import annotations

import json
import os
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.models.ai import AIConversation, AIMessage, AIMessageRole
from app.models.appointment import Appointment, AppointmentStatus
from app.models.availability import Availability
from app.models.doctor import Doctor
from app.models.specialization import Specialization


_DISCLAIMER = (
    "\n\n---\n⚕️ **Medical Disclaimer:** I am an appointment-navigation assistant only. "
    "I do not diagnose, treat, or prescribe. Please consult a qualified doctor for any medical advice."
)

_DEMO_RESPONSES: dict[str, str] = {
    "find_doctor": (
        "I can help you find a doctor! Here are a few options:\n\n"
        "• Use **Find Doctors** (menu) to search by specialization or location\n"
        "• Filter by verified doctors for quality assurance\n"
        "• Click a doctor's profile to view availability and book directly\n\n"
        "Which specialization are you looking for?"
    ),
    "book": (
        "To book an appointment:\n\n"
        "1. Go to **Find Doctors** and choose a doctor\n"
        "2. Click **Book Appointment** on their profile\n"
        "3. Select a date and available time slot\n"
        "4. Choose In-Person or Online consultation\n"
        "5. Confirm the booking\n\n"
        "Would you like me to help narrow down a doctor for you?"
    ),
    "cancel": (
        "To cancel an appointment:\n\n"
        "1. Go to **My Appointments**\n"
        "2. Find the appointment you wish to cancel\n"
        "3. Click **Cancel** and confirm\n\n"
        "⚠️ Please cancel at least 24 hours before the scheduled time.\n\n"
        "Do you want me to show you your upcoming appointments?"
    ),
    "reschedule": (
        "To reschedule an appointment:\n\n"
        "1. Go to **My Appointments**\n"
        "2. Click **Reschedule** on the appointment\n"
        "3. Choose a new date and available time slot\n"
        "4. Confirm the change\n\n"
        "Would you like help picking a new slot?"
    ),
    "slots": (
        "To check available slots for a doctor:\n\n"
        "1. Go to **Find Doctors** or click the doctor's profile\n"
        "2. Select a date on the booking page\n"
        "3. Available time slots will be shown automatically\n\n"
        "Which doctor and date would you like to check?"
    ),
    "specialization": (
        "We offer appointments across many specializations, including:\n\n"
        "🫀 Cardiology | 🧠 Neurology | 🦴 Orthopedics | 👁 Ophthalmology\n"
        "🧴 Dermatology | 👶 Pediatrics | 🦷 Dentistry | 🧘 Psychiatry\n\n"
        "Go to **Find Doctors** and filter by specialty to see available doctors."
    ),
    "default": (
        "I'm your MediAssist Appointment & Healthcare Navigation Assistant.\n\n"
        "I can help you:\n"
        "• 🔍 **Find doctors** by specialization or location\n"
        "• 📅 **Book appointments** and check available slots\n"
        "• ❌ **Cancel or reschedule** existing appointments\n"
        "• 🔔 **Check notifications** and appointment history\n\n"
        "What would you like to do today?"
    ),
}


def _demo_response(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["find", "search", "doctor", "specialist", "need a"]):
        return _DEMO_RESPONSES["find_doctor"] + _DISCLAIMER
    if any(w in msg for w in ["book", "schedule", "appointment", "make an"]):
        return _DEMO_RESPONSES["book"] + _DISCLAIMER
    if any(w in msg for w in ["cancel", "remove", "delete"]):
        return _DEMO_RESPONSES["cancel"] + _DISCLAIMER
    if any(w in msg for w in ["reschedule", "change", "move", "postpone"]):
        return _DEMO_RESPONSES["reschedule"] + _DISCLAIMER
    if any(w in msg for w in ["slot", "available", "timing", "time", "when"]):
        return _DEMO_RESPONSES["slots"] + _DISCLAIMER
    if any(w in msg for w in ["special", "cardio", "neuro", "ortho", "derm", "pediatr"]):
        return _DEMO_RESPONSES["specialization"] + _DISCLAIMER
    return _DEMO_RESPONSES["default"] + _DISCLAIMER


def _call_openai(messages: list[dict[str, str]], api_key: str) -> str:
    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return f"[AI service error: {e}]\n\n" + _DEMO_RESPONSES["default"] + _DISCLAIMER


def get_or_create_conversation(db: Session, user_id: int, conversation_id: int | None = None) -> AIConversation:
    if conversation_id is not None:
        conv = db.scalar(
            select(AIConversation).where(
                AIConversation.id == conversation_id,
                AIConversation.user_id == user_id,
            )
        )
        if conv:
            return conv
    conv = AIConversation(user_id=user_id, title="New conversation")
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def get_conversation_messages(db: Session, conversation_id: int) -> list[AIMessage]:
    return list(
        db.scalars(
            select(AIMessage)
            .where(AIMessage.conversation_id == conversation_id)
            .order_by(AIMessage.created_at)
        ).all()
    )


def list_conversations(db: Session, user_id: int) -> list[AIConversation]:
    return list(
        db.scalars(
            select(AIConversation)
            .where(AIConversation.user_id == user_id)
            .order_by(AIConversation.updated_at.desc())
        ).all()
    )


def chat(db: Session, user_id: int, user_message: str, conversation_id: int | None = None) -> tuple[str, int]:
    """Process a chat message. Returns (assistant_reply, conversation_id)."""
    settings = get_settings()

    # Get or create conversation
    conv = get_or_create_conversation(db, user_id, conversation_id)

    # Store user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        role=AIMessageRole.USER,
        content=user_message,
    )
    db.add(user_msg)
    db.commit()

    # Build reply
    api_key = settings.openai_api_key
    if api_key:
        # Build message history for OpenAI
        system_prompt = (
            "You are MediAssist, a healthcare appointment navigation assistant. "
            "You help users find doctors, check availability, book, cancel, and reschedule appointments. "
            "You NEVER diagnose, prescribe medication, or give medical advice. "
            "Always remind users to consult a qualified doctor for medical decisions. "
            "Keep responses concise and helpful. "
            "Available actions: find doctors, check specializations, view available slots, book/cancel/reschedule appointments."
        )
        history = get_conversation_messages(db, conv.id)
        messages = [{"role": "system", "content": system_prompt}]
        for h in history[:-1]:  # exclude the user message we just saved
            role = "user" if h.role == AIMessageRole.USER else "assistant"
            messages.append({"role": role, "content": h.content})
        messages.append({"role": "user", "content": user_message})
        reply = _call_openai(messages, api_key)
    else:
        reply = "[Demo Mode] " + _demo_response(user_message)

    # Store assistant reply
    asst_msg = AIMessage(
        conversation_id=conv.id,
        role=AIMessageRole.ASSISTANT,
        content=reply,
    )
    db.add(asst_msg)

    # Update conversation title if it's the first message
    if conv.title == "New conversation" and len(user_message) > 3:
        conv.title = user_message[:60] + ("..." if len(user_message) > 60 else "")

    db.commit()
    return reply, conv.id
