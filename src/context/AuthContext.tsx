import { useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { Profile } from "../types";
import { AuthContext } from "./authContextObject";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileAndPermissions = useCallback(async (userId: string) => {
    const [{ data: profileData, error: profileError }, { data: permData, error: permError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, role_id, roles(name)")
          .eq("id", userId)
          .single(),
        supabase.rpc("current_user_permissions"),
      ]);

    if (profileError) {
      console.error("Failed to load profile:", profileError.message);
      setProfile(null);
    } else if (profileData) {
      const rolesField = (profileData as { roles: { name: string } | { name: string }[] | null })
        .roles;
      const roleName = Array.isArray(rolesField)
        ? rolesField[0]?.name
        : rolesField?.name;

      setProfile({
        id: profileData.id,
        display_name: profileData.display_name,
        role_id: profileData.role_id,
        role_name: roleName ?? "Unknown",
      });
    }

    if (permError) {
      console.error("Failed to load permissions:", permError.message);
      setPermissions([]);
    } else {
      setPermissions((permData ?? []).map((row: { current_user_permissions: string }) => row.current_user_permissions));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadProfileAndPermissions(session.user.id);
    }
  }, [session, loadProfileAndPermissions]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfileAndPermissions(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadProfileAndPermissions(session.user.id);
      } else {
        setProfile(null);
        setPermissions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfileAndPermissions]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        permissions,
        isAuthenticated: session !== null,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
