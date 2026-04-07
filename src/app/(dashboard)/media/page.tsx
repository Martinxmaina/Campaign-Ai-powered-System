import { WorkspaceDashboardPage } from "@/components/dashboard/WorkspaceReporting";

export default function MediaPage() {
    return (
        <WorkspaceDashboardPage
            workspace="media"
            title="Media & Content workspace"
            description="Creative assets, performance summaries, and reporting pulled from the database."
            recordsHeading="Media reports"
            recordsDescription="Published media reporting records for the media team."
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
