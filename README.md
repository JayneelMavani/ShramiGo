# ShramiGo

ShramiGo is a cooperative service marketplace connecting customers with workers and supporting end-to-end booking, payment, and service completion. The repository contains a React/Vite frontend and a FastAPI/SQLAlchemy backend.

## Prerequisites

- Node.js and npm
- Python 3.13+
- PostgreSQL for normal development/production
- Git

## Configuration

Copy `backend/.env.example` to `backend/.env` and set a real PostgreSQL URL and random `SECRET_KEY` of at least 32 characters. Set `CORS_ORIGINS` to the exact frontend origins. Set `VITE_API_BASE_URL` in `frontend/.env` for the backend URL.

Do not commit `.env`, database credentials, JWT secrets, or payment credentials.

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Health endpoints are `/api/health` and `/api/ready`.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL`; it defaults to `http://localhost:8000` for local development.

## PostgreSQL concurrency test

Use a dedicated database named `shramsetu_test`; the integration test refuses other database names:

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shramsetu_test"
cd backend
pytest
```

## Production integrations

Configure Razorpay with `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Register `POST /api/payments/webhook/razorpay` with Razorpay. Configure a shared `REDIS_URL` for distributed login rate limiting. Refresh tokens are rotated at `POST /api/auth/refresh` and revoked by `POST /api/auth/logout`.

Cash is fully supported without Razorpay credentials. Use `payment_method=cash`; the assigned worker or an admin confirms receipt with `PUT /api/bookings/{booking_id}/cash-received`. Use `payment_method=razorpay` only when Razorpay is configured.

Worker profiles accept validated latitude/longitude values. Nearby discovery is available at `GET /api/workers/nearby` with radius, service, availability, rating, price, and pagination filters; responses expose approximate distance rather than exact worker coordinates.

## Tests and builds

```powershell
cd backend
pytest
python -m compileall app

cd ..\frontend
npm run build
```

## Application rules

- Backend authentication and role checks are authoritative.
- Customers select an explicit worker service; pricing is calculated server-side.
- Booking times must be future, available, and non-overlapping.
- Money uses Decimal/Numeric; `total_amount` is customer total and `worker_payout` is worker earnings.
- Online payment is not marked successful from a browser request. Cash works without Razorpay; Razorpay requires provider configuration and backend verification.

See `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/SECURITY.md`, `docs/BOOKING_FLOW.md`, and `docs/PAYMENT_FLOW.md` for details.

## Module 1 — Full verification

Run these checks after installing dependencies:

```powershell
# Backend
cd backend
python -m compileall app
pytest
alembic current
alembic upgrade head

# Frontend
cd ..\frontend
npm run typecheck
npm run build
```

For the PostgreSQL concurrency test, use a dedicated database named `shramsetu_test`:

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shramsetu_test"
cd ..\backend
pytest
```

Health checks after starting FastAPI:
- `GET /api/health` — application health
- `GET /api/ready` — application + PostgreSQL readiness
- `GET /docs` — Swagger/OpenAPI

## Current implementation notes

- AI recommendations are deterministic and explainable for the MVP; no external AI API key is required.
- Customer and worker profiles support editable details and compressed profile images.
- Worker service charges are controlled by the worker; the platform service charge is fixed at ₹30.
- Booking status is guarded server-side and completion requires settled payment.
- Cash payments require worker/admin confirmation before completion.
- Razorpay is optional and only becomes active when its credentials are configured.
- GPS address lookup uses the browser Geolocation API and Nominatim.
