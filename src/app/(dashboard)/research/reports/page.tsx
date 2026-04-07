import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function ResearchReportsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="research"
            title="Research reports"
            description="Central list of published and in-progress research outputs."
            recordType="reports"
            columns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "type", label: "Type", source: "subtitle" },
                { key: "date", label: "Fieldwork", source: "primary_date" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
