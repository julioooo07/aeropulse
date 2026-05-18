# AeroPulse Backend

Express + MongoDB backend API for web and future mobile clients.

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI` and `JWT_SECRET`
3. Install dependencies:
   - `npm install`
4. Seed demo users (optional):
   - `npm run seed`
5. Run backend:
   - `npm run dev`

## API Base URL

- `http://localhost:5000/api`

## Inventory Monitor (Low Stock Checker)

The backend runs an automatic inventory monitor on startup. It checks product stock periodically and creates in-app notifications for `superadmin` users when a product enters **Low**, **Critical**, or **Out of stock** states (with anti-spam: only on first trigger or severity escalation).

Optional env vars:

- `INVENTORY_MONITOR_ENABLED` (default `true`) — set to `false` to disable
- `INVENTORY_MONITOR_INTERVAL_MS` (default `60000`) — check interval in ms (min 10000)

SUPER ADMIN endpoints:

- `GET /api/inventory-alerts/settings`
- `PUT /api/inventory-alerts/settings` (body: `{ "defaultLowStockThreshold": 5, "defaultCriticalStockThreshold": 2 }`)
- `GET /api/inventory-alerts/alerts`
- `POST /api/inventory-alerts/alerts/:id/acknowledge`

## Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## User Endpoints (Bearer token required)

- `PATCH /api/users/profile`
- `PATCH /api/users/preferences`
- `PATCH /api/users/privacy`
- `PATCH /api/users/notifications`
- `PATCH /api/users/password`
- `DELETE /api/users/me`
