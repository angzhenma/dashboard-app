import { /*useCallback,*/ useEffect, useState } from "react";
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
  createRole,
  fetchRoles,
  fetchUsers,
  updateRolePermissions,
} from "../api/adminApi";
import { ArrowLeft, Plus, Shield, UsersIcon } from "lucide-react";

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

  useEffect(() => {
    let isMounted = true;

    async function startDataMigration() {
      setLoading(true);
      setError(null);
      try {
        const [rolesRes, permsRes] = await Promise.all([
          fetchRoles(),
          fetchPermissions(),
        ]);

        if (!isMounted) return;

        setRoles(rolesRes);
        setAllPermissions(permsRes);

        if (canSeeUsers) {
          const usersRes = await fetchUsers();
          if (isMounted) {
            setUsers(usersRes);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load admin data.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    startDataMigration();

    return () => {
      isMounted = false;
    };
  }, [canSeeUsers]);

  //   const loadAll = useCallback(async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const [rolesRes, permsRes] = await Promise.all([
  //         fetchRoles(),
  //         fetchPermissions(),
  //       ]);

  //       setRoles(rolesRes);
  //       setAllPermissions(permsRes);

  //       if (canSeeUsers) {
  //         setUsers(await fetchUsers());
  //       }
  //     } catch (err) {
  //       setError(
  //         err instanceof Error ? err.message : "Failed to load admin data.",
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, [canSeeUsers]);

  //   useEffect(() => {
  //     loadAll();
  //   }, [loadAll]);

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
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-transparent border border-[var(--soc-border)]
                    rounded-lg px-3.5 py-2 text-[var(--soc-subtext)] text-[13px] cursor-pointer gover:text-[var(--soc-text)]
                "
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>
        <div>
          <h1 className="m-0 text-[var(--soc-text)] font-bold text-2xl">
            Administration
          </h1>
          <p className="m-0 text[var(--soc-subtext)] text-sm">
            Manage registered users and role permissions
          </p>
        </div>
      </header>

      {error && (
        <p className="text-[var(--soc-red)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[var(--soc-subtext)] text-sm">Loading...</p>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Registered Users */}
          {canSeeUsers && (
            <section className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <UsersIcon size={18} className="text-[var(--soc-light-blue)]" />
                <h2 className="m-0 text-[var(--soc-text)] font-semibold text-lg">
                  Registered Users
                </h2>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-[var(--soc-subtext)] text-xs uppercase tracking-wider">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border[var(--soc-border)]"
                    >
                      <td className="py-2.5 pr-4 text-[var(--soc-text)]">
                        {u.display_name}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--soc-subtext)]">
                        {u.email}
                      </td>
                      <td className="py-2.5 pr-4">
                        {canEditUsers ? (
                          <select
                            value={u.role_id}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            className="bg-[var(--soc-bg)] border border-[var(--soc-border)] rounded-md px-2 py-1 text-[var(--soc-text)] text-sm"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[var(--soc-text)]">
                            {u.role_name}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-[var(--soc-subtext)]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Roles and Permissions */}
          <section className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[var(--soc-green)]" />
                <h2 className="m-0 text-[var(--soc-text)] font-semibold text-lg">
                  Roles and Permissions
                </h2>
              </div>
              {canEditRoles && (
                <button
                  onClick={() => setIsCreatingRole((v) => !v)}
                  className="flex items-center gap-1.5 bg-[var(--soc-blue)] text-[#090d16] rounded-lg px-3 py-1.5 text-sm font-medium"
                >
                  <Plus size={14} />
                  New Role
                </button>
              )}
            </div>

            {isCreatingRole && (
              <div className="mb-5 p-4 border border-[var(--soc-border)] rounded-lg bg-[var(--soc-bg)]">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Role name (e.g. Risk Management)"
                  className="w-full mb-3 bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-md px-3 py-2 text-[var(--soc-text)] text-sm"
                />
                <div className="flex flex-wrap gap-3 mb-3">
                  {allPermissions.map((p) => (
                    <label
                      key={p.key}
                      className="flex items-center gap-1.5 text-sm text-[var(--soc-text)]"
                    >
                      <input
                        type="checkbox"
                        checked={newRoleKeys.has(p.key)}
                        onChange={() => toggleNewRoleKey(p.key)}
                      />
                      {p.description}
                    </label>
                  ))}
                </div>
                <button
                  onClick={submitNewRole}
                  className="bg-[var(--soc-green)] text-[#090d16] rounded-lg px-4 py-1.5 text-sm font-medium"
                >
                  Create Role
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="border border-[var(--soc-border)] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="m-0 text-[var(--soc-text)] font-medium">
                        {role.name}
                        {role.is_system && (
                          <span className="ml-2 text-xs text-[var(--soc-subtext)]">
                            (built-in)
                          </span>
                        )}
                      </p>
                      {role.description && (
                        <p className="m-0 mt-1 text-xs text-[var(--soc-subtext)]">
                          {role.description}
                        </p>
                      )}
                    </div>
                    {canEditRoles && !role.is_system && (
                      <button
                        onClick={() => startEditingRole(role)}
                        className="text-xs text-[var(--soc-light-blue)] underline"
                      >
                        Edit Permissions
                      </button>
                    )}
                  </div>

                  {editingRoleId === role.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--soc-border)]">
                      <div className="flex flex-wrap gap-3 mb-3">
                        {allPermissions.map((p) => (
                          <label
                            key={p.key}
                            className="flex items-center gap-1.5 text-sm text-[var(--soc-text)]"
                          >
                            <input
                              type="checkbox"
                              checked={editingKeys.has(p.key)}
                              onChange={() => toggleEditingKey(p.key)}
                            />
                            {p.description}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveRoleEdits}
                          className="bg-[var(--soc-green)] text-[#090d16] rounded-lg px-4 py-1.5 text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRoleId(null)}
                          className="bg-transparent border border-[var(--soc-border)] text-[var(--soc-subtext)] rounded-lg px-4 py-1.5 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
