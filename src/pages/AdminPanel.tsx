import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import type { Permission, Role, RegisteredUser } from "../types";
import {
  canManageRoles,
  canManageUsers,
  canViewUsers,
} from "../utils/permissions";
import {
  assignUserRole,
  fetchPermissions,
  fetchRolePermissionKeys,
  fetchRoles,
  fetchUsers,
  updateRolePermissions,
} from "../api/adminApi";

const cardClass =
  "bg-[var(--soc-card)] border border-[var(--soc-border)] rpunded-xl p-5";

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const { permissions, refreshProfile } = useAuth();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingKeys, setEditingKeys] = useState<Set<string>>(new Set());

  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleKeys, setNewRoleKeys] = useState<Set<string>>(new Set());

  const canSeeUsers = canViewUsers(permissions);
  const canEditUsers = canManageUsers(permissions);
  const canEditRoles = canManageRoles(permissions);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetchRoles(),
        fetchPermissions(),
      ]);
      setRoles(rolesRes);
      setAllPermissions(permsRes);

      if (canSeeUsers) {
        setUsers(await fetchUsers());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin data.",
      );
    } finally {
      setLoading(false);
    }
  }, [canSeeUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await assignUserRole(userId, roleId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role_id: roleId,
                role_name:
                  roles.find((r) => r.id === roleId)?.name ?? u.role_name,
              }
            : u,
        ),
      );
      refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role.");
    }
  };

  const startEditingRole = async (role: Role) => {
    setEditingRoleId(role.id);
    setEditingKeys(new Set(await fetchRolePermissionKeys(role.id)));
  };

  const toggleEditingKey = (key: string) => {
    setEditingKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const saveRoleEdits = async () => {
    if (!editingRoleId) return;
    try {
      await updateRolePermissions(editingRoleId, Array.from(editingKeys));
      setEditingRoleId(null);
      refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to update role.");
    }
  };

  const toggleNewRoleKey = (key: string) => {
    setNewRoleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submitNewRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await createRole(newRoleName.trim(), Array.from(newRoleKeys));
      setNewRoleName("");
      setNewRoleKeys(new Set());
      setIsCreatingRole(false);
      const rolesRes = await fetchRoles();
      setRoles(rolesRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role.");
    }
  };

  return (
    <div className="bg-[var(--soc-background)] my-0 mx-auto min-h-screen p-10">
        <header className="flex items-ceneter gap-4 pb-6 mb-8 border-b border-[var(--soc-border)]">
            
        </header>
    </div>
  );
}
