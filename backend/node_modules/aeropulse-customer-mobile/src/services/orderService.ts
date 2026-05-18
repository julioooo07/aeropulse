import { apiRequest } from "./api";

export function createOrder(payload: Record<string, unknown>) {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listMyOrders() {
  return apiRequest<{ orders: any[] }>("/orders/me");
}

export function getMyOrderSummary() {
  return apiRequest("/orders/me/summary");
}

export function getMyOrderById(orderId: string) {
  return apiRequest(`/orders/me/${orderId}`);
}
