# MediAssist — AI Health Appointment Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite)](https://vitejs.dev)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.36-D71F00?logo=sqlalchemy)](https://www.sqlalchemy.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?logo=postgresql)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

MediAssist is an intelligent, full-stack healthcare appointment scheduling platform powered by AI navigation assistance. It streamlines doctor discovery, consultation scheduling, double-booking prevention, availability management, and notification alerts across Patients, Doctors, and Administrators.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Key Features](#4-key-features)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture](#7-system-architecture)
8. [Database Design & Schema](#8-database-design--schema)
9. [API Overview](#9-api-overview)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Appointment Booking Rules & Engine](#11-appointment-booking-rules--engine)
12. [AI Appointment Assistant](#12-ai-appointment-assistant)
13. [AI Medical Safety Principles](#13-ai-medical-safety-principles)
14. [Security & Data Protection](#14-security--data-protection)
15. [Project Directory Structure](#15-project-directory-structure)
16. [Installation & Setup](#16-installation--setup)
17. [Environment Variables](#17-environment-variables)
18. [Running the Frontend](#18-running-the-frontend)
19. [Running the Backend](#19-running-the-backend)
20. [Database Setup & Migrations](#20-database-setup--migrations)
21. [Automated Testing](#21-automated-testing)
22. [API Documentation (Swagger UI)](#22-api-documentation-swagger-ui)
23. [UI Screenshots & Key Pages](#23-ui-screenshots--key-pages)
24. [Future Improvements](#24-future-improvements)

---

## 1. Project Overview
MediAssist connects patients with verified medical specialists through a modern, responsive web application backed by a high-performance REST API. It combines structured doctor discovery with an AI navigation assistant that helps users understand medical specializations, locate available consultation slots, and manage their visits.

## 2. Problem Statement
Traditional healthcare appointment systems suffer from:
- Complex navigation and confusion over which medical specialty to consult.
- Double-booking conflicts and inaccurate doctor availability schedules.
- Poor mobile responsiveness and lack of real-time notification alerts.
- Insecure password storage and unverified doctor listings.

## 3. Solution
MediAssist provides:
- **Instant Specialty Navigation**: Patients can search by symptom keyword or consult the AI Assistant for specialty recommendations.
- **Double-Booking Engine**: Strict backend transaction validation prevents overlapping appointments.
- **Role-Based Workflows**: Dedicated dashboards for Patients, Doctors, and System Administrators.
- **Safe AI Assistance**: Informational and navigation-focused AI that never prescribes or diagnoses.

---

## 4. Key Features

### For Patients:
- Registration & secure JWT login.
- Personalized dashboard with upcoming visit spotlight & statistics.
- Doctor search with real-time filters (specialization, location, consultation type).
- Doctor profile inspection with qualifications, experience, and consultation fees.
- 6-step guided appointment booking with live time slot selection.
- Appointment management (reschedule, cancel, view details).
- Real-time notification center for booking, reschedule, and cancellation alerts.
- AI Assistant chat interface for scheduling guidance and doctor discovery.

### For Doctors:
- Dedicated doctor dashboard with today's appointments and metric stats.
- Profile management (qualifications, experience years, bio, consultation fee).
- Weekly availability schedule management (15/30/45/60 min slot durations).
- Appointment status management (confirm, complete, cancel).

### For Administrators:
- Platform analytics dashboard (patient count, doctor verification ratio, booking breakdown).
- Doctor verification control (verify/unverify doctor credentials).
- Patient management and user accounts audit.
- Global appointment monitoring and status filtering.
- Specialization taxonomy management (CRUD with safe-deletion protection).

---

## 5. User Roles & Permissions

| Feature / Resource | Patient | Doctor | Admin |
| :--- | :---: | :---: | :---: |
| Register Account | Yes | Yes | Admin Only |
| Browse Doctors & Specializations | Yes | Yes | Yes |
| Book / Reschedule / Cancel Own Appointment | Yes | N/A | Yes |
| Manage Doctor Availability & Profile | No | Yes (Own Profile) | Yes |
| Update Appointment Status (Confirm/Complete) | No | Yes (Own Patient) | Yes |
| Verify Doctor Credentials | No | No | Yes |
| Manage Specializations (CRUD) | No | No | Yes |
| Platform Analytics | No | No | Yes |

---

## 6. Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3.4, Lucide React, Recharts, Axios, React Router 6.
- **Backend**: Python 3.13, FastAPI 0.115, Pydantic 2.10, SQLAlchemy 2.0, Uvicorn.
- **Database**: PostgreSQL (with psycopg 3 driver) & SQLite (for local testing/CI).
- **Authentication**: JWT (HS256) with Argon2id password hashing via pwdlib.
- **AI Integration**: OpenAI GPT-3.5 API with intelligent fallback/demo engine.
- **Testing**: Pytest with in-memory SQLite and FastAPI TestClient.

---

## 7. System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      React 18 + Vite        │
                                  │    Tailwind CSS Frontend    │
                                  └──────────────┬──────────────┘
                                                 │
                                           REST API (JSON)
                                       Bearer JWT Authorization
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │       FastAPI Backend       │
                                  │   (Deps, Guards, Router)    │
                                  └──────┬───────────────┬──────┘
                                         │               │
                        ┌────────────────┴─────┐   ┌─────┴────────────────┐
                        │  SQLAlchemy 2.0 ORM  │   │  OpenAI / AI Engine  │
                        │  (Services & Models) │   │ (Navigation & Rules) │
                        └──────────┬───────────┘   └──────────────────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ PostgreSQL Database │
                        └─────────────────────┘
```

---

## 8. Database Design & Schema

The database consists of 9 normalized tables with relational integrity:
1. `users`: ID, email, password_hash, full_name, phone, role (PATIENT/DOCTOR/ADMIN), is_active.
2. `patients`: ID, user_id (FK), date_of_birth, gender.
3. `doctors`: ID, user_id (FK), specialization_id (FK), qualification, experience_years, bio, location, consultation_fee, is_verified.
4. `specializations`: ID, name, description.
5. `availability`: ID, doctor_id (FK), day_of_week, start_time, end_time, slot_duration_minutes, is_active.
6. `appointments`: ID, patient_id (FK), doctor_id (FK), appointment_date, start_time, end_time, appointment_type, status, patient_note.
7. `notifications`: ID, user_id (FK), title, message, notification_type, is_read, created_at.
8. `ai_conversations`: ID, user_id (FK), title, created_at, updated_at.
9. `ai_messages`: ID, conversation_id (FK), role (USER/ASSISTANT/SYSTEM), content, created_at.

---

## 9. API Overview

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new Patient or Doctor account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT access token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/doctors` | Search & filter doctors with pagination | Authenticated |
| `GET` | `/api/doctors/{id}` | Get doctor details & public info | Authenticated |
| `GET` | `/api/doctors/me` | Get own doctor profile | DOCTOR |
| `POST` | `/api/doctors/profile` | Create doctor profile | DOCTOR |
| `PUT` | `/api/doctors/profile` | Update doctor profile | DOCTOR |
| `PATCH`| `/api/doctors/{id}/verify` | Verify or unverify doctor | ADMIN |
| `GET` | `/api/specializations` | List medical specializations | Authenticated |
| `POST` | `/api/specializations` | Create specialization | ADMIN |
| `PUT` | `/api/specializations/{id}` | Update specialization | ADMIN |
| `DELETE`| `/api/specializations/{id}`| Delete unused specialization | ADMIN |
| `GET` | `/api/doctors/{id}/availability` | List doctor availability slots | Authenticated |
| `POST` | `/api/doctors/{id}/availability` | Add weekly availability slot | DOCTOR (Self) |
| `GET` | `/api/doctors/{id}/available-slots` | Calculate open slots for a date | Authenticated |
| `POST` | `/api/appointments` | Book appointment (Double-booking protected) | PATIENT |
| `GET` | `/api/appointments` | List appointments (Filtered by role) | Authenticated |
| `GET` | `/api/appointments/{id}` | View appointment details | Authorized Party |
| `PATCH`| `/api/appointments/{id}/cancel` | Cancel an appointment | Patient / Doctor |
| `PATCH`| `/api/appointments/{id}/reschedule` | Reschedule appointment to a new slot | Patient / Doctor |
| `PATCH`| `/api/appointments/{id}/status` | Update status (CONFIRMED, COMPLETED) | Doctor / Admin |
| `GET` | `/api/notifications` | List user notifications | Authenticated |
| `PATCH`| `/api/notifications/{id}/read` | Mark notification as read | Authenticated |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications read | Authenticated |
| `POST` | `/api/ai/chat` | Chat with AI Appointment Assistant | Authenticated |
| `GET` | `/api/ai/conversations` | List user AI conversations | Authenticated |
| `GET` | `/api/admin/analytics` | Fetch admin aggregated metrics | ADMIN |
| `GET` | `/api/admin/patients` | List all registered patients | ADMIN |
| `GET` | `/api/admin/appointments` | List all system appointments | ADMIN |

---

## 10. Authentication & Authorization
- **Password Security**: Passwords are never stored in plaintext. They are hashed using Argon2id with memory hardness protection.
- **JWT Tokens**: Short-lived HS256 tokens issued on login, transmitting user ID and role claims.
- **Role Guard Dependencies**: Fast dependency injection verifies `require_role(UserRole.PATIENT)`, `require_role(UserRole.DOCTOR)`, or `require_role(UserRole.ADMIN)` on every protected route.

---

## 11. Appointment Booking Rules & Engine
1. **Doctor Existence & Verification Check**: Verifies doctor is active and certified.
2. **Date & Time Range Validation**: Rejects appointments scheduled in the past or where `end_time <= start_time`.
3. **Double-Booking Prevention**: Database-level query checks for any existing `PENDING`, `CONFIRMED`, or `RESCHEDULED` appointment overlapping with the requested time window:
   $$\text{Existing.start\_time} < \text{Requested.end\_time} \quad \text{AND} \quad \text{Existing.end\_time} > \text{Requested.start\_time}$$
4. **Automated Notification**: Once booked, notifications are automatically dispatched to both patient and doctor accounts.

---

## 12. AI Appointment Assistant
The AI Assistant acts as a conversational navigator on `/assistant`:
- Helps users determine which specialty to see based on general health symptoms.
- Searches for open doctors and explains available appointment timings.
- Supports user confirmation before any action is scheduled.
- Uses OpenAI GPT-3.5 when `OPENAI_API_KEY` is provided, and automatically switches to an offline **Demo / Fallback Mode** if no key is present.

---

## 13. AI Medical Safety Principles
- **No Diagnostics**: The assistant does not diagnose illnesses or conditions.
- **No Prescriptions**: The assistant never recommends medication or drug dosages.
- **Mandatory Disclaimer**: Every response includes an explicit medical disclaimer reminding users to consult licensed doctors.
- **No Direct DB Access**: AI messages cannot modify database records directly; all actions pass through authenticated service rules.

---

## 14. Security & Data Protection
- **No Passwords or Hashes in Responses**: Response schemas explicitly exclude sensitive credentials.
- **CORS Restricted**: Allowed origins configured for the React client.
- **Safe Specialization Deletion**: Foreign key constraints and service checks block deleting specializations that are currently assigned to doctors.

---

## 15. Project Directory Structure

```text
Doctor AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/        # auth, doctors, appointments, availability, notifications, ai, admin
│   │   │   ├── deps.py        # JWT auth and role guards
│   │   │   └── router.py      # Main API router registry
│   │   ├── core/              # Config & settings
│   │   ├── database/          # SQLAlchemy engine & session factory
│   │   ├── models/            # 9 SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Pure business logic services
│   │   └── main.py            # FastAPI application entry point
│   ├── tests/                 # 21 automated pytest tests
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components (common, appointments, doctors, ai, dashboard)
│   │   ├── context/           # AuthContext (JWT + demo mode fallback)
│   │   ├── layouts/           # PatientLayout, DoctorLayout, AdminLayout, PublicLayout
│   │   ├── pages/             # Patient, Doctor, Admin, and Public views
│   │   ├── services/          # api.js API client layer
│   │   ├── utils/             # mockData.js and helpers
│   │   ├── App.jsx            # React Router 6 configuration
│   │   └── main.jsx           # React DOM root
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite bundler config
│   └── tailwind.config.js     # Custom design tokens
├── README.md                  # Comprehensive Documentation
└── .gitignore                 # Safe exclusion rules
```

---

## 16. Installation & Setup

### Prerequisites:
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/mediassist-doctor-ai.git
cd "Doctor AI"
```

---

## 17. Environment Variables

### Backend (`backend/.env`):
```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/mediassist
SECRET_KEY=your-32-character-random-secret-key-here
FRONTEND_URL=http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-api-key-optional
```
*(Note: A database is optional for development/health check. If no DB is provided, tests run in-memory and frontend fallback ensures 100% demo availability).*

### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 18. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```
The application will start at `http://localhost:3000` (or `http://localhost:5173`).

To build for production:
```bash
npm run build
```

---

## 19. Running the Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000`.

---

## 20. Database Setup & Migrations

To initialize tables in PostgreSQL:
```bash
cd backend
python -m app.database.init_db
```

---

## 21. Automated Testing

Run the full backend test suite:
```bash
cd backend
python -m pytest tests/ -v
```

**Results**: 21 passed tests covering:
- Authentication & Argon2 password hashing.
- Role-based authorization and forbidden access guards.
- Doctor profiles, filtering, and verification.
- Specialization CRUD and safe-deletion constraints.
- Appointment booking, double-booking prevention, cancellation, and rescheduling.
- Notification dispatch and mark-as-read workflows.
- AI assistant chat, conversation history, and demo fallback mode.
- Admin analytics and patient listing.

---

## 22. API Documentation (Swagger UI)

When the backend is running, visit:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

## 23. UI Screenshots & Key Pages

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | Landing Page | Hero section, features, testimonials, CTA buttons |
| `/login` & `/register` | Auth Pages | Secure login and role registration (Patient/Doctor) with 1-click Demo logins |
| `/patient/dashboard` | Patient Dashboard | Upcoming visit spotlight, metric stat cards, quick action pills |
| `/patient/doctors` | Find Doctors | Search bar, multi-select filters, doctor cards with booking CTA |
| `/patient/book-appointment` | 6-Step Booking Wizard | Doctor, Date, Time slot, Mode, Note, Summary confirmation |
| `/patient/appointments` | My Appointments | Appointment list with Cancel & Reschedule interactive modals |
| `/patient/ai-assistant` | AI Assistant | Chat interface with smart prompts, disclaimer banner, and schedule analyzer |
| `/doctor/dashboard` | Doctor Dashboard | Today's appointments, patient visit statistics, profile metrics |
| `/doctor/availability` | Availability Manager | Slot duration picker (15–60 mins) & day-by-day active schedule grid |
| `/admin/dashboard` | Admin Dashboard | Real-time analytics, user distribution, and appointment breakdowns |

---

## 24. Future Improvements
- Video consultation integration using WebRTC / Daily.co.
- SMS and WhatsApp appointment reminders via Twilio.
- Electronic Health Records (EHR) and prescription PDF upload support.
- Multi-language localization (Hindi, Telugu, Tamil, Spanish).

---

## License
MIT License. Created for portfolio and production-ready healthcare management.
