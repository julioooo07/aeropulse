import { apiRequest } from "./api";

export function listTasks() {
  return apiRequest<{ tasks: any[] }>("/tasks");
}

export function getTaskById(taskId: string) {
  return apiRequest(`/tasks/${taskId}`);
}

export function acceptTask(taskId: string) {
  return apiRequest(`/tasks/${taskId}/accept`, { method: "PATCH" });
}

export function updateTaskStatus(taskId: string, status: string) {
  return apiRequest(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
