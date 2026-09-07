# API Surface

Health:

- `GET /api/health`
- `GET /api/ready`

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Core protected resources include profiles, worker services/availability, bookings, reviews, notifications, and admin resources. Admin endpoints under `/api/admin` require an authenticated user with role `admin`.

Booking creation is `POST /api/bookings`; booking retrieval is ownership-scoped. Worker lifecycle changes use `PUT /api/bookings/{booking_id}/status`. The legacy direct payment-success endpoint now rejects unverified success claims; provider order/verification endpoints must be added when payment credentials are configured.
