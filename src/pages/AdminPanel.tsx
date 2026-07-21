// deno-lint-ignore-file jsx-button-has-type
import { /*useCallback,*/ useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.ts";
import type { Permission, Role, RegisteredUser } from "../types.ts";
import {
  canManageRoles,
  canManageUsers,
  canViewUsers,
  isSuperAdmin,
} from "../utils/permissions.ts";
import {
  assignUserRole,
  fetchPermissions,
  fetchRolePermissionKeys,
  createRole,
  fetchRoles,
  fetchUsers,
  updateRolePermissions,
  createUser,
} from "../api/adminApi.ts";
import {
  AlertTriangle,
  ArrowLeft,
  Plus,
  Shield,
  UserPlus,
  UsersIcon,
} from "lucide-react";

const cardClass =
  "bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5";

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const { session, profile, permissions, refreshProfile } = useAuth();
  const actingIsSuperAdmin = isSuperAdmin(profile);
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

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserDisplayName, setNewUserDisplayName] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState("");
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const [pendingSuperAdminPromotion, setPendingSuperAdminPromotion] = useState<{
    userId: string;
    userName: string;
    roleId: string;
  } | null>(null);
  const [pendingSuperAdminCreation, setPendingSuperAdminCreation] = useState<{
    email: string;
    password: string;
    displayName: string;
    roleId: string;
  } | null>(null);

  const canSeeUsers = canViewUsers(permissions);
  const canEditUsers = canManageUsers(permissions);
  const canEditRoles = canManageRoles(permissions);

  const loadAllData = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeUsers]);

  const applyRoleChange = async (userId: string, roleId: string) => {
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
                role_is_super_admin:
                  roles.find((r) => r.id === roleId)?.is_super_admin ?? false,
              }
            : u,
        ),
      );
      refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role.");
    }
  };

  const handleRoleChange = (
    userId: string,
    userName: string,
    roleId: string,
  ) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (targetRole?.is_super_admin) {
      setPendingSuperAdminPromotion({ userId, userName, roleId });
      return;
    }
    applyRoleChange(userId, roleId);
  };

  const canChangeUserRole = (target: RegisteredUser): boolean => {
    if (!canEditUsers) return false;
    if (!target.role_is_super_admin) return true;
    if (!actingIsSuperAdmin) return false;
    return target.id === session?.user.id;
  };

  const resetCreateUserForm = () => {
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserDisplayName("");
    setNewUserRoleId("");
  };

  const applyCreateUser = async (
    email: string,
    password: string,
    displayName: string,
    roleId: string,
  ) => {
    setIsSubmittingUser(true);
    setError(null);
    try {
      await createUser(email, password, displayName, roleId);
      resetCreateUserForm();
      setIsCreatingUser(false);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleCreateUser = () => {
    if (
      !newUserEmail ||
      !newUserPassword ||
      !newUserDisplayName ||
      !newUserRoleId
    ) {
      setError("All fields are required to create a user.");
      return;
    }
    if (newUserPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const targetRole = roles.find((r) => r.id === newUserRoleId);
    if (targetRole?.is_super_admin) {
      setPendingSuperAdminCreation({
        email: newUserEmail,
        password: newUserPassword,
        displayName: newUserDisplayName,
        roleId: newUserRoleId,
      });
      return;
    }

    applyCreateUser(
      newUserEmail,
      newUserPassword,
      newUserDisplayName,
      newUserRoleId,
    );
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
      <header className="flex items-center gap-4 pb-6 mb-8 border-b border-[var(--soc-border)]">
        <button
          onClick={onBack}
          className="flex items-center py-2 text-[var(--soc-text)] cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="m-0 text-[var(--soc-text)] font-bold text-2xl">
            Administration
          </h1>
          <p className="m-0 text-[var(--soc-subtext)] text-sm">
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UsersIcon
                    size={18}
                    className="text-[var(--soc-light-blue)]"
                  />
                  <h2 className="m-0 text-[var(--soc-text)] font-semibold text-lg">
                    Registered Users
                  </h2>
                </div>
                {actingIsSuperAdmin && (
                  <button
                    onClick={() => setIsCreatingUser((v) => !v)}
                    className="flex items-center gap-1.5 bg-[var(--soc-blue)] text-[#090d16] rounded-lg px-3 py-1.5 text-sm font-medium"
                  >
                    <UserPlus size={14} />
                    Create User
                  </button>
                )}
              </div>

              {isCreatingUser && (
                <div className="mb-5 p-4 border border-[var(--soc-border)] rounded-lg bg-[var(--soc-bg)] flex flex-col gap-3">
                  <input
                    type="text"
                    value={newUserDisplayName}
                    onChange={(e) => setNewUserDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-md px-3 py-2 text-[var(--soc-text)] text-sm"
                  />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Email"
                    className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-md px-3 py-2 text-[var(--soc-text)] text-sm"
                  />
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Initial password (min. 8 characters)"
                    className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-md px-3 py-2 text-[var(--soc-text)] text-sm"
                  />
                  <select
                    value={newUserRoleId}
                    onChange={(e) => setNewUserRoleId(e.target.value)}
                    className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-md px-3 py-2 text-[var(--soc-text)] text-sm"
                  >
                    <option value="" disabled>
                      Assign role...
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--soc-subtext)] m-0">
                    The new user can change their display name and password
                    themselves after logging in.
                  </p>
                  <button
                    onClick={handleCreateUser}
                    disabled={isSubmittingUser}
                    className="bg-[var(--soc-green)] text-[#090d16] rounded-lg px-4 py-1.5 text-sm font-medium disabled:opacity-50 self-start"
                  >
                    {isSubmittingUser ? "Creating..." : "Create User"}
                  </button>
                </div>
              )}

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-[var(--soc-text)] text-xs uppercase tracking-wider">
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
                      className="border-t border-[var(--soc-border)]"
                    >
                      <td className="py-2.5 pr-4 text-[var(--soc-subtext)]">
                        {u.display_name}
                        {u.role_is_super_admin && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--soc-yellow)] border border-[var(--soc-yellow)] rounded px-1.5 py-0.5">
                            Super Admin
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--soc-subtext)]">
                        {u.email}
                      </td>
                      <td className="py-2.5 pr-4">
                        {canChangeUserRole(u) ? (
                          <select
                            value={u.role_id}
                            onChange={(e) =>
                              handleRoleChange(
                                u.id,
                                u.display_name,
                                e.target.value,
                              )
                            }
                            className="bg-[var(--soc-bg)] rounded-md py-1 text-[var(--soc-text)] text-sm"
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

      {pendingSuperAdminPromotion && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,8,15,0.85)]">
          <div className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-lg p-7 w-full max-w-[480px]">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-[var(--soc-yellow)]" />
              <h3 className="m-0 text-[var(--soc-text)] font-semibold text-lg">
                Confirm Super Admin Promotion
              </h3>
            </div>
            <p className="text-sm text-[var(--soc-subtext)]">
              This will make{" "}
              <span className="text-[var(--soc-text)] font-medium">
                {pendingSuperAdminPromotion.userName}
              </span>{" "}
              a Super Admin. Once applied, this change can only be reversed by{" "}
              {pendingSuperAdminPromotion.userName} themselves — no other admin
              or super admin will be able to change their role.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  applyRoleChange(
                    pendingSuperAdminPromotion.userId,
                    pendingSuperAdminPromotion.roleId,
                  );
                  setPendingSuperAdminPromotion(null);
                }}
                className="bg-[var(--soc-yellow)] text-[#090d16] rounded-lg px-4 py-2 text-sm font-medium"
              >
                Confirm Promotion
              </button>
              <button
                onClick={() => setPendingSuperAdminPromotion(null)}
                className="bg-transparent border border-[var(--soc-border)] text-[var(--soc-subtext)] rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingSuperAdminCreation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,8,15,0.85)]">
          <div className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-lg p-7 w-full max-w-[480px]">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-[var(--soc-yellow)]" />
              <h3 className="m-0 text-[var(--soc-text)] font-semibold text-lg">
                Confirm Super Admin Creation
              </h3>
            </div>
            <p className="text-sm text-[var(--soc-subtext)]">
              This will create{" "}
              <span className="text-[var(--soc-text)] font-medium">
                {pendingSuperAdminCreation.displayName}
              </span>{" "}
              directly as a Super Admin. Once created, only they will be able to
              change their own role — no other admin or super admin will be able
              to.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  applyCreateUser(
                    pendingSuperAdminCreation.email,
                    pendingSuperAdminCreation.password,
                    pendingSuperAdminCreation.displayName,
                    pendingSuperAdminCreation.roleId,
                  );
                  setPendingSuperAdminCreation(null);
                }}
                className="bg-[var(--soc-yellow)] text-[#090d16] rounded-lg px-4 py-2 text-sm font-medium"
              >
                Confirm Creation
              </button>
              <button
                onClick={() => setPendingSuperAdminCreation(null)}
                className="bg-transparent border border-[var(--soc-border)] text-[var(--soc-subtext)] rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
