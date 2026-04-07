import { WorkspaceDashboardPage } from "@/components/dashboard/WorkspaceReporting";

export default function CallCenterPage() {
    return (
        <WorkspaceDashboardPage
            workspace="call-center"
            title="Call Center workspace"
            description="Call logging, issue tracking, and operator reporting from the database."
            recordsHeading="Call center reports"
            recordsDescription="Operational reports available for the call center team."
            recordsType="reports"
            recordColumns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "status", label: "Status", source: "status" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "date", label: "Date", source: "primary_date" },
            ]}
        />
    );
}
