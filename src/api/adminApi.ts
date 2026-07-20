import { supabase } from "../lib/supabaseClient.ts";
import type { RegisteredUser, Role, Permission } from "../types.ts";

export async function fetchUsers(): Promise<RegisteredUser[]> {
    const {data, error } = await supabase.rpc("list_users");
    if (error) throw error;
    return data as RegisteredUser[];
}

export async function fetchRoles(): Promise<Role[]> {
    const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, is_system, created_at")
    .order("name");
    if (error) throw error;
    return data as Role[];
}

export async function fetchPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase
    .from("permissions")
    .select("key, description")
    .order("key");
  if (error) throw error;
  return data as Permission[];
}

export async function fetchRolePermissionKeys(
  roleId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_key")
    .eq("role_id", roleId);
  if (error) throw error;
  return (data as { permission_key: string }[]).map((row) => row.permission_key);
}

export async function createRole(
  name: string,
  permissionKeys: string[],
): Promise<string> {
  const { data, error } = await supabase.rpc("create_role", {
    role_name: name,
    permission_keys: permissionKeys,
  });
  if (error) throw error;
  return data as string;
}

export async function updateRolePermissions(
  roleId: string,
  permissionKeys: string[],
): Promise<void> {
  const { error } = await supabase.rpc("update_role_permissions", {
    target_role_id: roleId,
    permission_keys: permissionKeys,
  });
  if (error) throw error;
}

export async function assignUserRole(
  userId: string,
  roleId: string,
): Promise<void> {
  const { error } = await supabase.rpc("assign_user_role", {
    target_user_id: userId,
    new_role_id: roleId,
  });
  if (error) throw error;
}

export async function createUser(
  email: string,
  password: string,
  displayName: string,
  roleId: string,
): Promise<{ id: string }> {
  const { data, error } = await supabase.functions.invoke("create-user", { body: { email, password, displayName, roleId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { id: string };
}