# Module 1 — Integration & Verification Checklist

This module is the baseline verification pass for the current ShramiGo codebase.

## 1. Backend environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Create `backend/.env` from `.env.example` and set a real PostgreSQL connection string and a random `SECRET_KEY` (32+ characters).

## 2. Database

```powershell
cd backend
alembic upgrade head
alembic current
```

Expected migration head:

```text
4a1b2c3d4e5f
```

Seed the service catalogue:

```powershell
python -m app.seed_services
```

## 3. Backend automated tests

```powershell
cd backend
python -m compileall app
pytest
```

For the concurrency integration test, use a dedicated database named exactly `shramigo_test`:

```powershell
$env:TEST_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shramigo_test"
pytest
```

## 4. API smoke test

Start the API:

```powershell
cd backend
uvicorn app.main:app --reload
```

Verify:

- `GET http://localhost:8000/`
- `GET http://localhost:8000/api/health`
- `GET http://localhost:8000/api/ready`
- `GET http://localhost:8000/docs`

`/api/ready` must return HTTP 200 only when PostgreSQL is reachable.

## 5. Frontend verification

```powershell
cd frontend
npm install
npm run typecheck
npm run build
```

Set `frontend/.env` when needed:

```text
VITE_API_BASE_URL=http://localhost:8000
```

## 6. End-to-end functional checklist

### Customer

- Register/login
- View services
- Search workers
- Open worker details
- Use AI service recommendations
- Book a worker service
- Use current-location address lookup
- Choose cash or Razorpay
- Track booking status
- Receive notifications
- Edit profile and profile photo
- Review completed service

### Worker

- Register/login
- Edit profile and profile photo
- Add skills/services
- Set custom hourly charges
- Configure availability
- Receive booking request
- Accept booking
- Start driving / mark on-the-way
- Start service / mark in-progress
- Confirm cash received when applicable
- Complete service only after payment is settled
- View earnings and notifications

### Admin

- Admin login
- View dashboard statistics
- Manage users
- Activate/deactivate users
- Verify/unverify workers
- View bookings
- View reports/notifications

## 7. Security checks

- Public registration rejects the admin role.
- Passwords are stored as bcrypt hashes.
- Access uses JWT bearer tokens.
- Refresh tokens are stored only as SHA-256 hashes and rotated.
- Role checks are enforced by the backend.
- Booking pricing is calculated server-side.
- Customers cannot directly mark a payment successful.
- Razorpay signatures are verified by the backend.
- Cash completion requires worker/admin confirmation.
- CORS is configured from `CORS_ORIGINS`.

## 8. Static verification included in this repository

From the project root:

```powershell
python tools/verify_project.py
```

This checks required files, Python syntax, Alembic revision-chain integrity, and frontend package/lock consistency.
