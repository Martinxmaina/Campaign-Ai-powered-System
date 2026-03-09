# UI Architecture and Role Mapping

## Role Switcher

- The dashboard shell exposes a **Logged in as** selector in `src/components/layout/Header.tsx`.
- Selected role is persisted in `localStorage` through `src/components/auth/RoleContext.tsx`.
- Supported roles:
  - `super-admin`
  - `campaign-manager`
  - `research`
  - `comms`
  - `finance`
  - `call-center`
  - `media`

## Role Access Rules (Simulated)

- Access rules are defined in `src/lib/roles.ts`.
- `canAccessPath(role, pathname)` handles route-prefix checks.
- `getHomeForRole(role)` defines fallback page for restricted access.
- Route-level restriction is enforced in `src/app/(dashboard)/layout.tsx` via `AccessGate`.

## Sidebar Visibility

- Sidebar section and item visibility is role-aware in `src/components/layout/Sidebar.tsx`.
- Items are rendered only if `canAccessPath(role, item.href)` returns true.
- `super-admin` can see and open all sections and pages.

## Team Workspaces

- Admin
  - `/admin/overview`
  - `/admin/users`
  - `/admin/audit-trail`
  - `/admin/system`
- Research
  - `/research`
  - `/research/reports`
  - `/research/studies`
  - `/research/social`
  - `/research/assistant`
- Communications
  - `/comms`
  - `/comms/reports`
  - `/comms/assistant`
  - plus existing shared tools like `/messaging`, `/outreach`
- Finance
  - `/finance`
  - `/finance/transactions`
  - `/finance/reports`
  - `/finance/assistant`
- Call Center
  - `/call-center`
  - `/call-center/logs`
  - `/call-center/reports`
  - `/call-center/assistant`
- Media
  - `/media`
  - `/media/performance`
  - `/media/reports`
  - `/media/assistant`

## Admin Audit Trail

- Audit/worklog UI is available at `/admin/audit-trail`.
- Current implementation uses mocked rows with:
  - timestamp
  - actor
  - role
  - action
  - module
  - record
  - result
- This page is structured to connect to backend event logs later.

