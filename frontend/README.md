# ShramiGo Frontend

Production-oriented React frontend for ShramiGo, built with React, TypeScript, Vite, Tailwind CSS, and React Router. It connects to the FastAPI backend through the REST API.

## Development

```powershell
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `frontend/.env` when the backend is not running at the default `http://localhost:8000`.

## Verification

```powershell
npm run typecheck
npm run build
```

The application contains separate customer, worker, and protected admin flows, AI-powered recommendations, profiles, worker services/pricing, bookings, payments, notifications, and service tracking.
