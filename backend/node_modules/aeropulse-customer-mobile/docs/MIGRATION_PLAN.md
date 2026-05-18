# Customer Mobile Migration Plan

## Customer modules detected in the web system

- Authentication: login, registration, OTP verification, forgot/reset password.
- Product catalog: browse public products, categories, search, product images.
- Cart: add/remove/update quantity, server session sync.
- Checkout: addresses, delivery selection, payment method, order submission.
- Orders: customer order list, order detail, tracking, summary, reorder.
- Notifications: unread counts, mark single/all as read.
- Profile and settings: profile details, saved addresses, preferences, privacy, password.
- Support: contact page, FAQ, service request creation.
- Location handling: address capture and branch-aware fulfillment.
- Technician-facing workflows: service requests, assigned tasks, task status updates.

## Reusable backend APIs

- `POST /api/auth/register/start`
- `POST /api/auth/register/verify`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/auth/session/cart`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/check-alias`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/products/public`
- `GET /api/products/:productId/image`
- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `GET /api/users/addresses`
- `POST /api/users/addresses`
- `PATCH /api/users/addresses/:addressId`
- `DELETE /api/users/addresses/:addressId`
- `PATCH /api/users/addresses/:addressId/default`
- `PATCH /api/users/settings`
- `PATCH /api/users/preferences`
- `PATCH /api/users/privacy`
- `PATCH /api/users/notifications`
- `PATCH /api/users/password`
- `POST /api/orders`
- `GET /api/orders/me`
- `GET /api/orders/me/summary`
- `GET /api/orders/me/:orderId`
- `GET /api/notifications/me`
- `PATCH /api/notifications/me/read-all`
- `PATCH /api/notifications/:id/read`
- `POST /api/service-requests/me`
- `GET /api/service-requests/me`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/accept`
- `PATCH /api/tasks/:taskId/status`
- `PATCH /api/tasks/:taskId`
- `GET /api/dashboard/me`

## Mobile-safe gaps

- Product search and pagination are not exposed as dedicated API capabilities.
- Push notifications are not wired for mobile delivery yet.
- Real-time order/task updates still need polling or a socket/SSE channel.
- Branch lookup by location is not exposed as a dedicated location endpoint.
- Image resizing variants are not exposed.

## Implementation phases

1. Foundation: Expo Router shell, auth storage, API client, theme, shared UI primitives.
2. Customer core: login/register, product browsing, cart, checkout, orders, notifications.
3. Customer account: profile, addresses, settings, support, history.
4. Technician role: login, assigned tasks, status updates, service history, notifications.
5. Mobile hardening: offline caching, pagination, push notifications, location helpers.