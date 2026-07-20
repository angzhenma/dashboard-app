export function hasPermission(
    permissions: string[] | null | undefined,
    key: string,
): boolean {
    if (!permissions) return false;
    return permissions.includes(key);
}

export function canEditBoard(permissions: string[] | null | undefined): boolean {
  return hasPermission(permissions, "board.edit");
}

export function canWriteThreatData(
    permissions: string[] | null | undefined,
): boolean {
    return hasPermission(permissions, "threats.write");
}

export function canViewUsers(permissions: string[] | null | undefined): boolean {
    return hasPermission(permissions, "users.view");
}

export function canManageUsers(permissions: string[] | null | undefined): boolean {
    return hasPermission(permissions, "users.manage");
}

export function canManageRoles(permissions: string[] | null | undefined): boolean {
    return hasPermission(permissions, "roles.manage");
}

export function isSuperAdmin(profile: { is_super_admin: boolean } | null | undefined): boolean {
    return profile?.is_super_admin === true;
}