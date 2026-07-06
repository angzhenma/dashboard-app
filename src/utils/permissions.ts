import type { UserRole } from "../types";

const EDITOR_ROLES: UserRole[] = ["admin", "developer"];

export function canEditBoard(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return EDITOR_ROLES.includes(role);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
    return role === "admin";
}

export function roleLabel(role: UserRole | null | undefined): string {
    switch (role) {
        case "admin":
            return "Administrator";
        case "developer":
            return "Developer";
        case "analyst":
            return "Analyst";
        default:
            return "Unknown Role";
    }
}