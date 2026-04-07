import { WorkspaceDashboardPage } from "@/components/dashboard/WorkspaceReporting";

export default function OutreachPage() {
    return (
        <WorkspaceDashboardPage
            workspace="outreach"
            title="Outreach & CRM"
            description="Communication CRM and outreach reporting sourced from database records."
            recordsHeading="Outreach reports"
            recordsDescription="Leadership-facing outreach reports and summaries."
            recordsType="reports"
            recordColumns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "channel", label: "Channel", source: "subtitle" },
                { key: "date", label: "Date", source: "primary_date" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
