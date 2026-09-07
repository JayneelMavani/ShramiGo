## Production services

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` from Razorpay test or live mode. Register `POST /api/payments/webhook/razorpay` in Razorpay Dashboard. The browser may create a checkout and submit the provider response, but the backend verifies both the checkout signature and webhook before marking a payment paid.

Set `REDIS_URL` to a shared Redis instance for login throttling. When Redis is unavailable the application fails open for availability, so production monitoring should alert on Redis failures.

Use `POST /api/auth/refresh` to rotate refresh tokens and `POST /api/auth/logout` to revoke one. Raw refresh tokens are never stored in the database.
# ShramiGo Backend

Backend scaffold for the ShramiGo application.
