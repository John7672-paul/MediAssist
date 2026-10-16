# MediAssist Backend

This directory contains the FastAPI backend foundation for MediAssist. Phase 4B adds PostgreSQL-compatible SQLAlchemy models, relationships, constraints, and an explicit development database initialization command. It deliberately does not include authentication, appointment APIs, notification APIs, or AI integration.

## Technology stack

- Python
- FastAPI and Uvicorn
- SQLAlchemy
- Pydantic
- PostgreSQL driver (`psycopg`)
- python-dotenv

## Folder structure

```text
backend/
├── app/
│   ├── api/routes/       # HTTP route modules
│   ├── core/             # Environment configuration
│   ├── database/         # SQLAlchemy engine and session dependency
│   ├── models/           # Modular SQLAlchemy database models
│   ├── schemas/          # Request/response schemas
│   ├── services/         # Business logic
│   ├── utils/            # Shared helpers
│   └── main.py           # FastAPI application
├── tests/
├── requirements.txt
└── .env.example
```

## Setup

From the `backend` directory, create and activate a virtual environment:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `DATABASE_URL` for PostgreSQL. For example:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/mediassist
```

No database is required for the health check. Do not commit `.env`.

## Database architecture

The models are PostgreSQL-compatible and are split into focused files under `app/models/`. They represent these tables:

- `users`, `patients`, `doctors`, and `specializations`
- `availability` and `appointments`
- `notifications`
- `ai_conversations` and `ai_messages`

Relationship overview:

```text
User ── optional Patient ── Appointments ── Doctor ── Specialization
  ├── optional Doctor ── Availability
  ├── Notifications
  └── AI Conversations ── AI Messages
```

The database uses foreign keys, unique account/profile links, enum values for roles and statuses, time-range checks, and non-negative doctor experience/fees. Appointment history is not configured for automatic cascading deletion.

## Initialize a development database

After configuring `DATABASE_URL`, explicitly create any missing tables:

```powershell
python -m app.database.init_db
```

This calls `Base.metadata.create_all()`. It creates missing tables only; it never drops tables or deletes data. Use Alembic migrations when schema changes must be deployed in the future.

## Run the API

```powershell
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`.

- Health check: `GET http://127.0.0.1:8000/api/health`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Run tests

```powershell
pytest
```

The model tests use a temporary in-memory SQLite database so they never change your configured PostgreSQL database. This validates the models, relationships, and portable constraints; it does not verify a live PostgreSQL connection.

## Authentication and authorization (Phase 4C)

Authentication follows a small, separated flow: auth router → auth service → Argon2 password hash / JWT → current-user dependency → role guard.

- `POST /api/auth/register` creates only `PATIENT` or `DOCTOR` accounts. It validates email/password input and stores only an Argon2 password hash. Public `ADMIN` registration is rejected.
- `POST /api/auth/login` validates active-user credentials and returns an HS256 bearer token.
- `GET /api/auth/me` returns the authenticated user's safe profile; password fields are never returned.
- `GET /api/auth/test/patient`, `/test/doctor`, and `/test/admin` are temporary Phase 4C authorization checks, not business APIs.

Set a strong, private `SECRET_KEY` in your uncommitted `.env` file before using login. `ACCESS_TOKEN_EXPIRE_MINUTES` defaults to `30` and can be configured there as well. Tokens include the user ID, role, and expiry.

Protected routes use the Swagger UI bearer-token authorization control. Authentication failures return **401** (missing, malformed, expired, inactive, or unknown user); authorization failures return **403** (valid signed-in user with the wrong role).

Run all backend tests, including isolated authentication tests:

```powershell
pytest
```

## Doctors and specializations (Phase 4D)

All Phase 4D endpoints require a bearer token. Any authenticated user can list specializations and doctors; only doctors can create or change their own profile; only administrators can manage specializations and verify doctors.

Specialization endpoints:

- `GET /api/specializations` — alphabetical list for authenticated users.
- `POST /api/specializations` — ADMIN only.
- `PUT /api/specializations/{specialization_id}` — ADMIN only.
- `DELETE /api/specializations/{specialization_id}` — ADMIN only. Returns 409 when a doctor still references it.

Doctor endpoints:

- `GET /api/doctors` — authenticated paginated listing.
- `GET /api/doctors/{doctor_id}` — authenticated public profile.
- `GET /api/doctors/me`, `POST /api/doctors/profile`, `PUT /api/doctors/profile` — DOCTOR only, for the signed-in doctor's own profile.
- `PATCH /api/doctors/{doctor_id}/verify` — ADMIN only.

`GET /api/doctors` supports `specialization_id`, `location`, `search`, `is_verified`, `page` (default `1`), and `page_size` (default `20`, maximum `100`). The search checks qualifications, bio, location, and specialization name.

Example doctor search:

```text
GET /api/doctors?specialization_id=1&location=Hyderabad&page=1&page_size=20
Authorization: Bearer <access_token>
```

## Next: Phase 4E

Appointment booking, availability slots, notifications, AI, payments, and frontend API integration are intentionally not included in this phase.
