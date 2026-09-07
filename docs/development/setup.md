# Local Development Setup

This guide walks you through setting up and running ShramiGo locally.

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18+)
- **pnpm** (used for workspace management)
- **Python** (v3.13+)
- **PostgreSQL** (if using local database)
- **Git**

## 1. Initial Monorepo Setup

Clone the repository and install the workspace dependencies from the root directory:

```powershell
pnpm install
```
This command resolves and links packages across `apps/*` and `packages/*`.

## 2. Environment Configuration

You need to set up environment variables for both the backend and frontend.

### Backend (`apps/api`)

Environment files have been automatically created from templates. If not, copy `apps/api/.env.example` to `apps/api/.env`.

The backend can connect to either a local PostgreSQL database or a managed Supabase database.

**To use Supabase (Default):**
In `apps/api/.env`, configure the following variables:
```env
USE_SUPABASE=true
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**To use Local PostgreSQL:**
In `apps/api/.env`, configure the following variables:
```env
USE_SUPABASE=false
DATABASE_URL=postgresql://username:password@localhost:5432/shramigo
```

Make sure to also set a random `SECRET_KEY`.

### Frontend (`apps/web`)

Ensure `apps/web/.env` exists (copy from `.env.example` if needed). It should point to the backend URL:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 3. Running the Backend

Open a terminal and navigate to the API directory:

```powershell
cd apps/api

# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the FastAPI server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. You can view the interactive API docs at `http://localhost:8000/docs`.

## 4. Running the Frontend

In a separate terminal, start the Vite development server:

```powershell
cd apps/web
pnpm run dev
```

The frontend will start, typically accessible at `http://localhost:5173`.
