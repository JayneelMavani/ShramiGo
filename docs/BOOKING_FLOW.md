# Booking Flow

1. An authenticated customer chooses a worker service, date, time, duration, address, and payment method (`cash` or `razorpay`).
2. The backend verifies the customer, active and verified worker, active service, worker-service relationship, future time, configured weekday availability, and server-side price.
3. The worker row is locked where the database supports row locks. Existing active intervals are checked with `existing_start < requested_end` and `existing_end > requested_start`.
4. The booking and payment intent are persisted in one transaction, with a server-generated notification for the worker.
5. Cash bookings can be marked received only by the assigned worker or an admin; Razorpay bookings require provider verification.
6. Workers may transition bookings only through the defined lifecycle: pending, accepted, on_the_way, in_progress, completed, or permitted cancellation.
7. Customers may cancel only pending bookings under the current policy.
8. Reviews belong to completed bookings owned by the authenticated customer and are unique per booking.

A production deployment should use PostgreSQL transaction isolation/locking and add a database-level exclusion strategy for time ranges where supported.
