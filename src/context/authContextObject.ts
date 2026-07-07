import type { Session } from "@supabase/supabase-js";
import type { Profile } from "../types";
import { createContext } from "react";

export interface AuthContextValue {
    session: Session | null;
    profile: Profile | null;
    permissions: string[];
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);