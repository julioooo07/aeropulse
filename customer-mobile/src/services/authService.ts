import { apiRequest } from "./api";

export function login(identifier: string, password: string) {
  return apiRequest<{ token: string; user: unknown }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function register(payload: Record<string, unknown>) {
  return apiRequest<{ token: string; user: unknown }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startRegistration(email: string) {
  return apiRequest<{ secret: string; provisioningUri: string }>(
    "/auth/register/start",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function verifyRegistrationCode(payload: {
  email: string;
  code: string;
  secret: string;
}) {
  return apiRequest("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestOtp(payload: Record<string, unknown>) {
  return apiRequest("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyOtp(payload: Record<string, unknown>) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email: string) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(payload: Record<string, unknown>) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function getSession() {
  return apiRequest("/auth/session");
}

export function saveSessionCart(cart: unknown[]) {
  return apiRequest("/auth/session/cart", {
    method: "POST",
    body: JSON.stringify({ cart }),
  });
}

export function logout() {
  return apiRequest("/auth/logout", { method: "POST" });
}
