# Security Notes

## Authentication and authorization

Public registration can create customer and worker accounts only. Admin accounts must be provisioned administratively and authenticate through `/api/auth/login`. Backend routes must never trust a role supplied by the browser; ownership and role checks are performed from the database user loaded from the token.

Access tokens contain `sub`, `role`, `iat`, `exp`, and `jti` claims. Access-token lifetime is configured through `ACCESS_TOKEN_EXPIRE_MINUTES` and defaults to 30 minutes. The current frontend stores the token in localStorage for compatibility, which means a future XSS vulnerability could expose it. Keep content handling strict and plan an HttpOnly cookie/refresh-session migration for deployments that support it.

Refresh tokens are opaque, hashed before database storage, short-lived relative to permanent credentials, rotated on refresh, and revoked on logout. A reused revoked token is rejected. Login attempts use shared Redis counters by IP and hashed email; Redis errors fail open to preserve availability and should be monitored.

## Configuration

Use a random `SECRET_KEY` of at least 32 characters. Never commit `.env` or provider credentials. Set `CORS_ORIGINS` to an explicit comma-separated allowlist in production; do not use wildcard origins with credentials.

## Business boundaries

Prices are calculated from the server-side service and worker-service records. Booking ownership is checked for customer and worker operations. Booking creation validates active/verified workers, service ownership, future time, availability, and interval overlap. Direct client requests cannot mark online payments paid; Razorpay checkout and webhook signatures must verify first. Worker coordinates are validated and only approximate distances/service areas are returned publicly.

## Operational checklist

Run behind HTTPS, disable debug mode, use PostgreSQL, apply Alembic migrations, restrict database access, rotate secrets, and monitor authentication failures, booking conflicts, and payment callbacks without logging passwords, tokens, or payment secrets.
