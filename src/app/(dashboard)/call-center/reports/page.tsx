import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function CallCenterReportsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="call-center"
            title="Call Center reports"
            description="Operational reporting for call volume, outcomes, and escalations."
            recordType="reports"
            columns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "date", label: "Date", source: "primary_date" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
