import { apiRequest } from "./api";

export function listMyServiceRequests() {
  return apiRequest<{ requests: any[] }>("/service-requests/me");
}

export function createMyServiceRequest(payload: Record<string, unknown>) {
  return apiRequest("/service-requests/me", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
