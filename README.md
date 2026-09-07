# ShramSetu Monorepo

ShramSetu is a cooperative service marketplace connecting customers with workers and supporting end-to-end booking, payment, and service completion. 

This repository has been restructured into a **pnpm monorepo** to support future scaling and feature-based packages. 

Currently, the core applications are:
- **`apps/web`**: React/Vite frontend
- **`apps/api`**: FastAPI/SQLAlchemy backend (Python)

*Note: Future backend iterations may migrate to a TypeScript/Drizzle stack as per the architectural blueprint, but the current business logic remains Python/FastAPI.*

## Repository Structure

```text
shramsetu/
├── apps/
│   ├── web/           # React frontend
│   └── api/           # Python/FastAPI backend
│
├── packages/
│   ├── contracts/     # Shared schemas/types (Scaffolded)
│   ├── db/            # Database configurations (Scaffolded)
│   ├── ai/            # AI scoring/matching (Scaffolded)
│   └── config/        # Shared configs (Scaffolded)
```

## Prerequisites

- Node.js and **pnpm**
- Python 3.13+
- PostgreSQL for normal development/production
- Git

## Configuration

1. **Backend**: Copy `apps/api/.env.example` to `apps/api/.env` and set a real PostgreSQL URL and random `SECRET_KEY` of at least 32 characters. Set `CORS_ORIGINS` to the exact frontend origins. 
2. **Frontend**: Set `VITE_API_BASE_URL` in `apps/web/.env` for the backend URL.

*Do not commit `.env`, database credentials, JWT secrets, or payment credentials.*

## Setup and Run

### Root Monorepo

Install root Node dependencies and link workspace packages:

```powershell
pnpm install
```

### Backend (`apps/api`)

The backend is currently Python-based.

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Health endpoints are `/api/health` and `/api/ready`.

### Frontend (`apps/web`)

```powershell
cd apps/web
pnpm run dev
```
*(Or you can run `pnpm -r run dev` from the root once scripts are fully aligned).*

The frontend reads `VITE_API_BASE_URL`; it defaults to `http://localhost:8000` for local development.

## Tests and Builds

### Backend

```powershell
cd apps/api
pytest
python -m compileall app
```

*(For the PostgreSQL concurrency test, use a dedicated database named `shramsetu_test` and set `$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shramsetu_test"` before running `pytest`)*

### Frontend

```powershell
cd apps/web
pnpm run build
```

## Application Rules
- Backend authentication and role checks are authoritative.
- Customers select an explicit worker service; pricing is calculated server-side.
- Booking times must be future, available, and non-overlapping.
- Online payment is not marked successful from a browser request. Cash works without Razorpay; Razorpay requires provider configuration and backend verification.

See `docs/` for additional architecture and API documentation.
