# ShramiGo Architecture Overview

ShramiGo is structured as a **pnpm monorepo** to cleanly separate frontend, backend, and shared domain logic.

## High-Level Monorepo Structure

```text
shramigo/
├── apps/
│   ├── web/           # React + Vite Frontend
│   └── api/           # Python + FastAPI Backend
│
├── packages/
│   ├── contracts/     # (Planned) Shared schemas and TypeScript types
│   ├── db/            # (Planned) Database logic / Drizzle schemas
│   ├── ai/            # (Planned) AI worker scoring logic
│   └── config/        # (Planned) Shared ESLint / Prettier configs
│
├── docs/              # System documentation
├── package.json       # Root monorepo configuration
└── pnpm-workspace.yaml# Workspace definition
```

### Apps Layer (`apps/`)

- **`web`**: The main customer and worker web application built with React, Vite, and Tailwind CSS. It communicates with the backend via REST API.
- **`api`**: The core backend system built with Python, FastAPI, and SQLAlchemy. It handles business logic, database persistence, and exposes RESTful endpoints. It supports both local PostgreSQL and managed Supabase databases.

### Packages Layer (`packages/`)

This directory is intended for shared libraries and infrastructure code that can be used across multiple apps. Currently, they are scaffolded to support a future migration toward a full TypeScript stack (e.g., sharing Zod schemas between frontend and a future TS API), though the backend is currently driven by Python.

## Core Runtime Flow

```text
                    CUSTOMER
                       │
                       ↓
                  React Web App (`apps/web`)
                       │
                       ↓
                  API Server (`apps/api`)
                       │
        ┌──────────────┼───────────────┐
        ↓              ↓               ↓
     Booking         Worker          Matching
     Service         Service         Engine
        │              │               │
        └──────────────┼───────────────┘
                       ↓
                Database (PostgreSQL)
             (Local or Supabase Managed)
```
