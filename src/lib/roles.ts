import type { UserRole } from "./train-data";

export function getCurrentRole(): UserRole {
  if (typeof window === "undefined") return "manager";
  return (sessionStorage.getItem("demo_role") as UserRole) || "manager";
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("demo_auth");
}

export function canEdit(): boolean {
  const role = getCurrentRole();
  return role === "manager";
}

export function canViewReports(): boolean {
  const role = getCurrentRole();
  return role === "analyst" || role === "director" || role === "manager";
}

export function canEditSettings(): boolean {
  return getCurrentRole() === "manager";
}

export function canCalculate(): boolean {
  const role = getCurrentRole();
  return role === "manager" || role === "analyst";
}
