import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function MediaReportsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="media"
            title="Media reports"
            description="Reporting on creative output, channel impact, and content quality."
            recordType="reports"
            columns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "status", label: "Status", source: "status" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "date", label: "Date", source: "primary_date" },
            ]}
        />
    );
}
