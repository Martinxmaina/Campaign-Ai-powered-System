export type CurrentUserRole =
    | "super-admin"
    | "campaign-manager"
    | "research"
    | "comms"
    | "finance"
    | "call-center"
    | "media"

export const roleLabels: Record<CurrentUserRole, string> = {
    "super-admin": "Super Admin",
    "campaign-manager": "Campaign Manager",
    research: "Research Team",
    comms: "Communications Team",
    finance: "Finance Team",
    "call-center": "Call Center",
    media: "Media & Content",
}

const rolePrefixAccess: Record<CurrentUserRole, string[]> = {
    "super-admin": ["/"],
    "campaign-manager": [
        "/dashboard",
        "/analytics",
        "/sentiment",
        "/research",
        "/outreach",
        "/messaging",
        "/events",
        "/surveys",
        "/social",
        "/war-room",
        "/performance",
        "/assistant",
        "/admin/assistant",
        "/admin/countdown",
        "/opposition",
        "/opposition-ads",
        "/candidates",
        "/candidate-intel",
        "/parties",
        "/account",
    ],
    research: [
        "/dashboard",
        "/sentiment",
        "/research",
        "/social",
        "/assistant",
        "/opposition",
        "/opposition-ads",
        "/candidates",
        "/candidate-intel",
        "/parties",
        "/account",
    ],
    comms: [
        "/dashboard",
        "/analytics",
        "/outreach",
        "/messaging",
        "/events",
        "/surveys",
        "/comms",
        "/comms/assistant",
        "/assistant",
        "/social",
        "/opposition",
        "/opposition-ads",
        "/account",
    ],
    finance: [
        "/dashboard",
        "/finance",
        "/assistant",
        "/admin/overview",
        "/admin/assistant",
        "/admin/audit-trail",
        "/account",
    ],
    "call-center": ["/dashboard", "/call-center", "/account"],
    media: ["/dashboard", "/media", "/account"],
}

const roleHomes: Record<CurrentUserRole, string> = {
    "super-admin": "/admin/overview",
    "campaign-manager": "/dashboard",
    research: "/research",
    comms: "/comms",
    finance: "/finance",
    "call-center": "/call-center",
    media: "/media",
}

export function getHomeForRole(role: CurrentUserRole): string {
    return roleHomes[role]
}

export function canAccessPath(role: CurrentUserRole, pathname: string): boolean {
    const prefixes = rolePrefixAccess[role]

    return prefixes.some((prefix) => {
        if (prefix === "/") return true
        return pathname === prefix || pathname.startsWith(`${prefix}/`)
    })
}

