import { apiRequest } from "./api";

export function listMyNotifications() {
  return apiRequest<{ notifications: any[] }>("/notifications/me");
}

export function markNotificationRead(id: string) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return apiRequest("/notifications/me/read-all", { method: "PATCH" });
}
