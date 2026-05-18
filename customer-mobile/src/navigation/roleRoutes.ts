import type { UserRole } from "@/types/domain";

export function getRoleHomePath(role: string | null | undefined) {
  if (role === "technician") return "/technician/tasks";
  if (role === "customer") return "/customer";
  // Default to guest customer dashboard so the app opens in explore mode
  return "/customer";
}

export function isTechnicianRole(role: string | null | undefined): role is UserRole {
  return role === "technician";
}
