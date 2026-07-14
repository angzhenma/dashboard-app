import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Check, Lock, User } from "lucide-react";

const inputClass =
  "w-full bg-[var(--soc-bg)] border border-[var(--soc-border)] rounded-md px-3 py-2 text-[var(--soc-text)] text-sm outline-none focus:border[var(--soc-blue)] disabled:opacity-60";

export default function EditProfile({ onBack }: { onBack: () => void }) {
  const { session, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!session?.user.id || !displayName.trim()) return;
    setIsSavingName(true);
    setNameError(null);
    setNameMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", session.user.id);
      if (error) throw error;
      await refreshProfile();
      setNameMessage("Display name updated successfully.")
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : "Failed to update display name.",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordError("Password must be longer than 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Password confirmation must match new passowrd.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="bg-[var(--soc-bg)] my-0 mx-auto min-h-screen p-10">
      <header className="flex items-center gap-4 pb-6 mb-8 border-b border-[var(--soc-border)]">
        <button
          onClick={onBack}
          className="flex items-center py-2 text-[var(--soc-text)] cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="m-0 text-[var(--soc-text)] font-bold text-2xl">
            Edit Profile
          </h1>
          <p className="m-0 text-[var(--soc-subtext)] text-sm">
            Manage your account details
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 max-w-md">
        <section className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-[var(--soc-light-blue)]" />
            <h2 className="m-0 text-[var(--soc-text)] font-semibold text-base">
              Display Name
            </h2>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSavingName}
            className={inputClass}
          />
          <p className="mt-2 text-xs text-[var(--soc-subtext)]">
            Email: {session?.user.email} &middot; Role: {profile?.role_name}
          </p>
          {nameError && (
            <p className="mt-2 text-sm text-[var(--soc-red)]">{nameError}</p>
          )}
          {nameMessage && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--soc-green)]">
              <Check size={14} />
              {nameMessage}
            </p>
          )}
          <button
            onClick={handleSaveName}
            disabled={isSavingName || !displayName.trim()}
            className="mt-3 bg-[var(--soc-blue)] text-[var(--soc-bg)] rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isSavingName ? "Saving..." : "Save Name"}
          </button>
        </section>

        <section className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-[var(--soc-yellow)]" />
            <h2 className="m-0 text-[var(--soc-text)] font-semibold text-base">
              Password
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSavingPassword}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSavingPassword}
              className={inputClass}
            />
            {passwordError && (
              <p className="mt-2 text-sm text-[var(--soc-red)]">
                {passwordError}
              </p>
            )}
            {passwordMessage && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--soc-green)]">
                <Check size={14} />
                {passwordMessage}
              </p>
            )}
            <button
              onClick={handleSavePassword}
              disabled={isSavingPassword || !newPassword || !confirmPassword}
              className="mt-3 bg-[var(--soc-blue)] text-[var(--soc-bg)] rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isSavingPassword ? "Saving.." : "Update Password"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
