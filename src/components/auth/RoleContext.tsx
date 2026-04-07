"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CurrentUserRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface RoleContextType {
    role: CurrentUserRole;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function extractRole(user: User | null): CurrentUserRole {
    if (!user) return "super-admin"; // fallback for dev
    const role = user.user_metadata?.role as CurrentUserRole | undefined;
    return role ?? "super-admin";
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = "/login";
    };

    const role = extractRole(user);

    const value = useMemo(
        () => ({ role, user, loading, signOut }),
        [role, user, loading]
    );

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleContext() {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error("useRoleContext must be used inside RoleProvider");
    }
    return context;
}
