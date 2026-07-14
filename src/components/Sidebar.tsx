import { User, Users, LogOut, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  roleName: string;
  canAccessAdmin: boolean;
  onEditProfile: () => void;
  onManageUsers: () => void;
  onLogOut: () => void;
}

const menuItemClass =
  "w-full flex items-center gap-3 text-left bg-transparent border-none rounded-lg px-4 py-3 text-[var(--soc-text)] text-sm cursor-pointer hover:bg-[var(--soc-bg)] transition-colors";

export default function Sidebar({
  isOpen,
  onClose,
  displayName,
  roleName,
  canAccessAdmin,
  onEditProfile,
  onManageUsers,
  onLogOut,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[900] bg-[rgba(5,8,15,0.6)]"
      />

      {/* Sidebar panel */}
      <div
        className="
          fixed
          top-0
          right-0
          h-full
          w-[300px]
          bg-[var(--soc-card)]
          border-l
          border-[var(--soc-border)]
          z-[901]
          flex
          flex-col
          p-5
          shadow-2xl
        "
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="m-0 text-[var(--soc-text)] font-semibold text-sm">
              {displayName}
            </p>
            <p className="m-0 mt-0.5 text-xs text-[var(--soc-subtext)]">
              {roleName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[var(--soc-subtext)] cursor-pointer p-1 hover:text-[var(--soc-text)]"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 border-t border-[var(--soc-border)] pt-3">
          <button onClick={onEditProfile} className={menuItemClass}>
            <User size={16} className="text-[var(--soc-light-blue)]" />
            Edit Profile
          </button>

          {canAccessAdmin && (
            <button onClick={onManageUsers} className={menuItemClass}>
              <Users size={16} className="text-[var(--soc-green)]" />
              Manage Users
            </button>
          )}

          <button onClick={onLogOut} className={menuItemClass}>
            <LogOut size={16} className="text-[var(--soc-red)]" />
            Log Out
          </button>
        </nav>
      </div>
    </>
  );
}