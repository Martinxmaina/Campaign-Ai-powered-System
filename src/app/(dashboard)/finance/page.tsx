import { WorkspaceDashboardPage } from "@/components/dashboard/WorkspaceReporting";

export default function FinancePage() {
    return (
        <WorkspaceDashboardPage
            workspace="finance"
            title="Finance Dashboard"
            description="Budget, spend, runway, and finance reporting sourced from the database."
            recordsHeading="Finance reports"
            recordsDescription="Structured financial outputs available to leadership and auditors."
            recordsType="reports"
            recordColumns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "type", label: "Type", source: "subtitle" },
                { key: "date", label: "Date", source: "primary_date" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
