# AeroPulse Mobile Analysis Report

## Revised Mobile Scope

This mobile app is now scoped to:

- Customer POS
- Customer account and order tracking
- Technician work orders

Admin and super admin modules are intentionally not included in the mobile app. Those roles should continue using the existing web system.

## Existing Web Modules Detected

- Authentication and session persistence
- Customer registration, login, password recovery, OTP endpoints
- Customer product shop/POS
- Cart and checkout
- Saved delivery addresses
- Order creation, receipts, order history, and tracking
- Notifications
- Customer service requests
- Technician task/work-order board
- Technician task accept/status update flow
- Branch routing and branch-scoped task access
- Product inventory and stock deduction logic used indirectly by checkout

## Backend API Mapping Used By Mobile

- `POST /api/auth/login`: mobile sends `clientType: "mobile"` plus optional technician branch.
- `POST /api/auth/register`: customer registration with billing address.
- `GET /api/auth/me`: persistent login bootstrap.
- `POST /api/auth/logout`: session logout.
- `POST /api/auth/forgot-password`: password recovery.
- `GET /api/products/public`: customer POS catalog.
- `POST /api/orders`: checkout/order creation.
- `GET /api/orders/me`: customer order history.
- `GET /api/orders/me/summary`: customer dashboard counts.
- `GET /api/users/addresses`: saved addresses.
- `POST /api/users/addresses`: add delivery address.
- `PATCH /api/users/addresses/:addressId/default`: default address support.
- `GET /api/notifications/me`: notification inbox.
- `PATCH /api/notifications/:id/read`: mark one read.
- `PATCH /api/notifications/me/read-all`: mark all read.
- `GET /api/service-requests/me`: customer service requests.
- `POST /api/service-requests/me`: create service request.
- `GET /api/tasks`: technician work orders, branch/auth scoped by backend.
- `GET /api/tasks/:taskId`: work-order details.
- `PATCH /api/tasks/:taskId/accept`: technician accepts task.
- `PATCH /api/tasks/:taskId/status`: technician marks status.

## Database Mapping

- `User`: customer and technician accounts, branch assignment, addresses, preferences, lockout, password reset.
- `Product`: public catalog, SKU, price, branch stock, stock thresholds. Mobile reads public products; backend handles stock.
- `Order`: customer order, items, address snapshot, receipt, tracking number, branch routing, workflow status.
- `Notification`: user-scoped customer and technician messages.
- `ServiceRequest`: customer maintenance requests.
- `Task`: technician work orders with branch scope, status, customer/address fields, order payload.
- `InventoryTransaction`: stock deduction/addition logs created by backend during order and stock workflows.

## Mobile Feature Compatibility

- Directly translated: login, customer registration, shop, cart, checkout, order tracking, notifications, addresses, service request list/create, technician task list, accept task, complete task.
- Adapted for mobile: desktop shop sidebar becomes chips/search; cart sidebar becomes full screen; checkout columns become stacked cards; technician work orders use bottom tabs and compact task cards.
- Deferred for later mobile expansion: QR unit service logs, parts request workflow, offline task completion queue, push notifications, map routing.

## Mobile Architecture

- `src/services`: API client and storage.
- `src/state`: auth and cart contexts.
- `src/navigation`: customer/technician-only role navigation.
- `src/screens/customer`: POS and account flows.
- `src/screens/technician`: technician home, work orders, work-order details, profile.
- `src/components`: reusable cards, screen wrapper, loading/empty/error states.
- `src/domain`: purchase totals and branch routing copied from web logic.

## Setup

1. Start the existing backend.
2. In `mobile/app.json`, set `expo.extra.apiBaseUrl` to the reachable backend URL.
3. For Android emulator use `http://10.0.2.2:5000/api`; for a real phone use your computer LAN IP.
4. From `mobile`, run `npm install`, then `npm start`.
