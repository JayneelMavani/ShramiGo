# ShramiGo Architecture

ShramiGo has a React/Vite/TypeScript frontend and a FastAPI/SQLAlchemy backend backed by PostgreSQL in production.

- `frontend/src/App.tsx` owns the browser route tree.
- `frontend/src/services/` contains the API client and domain clients.
- `backend/app/routers/` exposes HTTP endpoints.
- `backend/app/schemas/` contains authoritative request/response validation.
- `backend/app/models/` contains SQLAlchemy persistence models.
- `backend/alembic/` contains schema migrations.

Authentication is bearer-token based for compatibility with the current client. The backend loads the user from the token subject, checks account state, and enforces role ownership on protected resources. Frontend guards are a user-experience layer only.

Refresh sessions are stored as hashed opaque tokens in `refresh_tokens`; refresh rotates and revokes the previous token. Redis provides shared login rate-limit counters. Razorpay is accessed through `backend/app/services/payment/` rather than from booking business logic.

Money is stored with SQLAlchemy `Numeric` and represented as `Decimal`. Booking `subtotal` is the service amount, `service_charge` is the platform fee, `total_amount` is the customer total, and `worker_payout` is the worker settlement amount.

Nearby discovery uses validated worker/customer coordinates and a Haversine calculation. PostgreSQL/PostGIS is intentionally deferred because the current MVP needs portable SQLAlchemy/PostgreSQL deployment without a PostGIS operational dependency; the endpoint and profile fields are ready for a future spatial index migration.

Timestamps are stored in UTC-style naive database columns for compatibility with the existing schema. Booking date/time validation uses the server's configured UTC interpretation; a future migration should make timezone-aware columns explicit if local-time booking is required.
