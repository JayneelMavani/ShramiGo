# ShramiGo Implementation Plan

## Audit Baseline

The repository is an MVP consisting of a FastAPI/SQLAlchemy backend and a React/Vite/TypeScript frontend. Authentication and role data exist on the backend, but the frontend still has unguarded routes and a frontend-only admin login. The backend creates tables at startup, stores money as floating point values, allows incomplete booking validation, and treats a customer payment request as payment success. Several admin/report screens use fixture data.

## Prioritized Work Plan

| Issue | Severity | Affected files | Proposed solution | Dependencies | Testing strategy | Migration requirements |
| --- | --- | --- | --- | --- | --- | --- |
| Configuration uses weak defaults, hardcoded API URL, and startup `create_all` | Critical | `backend/app/core/config.py`, `backend/app/main.py`, `backend/.env.example`, `frontend/src/services/api.ts`, `.gitignore` | Require environment-driven settings, validate production secrets, configure CORS from a list, use `VITE_API_BASE_URL`, add health/readiness endpoints, and remove schema creation from import/startup | Settings validation; migration tooling | Import/startup tests, config validation, frontend build | Add Alembic and an initial schema migration; document upgrade path from existing tables |
| Admin login and frontend route access are not protected | Critical | `frontend/src/pages/Admin/Login.tsx`, `frontend/src/App.tsx`, frontend auth services; `backend/app/dependencies.py`, admin router | Authenticate admin credentials through backend, add reusable authenticated/role guards, preserve backend role checks, and clear state on logout/401 | Existing JWT auth; centralized auth state | API auth tests; route guard tests/build | No schema change unless session/revocation is added |
| JWT/password/session hardening is incomplete | High | `backend/app/core/security.py`, `backend/app/routers/auth.py`, `backend/app/schemas/auth.py`, config | Add `iat`/`jti`, short access-token lifetime, strong password validation, consistent role validation, safe error handling, and document localStorage tradeoff; add rate-limit hook/storage where practical | Environment secrets; optional refresh/session table | Token claim tests, invalid/expired token tests, login failure tests | Optional refresh-session/revocation table if implemented |
| Booking creation accepts unsafe/incomplete requests | Critical | `backend/app/routers/bookings.py`, `backend/app/models/booking.py`, `backend/app/models/worker_availability.py`, booking schemas | Require service, validate future date/time, active/verified worker eligibility, service ownership, duration, availability, timezone, server-side price, and ownership | Availability model; Decimal money model | Integration tests for invalid date/service/price/eligibility/availability | Add constraints/indexes and availability uniqueness/overlap migration |
| Double booking is possible | Critical | `backend/app/routers/bookings.py`, booking model/database | Use interval overlap checks inside a transaction with row locking where supported; reject conflicts and define SQLite/test fallback; index worker/date/status | Database transaction semantics | Conflict and concurrent booking tests | Add booking indexes and, where supported, exclusion/locking strategy |
| Booking state transitions are incomplete | High | `backend/app/routers/bookings.py`, booking schemas, frontend booking actions | Define explicit transition table and actor permissions for customer, worker, and admin; prevent frontend status authority | Booking service/domain rules | Every valid and invalid transition; ownership tests | Add lifecycle timestamps if needed |
| Money and payment records are not production-safe | Critical | `backend/app/models/booking.py`, `payment.py`, service/worker-service models, schemas, payment router/UI | Convert currency fields to `Decimal`/`Numeric`, separate service amount/platform fee/customer total/worker payout, persist payment records, validate methods and amounts | Migration; payment abstraction | Decimal calculation tests; schema serialization tests | Alter numeric columns and add payment provider/idempotency fields/indexes |
| Payment endpoint simulates success | Critical | `backend/app/routers/bookings.py`, payment model, frontend `Payment.tsx` | Replace direct success mutation with provider abstraction, order creation, verification/webhook endpoints, idempotency, sandbox configuration, and explicit cash flow; never claim paid without verification | Razorpay-compatible environment variables; provider SDK or signed adapter | Signature, amount, replay/idempotency, failed-payment tests | Add payment states/provider identifiers/unique constraints |
| Notifications can be lost and errors are swallowed | High | `backend/app/routers/bookings.py`, `notifications.py` | Create notifications in the same transaction or a reliable post-commit mechanism; remove silent exception swallowing and return safe diagnostics | Transaction boundary | Notification creation assertions for booking/status/payment events | Add indexes on user/read/created fields |
| Admin screens contain fixture metrics and weak reporting | High | `frontend/src/pages/Admin/Reports.tsx`, admin pages/services; `backend/app/routers/admin.py` | Add real dashboard/report APIs with date/status filters and pagination; show explicit load errors/retry; remove fallback records and calculate active/revenue metrics correctly | Decimal serialization; query indexes | Admin authorization/API tests; frontend build and error-state tests | Add indexes; no fake-data migration |
| Worker/customer location and discovery are incomplete | Medium | worker/customer profile models/schemas/routers, discovery UI/API | Store coordinates/address fields, calculate Haversine distance server-side, add service/availability/rating/price filters and pagination, avoid exposing precise private coordinates | Profile migration; privacy policy | Distance/filter/ownership tests | Add nullable location columns and indexes |
| Reviews, profile access, and worker verification need tighter ownership | High | review/workers/profile routers/models | Require completed owned booking, unique review, bounded content/rating, verified/eligible workers, and avoid public contact exposure | Existing relationships | Authorization and duplicate-review tests | Add unique review and lookup indexes |
| Frontend API/routing/error handling is duplicated | High | `frontend/src/App.tsx`, routes, services, pages | Centralize API/auth behavior, add `ProtectedRoute`/`RoleGuard`, replace important `alert()` uses with reusable error UI/toasts, add loading/empty/error/retry states | Existing React Router | `tsc -b`, Vite build, focused route/component tests if test runner added | None |
| Test, migration, and deployment documentation is missing | High | `backend`, `frontend/package.json`, README, `docs/` | Add pytest integration coverage, frontend test/typecheck/lint scripts where practical, Alembic, architecture/security/API/booking/payment docs, health checks, and final audit | Test dependencies and configured database | `python -m compileall`, `pytest`, npm lint/typecheck/build | Initial and incremental migrations must run from clean database |

## Implementation Sequence

1. Environment/configuration, health checks, and migration scaffolding.
2. Backend authentication hardening plus real admin login and frontend guards.
3. Numeric money model and migration.
4. Booking validation, availability, overlap protection, and state machine.
5. Payment provider abstraction, verification, webhook/idempotency, and financial ledger.
6. Notification transaction handling, reviews, verification, and location discovery.
7. Real admin APIs/screens and removal of fixture data.
8. Frontend API/routing/error-state cleanup and accessibility improvements.
9. Backend/frontend tests, documentation, clean-install verification, and final audit.

## Validation Gates

- Backend: `python -m compileall backend/app`, `pytest` with configured test database.
- Frontend: `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Migration: apply migrations to a clean database and upgrade an existing schema without data loss.
- Security: verify unauthenticated, wrong-role, cross-user, replayed-payment, and invalid-transition requests are rejected.
- Workflow: exercise customer registration/login/search/booking/payment/review, worker acceptance/status/earnings, and admin login/reports/manage flows with real database records.

## Assumptions and External Dependencies

- PostgreSQL is the production database and UTC storage with an explicit configured application timezone will be used.
- Payment production verification requires provider credentials; sandbox mode will be explicit and will never mark a payment paid without a verifiable sandbox/provider result.
- Existing database deployments may require a reviewed data migration for float-to-numeric conversion and nullable-to-required service IDs.
- Frontend localStorage JWT storage is retained only as an interim compatibility measure unless the existing deployment can support secure HttpOnly cookie sessions; the tradeoff will be documented.
