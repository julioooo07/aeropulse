import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { BRANCH_KEY, clearToken, getJson, getToken, removeMany, USER_KEY } from "./storage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  const activeBranch = await getJson(BRANCH_KEY, "");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeBranch) config.headers["X-Branch"] = activeBranch;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearToken();
      await removeMany([USER_KEY, BRANCH_KEY]);
    }
    const data = error?.response?.data;
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).join(" ") : "") ||
      error?.message ||
      "Request failed";
    const next = new Error(message);
    next.status = error?.response?.status || 0;
    next.data = data || null;
    next.fieldErrors = data?.errors || null;
    throw next;
  }
);

export const AuthApi = {
  login: ({ identifier, password, branch }) =>
    api.post("/auth/login", { identifier, email: identifier, password, branch, clientType: "mobile" }),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  requestOtp: (payload) => api.post("/auth/request-otp", payload),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPasswordWithCode: (payload) => api.post("/auth/reset-password", payload)
};

export const ProductsApi = {
  public: () => api.get("/products/public"),
  all: () => api.get("/products"),
  lowStock: () => api.get("/products/low-stock"),
  create: (payload) => api.post("/products", payload),
  update: (id, payload) => api.patch(`/products/${id}`, payload),
  addStock: (id, payload) => api.patch(`/products/${id}/stock`, payload)
};

export const OrdersApi = {
  create: (payload) => api.post("/orders", payload),
  mine: () => api.get("/orders/me"),
  summary: () => api.get("/orders/me/summary"),
  queue: () => api.get("/orders"),
  process: (id, action) => api.patch(`/orders/${id}/process`, { action })
};

export const UsersApi = {
  profile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.patch("/users/profile", payload),
  addresses: () => api.get("/users/addresses"),
  addAddress: (payload) => api.post("/users/addresses", payload),
  updateAddress: (id, payload) => api.patch(`/users/addresses/${id}`, payload),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/users/addresses/${id}/default`),
  updatePreferences: (payload) => api.patch("/users/preferences", payload),
  updateNotifications: (payload) => api.patch("/users/notifications", payload),
  list: (query = "") => api.get(`/users${query}`)
};

export const NotificationsApi = {
  mine: () => api.get("/notifications/me"),
  read: (id) => api.patch(`/notifications/${id}/read`),
  readAll: () => api.patch("/notifications/me/read-all")
};

export const DashboardApi = {
  me: () => api.get("/dashboard/me")
};

export const ServiceApi = {
  mine: () => api.get("/service-requests/me"),
  createMine: (payload) => api.post("/service-requests/me", payload),
  all: () => api.get("/service-requests"),
  updateStatus: (id, payload) => api.patch(`/service-requests/${id}/status`, payload)
};

export const TasksApi = {
  all: () => api.get("/tasks"),
  byId: (id) => api.get(`/tasks/${id}`),
  accept: (id) => api.patch(`/tasks/${id}/accept`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status })
};
