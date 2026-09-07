# Profile editing and service completion flow

## Editable profiles
Customers and workers can update their saved profile information from their Profile page, including name, phone, address, city, state, pincode, bio/experience (worker), and profile photo. Profile photos are compressed in the browser and stored as a data URL in PostgreSQL.

After changing name or phone, the frontend refreshes the stored authenticated user details used by the dashboard.

## Service lifecycle
The booking has one authoritative status shared by customer and worker:

1. `pending` — waiting for worker acceptance.
2. `accepted` — worker accepted the request.
3. `on_the_way` — worker is travelling to the service location.
4. `in_progress` — worker has arrived and started the service.
5. `completed` — service and payment are complete.

For cash bookings, the worker confirms cash receipt while the booking is `in_progress`. Only after `payment_status=paid` can the worker press **Service Completed**. The backend rejects premature completion.

Customer tracking polls the booking every 5 seconds, so worker actions appear on the customer's tracking screen without a manual refresh.

## Database migration
After extracting the project and configuring `backend/.env`, run:

```powershell
cd backend
alembic upgrade head
```

This changes profile image columns from a 500-character string to PostgreSQL `TEXT`, allowing compressed profile photos to be stored safely for the MVP.
