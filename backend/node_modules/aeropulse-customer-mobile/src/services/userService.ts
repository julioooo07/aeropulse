import { apiRequest } from "./api";

export function getProfile() {
  return apiRequest("/users/profile");
}

export function updateProfile(payload: Record<string, unknown>) {
  return apiRequest("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listAddresses() {
  return apiRequest("/users/addresses");
}

export function addAddress(payload: Record<string, unknown>) {
  return apiRequest("/users/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAddress(addressId: string, payload: Record<string, unknown>) {
  return apiRequest(`/users/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAddress(addressId: string) {
  return apiRequest(`/users/addresses/${addressId}`, { method: "DELETE" });
}

export function setDefaultAddress(addressId: string) {
  return apiRequest(`/users/addresses/${addressId}/default`, {
    method: "PATCH",
  });
}

export function updateSettings(payload: Record<string, unknown>) {
  return apiRequest("/users/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updatePreferences(payload: Record<string, unknown>) {
  return apiRequest("/users/preferences", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updatePrivacy(payload: Record<string, unknown>) {
  return apiRequest("/users/privacy", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateNotifications(payload: Record<string, unknown>) {
  return apiRequest("/users/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: Record<string, unknown>) {
  return apiRequest("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
