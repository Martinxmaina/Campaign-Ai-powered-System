import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function CallCenterLogsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="call-center"
            title="Call logs"
            description="Database-backed call records and follow-up outcomes."
            recordType="logs"
            columns={[
                { key: "code", label: "Call ID", source: "code" },
                { key: "title", label: "Caller", source: "title", emphasize: true },
                { key: "reason", label: "Reason", source: "subtitle" },
                { key: "outcome", label: "Outcome", metaKey: "outcome" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
