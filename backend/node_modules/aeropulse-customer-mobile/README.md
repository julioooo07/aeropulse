# AeroPulse Customer Mobile

Fresh Expo/React Native mobile app for the customer-side POS workflow, plus a technician role in place of the old admin/superadmin mobile ideas.

## What this folder is

- A separate mobile codebase inside the main project.
- Isolated from the web frontend and existing mobile experiments.
- Connected to the same backend API surface used by the web app.

## What is already planned from the web system

- Customer auth, OTP, password reset, and session bootstrap.
- Product catalog browsing, category filtering, and image loading.
- Cart and checkout flow.
- Customer orders, order status tracking, and notifications.
- Profile, settings, address management, and support/service requests.
- Technician tasks, status updates, service history, and notifications.

## What is intentionally not included

- Admin dashboard.
- Super admin dashboard.
- Inventory management screens.
- Analytics and reporting views.

## How to set up locally

1. Open this folder as its own project.
2. Run `npm install`.
3. Set `EXPO_PUBLIC_API_BASE_URL` if your backend is not on `http://10.0.2.2:5000/api`.
4. Start with `npm run start`.

## Notes

- Token storage uses `expo-secure-store`.
- Cart state is kept client-side and can be synced to the backend session when available.
- Missing mobile-safe backend capabilities are documented in [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md).