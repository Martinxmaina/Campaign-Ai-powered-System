"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CurrentUserRole } from "@/lib/roles";

interface RoleContextType {
    role: CurrentUserRole;
    setRole: (role: CurrentUserRole) => void;
}

const ROLE_STORAGE_KEY = "campaign-intel-role";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<CurrentUserRole>("super-admin");

    useEffect(() => {
        const stored = localStorage.getItem(ROLE_STORAGE_KEY) as CurrentUserRole | null;
        if (stored) {
            setRoleState(stored);
        }
    }, []);

    const setRole = (nextRole: CurrentUserRole) => {
        setRoleState(nextRole);
        localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    };

    const value = useMemo(() => ({ role, setRole }), [role]);

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleContext() {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error("useRoleContext must be used inside RoleProvider");
    }
    return context;
}

