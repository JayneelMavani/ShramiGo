# Payment Flow

Each booking creates a persisted payment intent. Cash bookings use `payment_method=cash`, remain `cash_pending`, and are confirmed by `PUT /api/bookings/{booking_id}/cash-received` from the assigned worker or an admin. Cash bookings never construct a Razorpay provider and work with no Razorpay credentials. Razorpay bookings use `payment_method=razorpay` and remain `pending` until a Razorpay order, verified checkout signature, signed webhook, and amount/currency match are recorded.

The old direct success mutation has been removed. The provider abstraction is implemented in `backend/app/services/payment/`; order creation is `POST /api/payments/bookings/{booking_id}/order`, checkout verification is `POST /api/payments/bookings/{booking_id}/verify`, and webhook confirmation is `POST /api/payments/webhook/razorpay`.

Provider settings are supplied through environment variables, including key ID, key secret, currency, and webhook secret. Never accept amount or payment status from the browser as authoritative. Webhook event IDs are unique and replay-safe.
