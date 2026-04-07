import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function CommsReportsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="comms"
            title="Comms reports"
            description="Messaging outcomes, channel analytics, and campaign report outputs."
            recordType="reports"
            columns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "channel", label: "Channel", source: "subtitle" },
                { key: "date", label: "Date", source: "primary_date" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
