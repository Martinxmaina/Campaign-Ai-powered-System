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
        "/opposition",
        "/opposition-ads",
    ],
    research: [
        "/dashboard",
        "/sentiment",
        "/research",
        "/social",
        "/opposition",
        "/opposition-ads",
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
        "/social",
        "/opposition",
        "/opposition-ads",
    ],
    finance: ["/dashboard", "/finance", "/admin/overview", "/admin/audit-trail"],
    "call-center": ["/dashboard", "/call-center"],
    media: ["/dashboard", "/media"],
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

